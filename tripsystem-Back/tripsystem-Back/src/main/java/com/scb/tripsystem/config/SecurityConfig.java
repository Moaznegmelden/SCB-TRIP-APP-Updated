//package com.scb.tripsystem.security;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//public class SecurityConfig {
//
//    private final CustomUserDetailsService userDetailsService;
//
//    public SecurityConfig(CustomUserDetailsService userDetailsService) {
//        this.userDetailsService = userDetailsService;
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//
//                        .requestMatchers("/api/auth/**").permitAll()
//                        .requestMatchers("/api/**").permitAll()
//
//
//                        .requestMatchers("/api/trips").hasRole("HR_ADMIN")
//                        .requestMatchers("/api/trips/*/batches").hasRole("HR_ADMIN")
//                        .requestMatchers("/api/trips/*/submit").hasRole("HR_ADMIN")
//
//
//                        .requestMatchers("/api/trips/pending").hasRole("HR_MANAGER")
//                        .requestMatchers("/api/trips/*/approve").hasRole("HR_MANAGER")
//                        .requestMatchers("/api/trips/*/reject").hasRole("HR_MANAGER")
//                        .requestMatchers("/api/trips/*/return").hasRole("HR_MANAGER")
//                        .requestMatchers("/api/applications/trip/*/ready-for-selection").hasRole("HR_MANAGER")
//                        .requestMatchers("/api/applications/trip/*/select").hasRole("HR_MANAGER")
//
//                        // Line Manager
//                        .requestMatchers("/api/applications/manager/**").hasRole("LINE_MANAGER")
//                        .requestMatchers("/api/applications/*/approve").hasRole("LINE_MANAGER")
//                        .requestMatchers("/api/applications/*/reject").hasRole("LINE_MANAGER")
//
//                        // Employee
//                        .requestMatchers("/api/trips/active").hasAnyRole("EMPLOYEE", "LINE_MANAGER", "HR_ADMIN", "HR_MANAGER")
//                        .requestMatchers("/api/applications").hasRole("EMPLOYEE")
//                        .requestMatchers("/api/applications/my").hasRole("EMPLOYEE")
//
//                        // Authenticated users can view trip details and application history
//                        .requestMatchers("/api/trips/*").authenticated()
//                        .requestMatchers("/api/applications/*").authenticated()
//                        .requestMatchers("/api/applications/*/history").authenticated()
//
//                        .anyRequest().authenticated()
//                )
//                .userDetailsService(userDetailsService)
//                .httpBasic(basic -> {});   // simple for now (Postman / testing)
//
//        return http.build();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
//        return config.getAuthenticationManager();
//    }
//}











/*package com.scb.tripsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
 */













package com.scb.tripsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}