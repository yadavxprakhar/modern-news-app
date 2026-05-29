package com.news.service;

import com.news.dto.JwtAuthResponse;
import com.news.dto.LoginRequest;
import com.news.dto.SignUpRequest;
import com.news.dto.RegisterVerifyRequest;
import com.news.model.User;
import com.news.model.UserPreference;
import com.news.model.RegistrationOtp;
import com.news.repository.UserPreferenceRepository;
import com.news.repository.UserRepository;
import com.news.repository.RegistrationOtpRepository;
import com.news.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final RegistrationOtpRepository registrationOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
                       UserPreferenceRepository userPreferenceRepository,
                       RegistrationOtpRepository registrationOtpRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.registrationOtpRepository = registrationOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    /**
     * Registers a new user, hashes their password, sets up default preferences, and returns JWT credentials.
     */
    @Transactional
    public JwtAuthResponse registerUser(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // 1. Create and save the new User
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .passwordHash(passwordEncoder.encode(signUpRequest.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        // 2. Initialize default Preferences linked to the User
        UserPreference preference = UserPreference.builder()
                .user(savedUser)
                .theme("light")
                .notificationsEnabled(true)
                .build();

        userPreferenceRepository.save(preference);

        // 3. Generate initial session tokens
        String accessToken = tokenProvider.generateAccessToken(savedUser.getUsername());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getUsername());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .build();
    }

    /**
     * Initiates the registration process: checks credentials, generates OTP, saves pending details, and emails OTP.
     */
    @Transactional
    public void initiateRegistration(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // 1. Generate 6-digit secure OTP
        SecureRandom random = new SecureRandom();
        String otp = String.format("%06d", random.nextInt(1000000));

        // 2. Clean up any existing registration OTP for the same email (force transaction execution safely)
        registrationOtpRepository.findByEmail(signUpRequest.getEmail())
                .ifPresent(existing -> registrationOtpRepository.delete(existing));

        // 3. Save pending registration details with the OTP
        RegistrationOtp registrationOtp = RegistrationOtp.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .passwordHash(passwordEncoder.encode(signUpRequest.getPassword()))
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        registrationOtpRepository.save(registrationOtp);

        // 4. Send the real OTP email
        emailService.sendOtpEmail(signUpRequest.getEmail(), signUpRequest.getUsername(), otp);
    }

    /**
     * Completes registration: verifies the OTP, creates User, and issues JWT tokens.
     */
    @Transactional
    public JwtAuthResponse completeRegistration(RegisterVerifyRequest verifyRequest) {
        // 1. Fetch pending registration details
        RegistrationOtp registrationOtp = registrationOtpRepository.findByEmail(verifyRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Registration session expired or not found. Please initiate sign-up again."));

        // 2. Check if OTP has expired
        if (registrationOtp.isExpired()) {
            registrationOtpRepository.delete(registrationOtp);
            throw new IllegalArgumentException("Verification code has expired. Please request a new registration.");
        }

        // 3. Verify OTP code match
        if (!registrationOtp.getOtp().equals(verifyRequest.getOtp())) {
            throw new IllegalArgumentException("Incorrect email verification code. Please check and try again.");
        }

        // 4. Double check one last time that username/email didn't get taken in the meantime
        if (userRepository.existsByUsername(registrationOtp.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(registrationOtp.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // 5. Build and save the official User entity
        User user = User.builder()
                .username(registrationOtp.getUsername())
                .email(registrationOtp.getEmail())
                .passwordHash(registrationOtp.getPasswordHash())
                .build();

        User savedUser = userRepository.save(user);

        // 6. Initialize default UserPreferences
        UserPreference preference = UserPreference.builder()
                .user(savedUser)
                .theme("light")
                .notificationsEnabled(true)
                .build();

        userPreferenceRepository.save(preference);

        // 7. Clean up the used registration OTP record
        registrationOtpRepository.delete(registrationOtp);

        // 8. Issue standard JWT Auth tokens
        String accessToken = tokenProvider.generateAccessToken(savedUser.getUsername());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getUsername());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .build();
    }

    /**
     * Authenticates existing user credentials, registers security context, and returns active JWT session tokens.
     */
    public JwtAuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User profile not found after authentication"));

        String accessToken = tokenProvider.generateAccessToken(username);
        String refreshToken = tokenProvider.generateRefreshToken(username);

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    /**
     * Accepts a validated refresh token and generates a brand-new access token transparently.
     */
    public JwtAuthResponse refreshAccessToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User profile associated with token not found"));

        String newAccessToken = tokenProvider.generateAccessToken(username);

        return JwtAuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    /**
     * Retrieves preferences for a given user.
     */
    @Transactional(readOnly = true)
    public UserPreference getUserPreference(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return userPreferenceRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Preferences not initialized for user"));
    }

    /**
     * Updates preferences for a given user.
     */
    @Transactional
    public UserPreference updateUserPreference(String username, UserPreference updatedPreference) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        UserPreference preference = userPreferenceRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Preferences not initialized for user"));

        preference.setFavoriteCategories(updatedPreference.getFavoriteCategories());
        preference.setTheme(updatedPreference.getTheme());
        preference.setNotificationsEnabled(updatedPreference.isNotificationsEnabled());

        return userPreferenceRepository.save(preference);
    }
}

