package com.scb.tripsystem.controller;

import com.scb.tripsystem.repository.EmployeeRepository;
import com.scb.tripsystem.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        System.out.println("LOGIN USERNAME: " + username);
        System.out.println("USER FOUND: " +
                employeeRepository.findByEmployeeNumber(username).isPresent());

        // -------------------------
        // Authenticate username/password
        // -------------------------

        Authentication authentication;

        try {

            authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    password
                            )
                    );

            System.out.println("=================================");
            System.out.println("LOGIN AUTHENTICATION SUCCESS");
            System.out.println("USER: " + username);
            System.out.println("=================================");

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

        } catch (Exception e) {

            System.out.println("=================================");
            System.out.println("LOGIN AUTHENTICATION FAILED");
            System.out.println("USER: " + username);
            System.out.println("ERROR TYPE: " + e.getClass().getName());
            System.out.println("ERROR MESSAGE: " + e.getMessage());
            System.out.println("=================================");

            throw e;
        }

        // -------------------------
        // Get employee from database
        // -------------------------

        var employee = employeeRepository
                .findByEmployeeNumber(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // -------------------------
        // Get role
        // -------------------------

        String role =
                employee.getRole() != null
                        ? employee.getRole().getRoleName()
                        : "EMPLOYEE";

        // -------------------------
        // Generate JWT
        // -------------------------

        String token = jwtService.generateToken(
                (org.springframework.security.core.userdetails.UserDetails)
                        authentication.getPrincipal(),
                employee.getEmployeeId(),
                role
        );

        // -------------------------
        // Return login response
        // -------------------------

        return ResponseEntity.ok(
                Map.of(
                        "employeeId",
                        employee.getEmployeeId(),

                        "employeeNumber",
                        employee.getEmployeeNumber(),

                        "fullName",
                        employee.getFullName(),

                        "email",
                        employee.getEmail() != null
                                ? employee.getEmail()
                                : "",

                        "role",
                        role,

                        "token",
                        token
                )
        );
    }


    // =========================
    // ENCODE PASSWORD
    // =========================

    @PostMapping("/encode")
    public ResponseEntity<String> encodePassword(
            @RequestBody Map<String, String> body) {

        String raw = body.get("password");

        return ResponseEntity.ok(
                passwordEncoder.encode(raw)
        );
    }
}