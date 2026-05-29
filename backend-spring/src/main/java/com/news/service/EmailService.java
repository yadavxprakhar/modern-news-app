package com.news.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Dispatches a highly styled premium registration OTP email to the user
     */
    public void sendOtpEmail(String toEmail, String username, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("⚡ Verify your e-akhbar Account");

            // Premium HTML Email Template styled with professional aesthetics
            String htmlContent = "<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d0e12; color: #ffffff; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f222e;\">" +
                    "  <div style=\"text-align: center; margin-bottom: 30px;\">" +
                    "    <h1 style=\"color: #00e6ff; font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: -1px;\">⚡ e-akhbar</h1>" +
                    "    <p style=\"color: #8f9bb3; font-size: 0.95rem; margin: 5px 0 0 0;\">A premium global news experience</p>" +
                    "  </div>" +
                    "  <div style=\"background-color: #161824; border-radius: 8px; padding: 30px; border: 1px solid #23273a;\">" +
                    "    <p style=\"font-size: 1.1rem; color: #e4e6eb; margin-top: 0;\">Hello <strong>" + username + "</strong>,</p>" +
                    "    <p style=\"color: #b0b8c9; font-size: 1rem; line-height: 1.6;\">Thank you for registering with e-akhbar. To complete your account sign-up and verify your email, please use the secure one-time verification code below:</p>" +
                    "    <div style=\"text-align: center; margin: 30px 0;\">" +
                    "      <div style=\"display: inline-block; background: linear-gradient(135deg, #00e6ff 0%, #0077ff 100%); color: #ffffff; font-size: 2.5rem; font-weight: 800; padding: 15px 40px; border-radius: 8px; letter-spacing: 6px; box-shadow: 0 4px 15px rgba(0, 230, 255, 0.25);\">" + otp + "</div>" +
                    "    </div>" +
                    "    <p style=\"color: #8f9bb3; font-size: 0.85rem; line-height: 1.5; margin-bottom: 0;\">This OTP is private and valid for <strong>5 minutes</strong>. If you did not initiate this request, you can safely ignore this email.</p>" +
                    "  </div>" +
                    "  <div style=\"text-align: center; margin-top: 30px; color: #626c7d; font-size: 0.8rem;\">" +
                    "    <p style=\"margin: 0;\">© 2026 e-akhbar. All rights reserved.</p>" +
                    "    <p style=\"margin: 5px 0 0 0;\">Designed with ❤️ for premium readers.</p>" +
                    "  </div>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✓ [OTP EMAIL SERVICE] Premium registration OTP email successfully dispatched to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("✗ [OTP EMAIL SERVICE] Failed to send email to " + toEmail + " due to error: " + e.getMessage());
            throw new RuntimeException("Email dispatch failed. Please check your system SMTP configurations.", e);
        }
    }
}
