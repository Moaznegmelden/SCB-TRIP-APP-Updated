/*package com.scb.tripsystem.controller;

import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

//    private final EmployeeRepository employeeRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    public AuthController(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
//        this.employeeRepository = employeeRepository;
//        this.passwordEncoder = passwordEncoder;
//    }
//
//    /**
//     * Get current logged-in user info
//     */
//    @GetMapping("/me")
//    public ResponseEntity<?> me() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        String employeeNumber = auth.getName();
//
//        Employee employee = employeeRepository.findByEmployeeNumber(employeeNumber)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        return ResponseEntity.ok(Map.of(
//                "employeeId", employee.getEmployeeId(),
//                "employeeNumber", employee.getEmployeeNumber(),
//                "fullName", employee.getFullName(),
//                "role", employee.getRole() != null ? employee.getRole().getRoleName() : null
//        ));
//    }
//
//    /**
//     * Helper to encode a password (use once to create users)
//     */
//    @PostMapping("/encode")
//    public ResponseEntity<String> encodePassword(@RequestBody Map<String, String> body) {
//        String raw = body.get("password");
//        return ResponseEntity.ok(passwordEncoder.encode(raw));
//    }
// }
package com.scb.tripsystem.controller;

import com.scb.tripsystem.repository.EmployeeRepository;
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

    public AuthController(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {

        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                username,
                                password
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        var employee = employeeRepository
                .findByEmployeeNumber(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "employeeId", employee.getEmployeeId(),
                "employeeNumber", employee.getEmployeeNumber(),
                "fullName", employee.getFullName(),
                "email", employee.getEmail() != null ? employee.getEmail() : "",
                "role", employee.getRole() != null
                        ? employee.getRole().getRoleName()
                        : "EMPLOYEE"
        ));
    }

    @PostMapping("/encode")
    public ResponseEntity<String> encodePassword(
            @RequestBody Map<String, String> body) {

        String raw = body.get("password");

        return ResponseEntity.ok(
                passwordEncoder.encode(raw)
        );
    }
}