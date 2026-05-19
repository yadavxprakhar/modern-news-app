package com.news.controller;

import com.news.model.UserPreference;
import com.news.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the custom preferences for the currently logged-in user
     */
    @GetMapping("/preferences")
    public ResponseEntity<UserPreference> getUserPreference(Principal principal) {
        UserPreference preference = userService.getUserPreference(principal.getName());
        return ResponseEntity.ok(preference);
    }

    /**
     * Updates custom categories or themes for the currently logged-in user
     */
    @PutMapping("/preferences")
    public ResponseEntity<UserPreference> updateUserPreference(Principal principal,
                                                               @RequestBody UserPreference updatedPreference) {
        UserPreference preference = userService.updateUserPreference(principal.getName(), updatedPreference);
        return ResponseEntity.ok(preference);
    }

    /**
     * Returns basic profile properties (username, email) for authenticated session indicators
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, String>> getUserProfile(Principal principal) {
        // Fetch preferences/user details
        UserPreference preference = userService.getUserPreference(principal.getName());
        
        Map<String, String> profile = new HashMap<>();
        profile.put("username", principal.getName());
        profile.put("email", preference.getUser().getEmail());
        
        return ResponseEntity.ok(profile);
    }
}
