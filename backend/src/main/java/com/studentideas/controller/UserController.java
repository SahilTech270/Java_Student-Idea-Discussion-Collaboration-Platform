package com.studentideas.controller;

import com.studentideas.model.User;
import com.studentideas.model.Role;
import com.studentideas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow frontend access
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Direct password saving for simplicity in this step, will update with BCrypt
    // later if needed
    // Actually, let's just simulate it or wait for SecurityConfig

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }

        // Default role if not provided
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest, jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
        try {
            org.springframework.security.core.Authentication authentication = authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(), loginRequest.getPassword()));

            org.springframework.security.core.context.SecurityContext context = org.springframework.security.core.context.SecurityContextHolder
                    .createEmptyContext();
            context.setAuthentication(authentication);
            org.springframework.security.core.context.SecurityContextHolder.setContext(context);

            // Persist the context in the session
            new org.springframework.security.web.context.HttpSessionSecurityContextRepository()
                    .saveContext(context, request, response);

            // Fetch validation full user object to return
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
            // user.setPassword(null); // Not needed with WRITE_ONLY annotation
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        // Principal might be email or username depending on UserDetailsService
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = userRepository.findByEmail(username).orElse(null);
        }
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }
}
