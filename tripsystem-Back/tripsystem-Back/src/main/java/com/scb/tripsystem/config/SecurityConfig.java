package com.scb.tripsystem.config;

import com.scb.tripsystem.security.CustomUserDetailsService;
import com.scb.tripsystem.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =========================
                // CSRF
                // =========================

                .csrf(csrf -> csrf.disable())


                // =========================
                // CORS
                // =========================

                .cors(cors -> {})


                // =========================
                // SESSION
                // =========================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =========================
                // AUTHORIZATION
                // =========================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------
                        // PUBLIC
                        // -------------------------

                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()



                                // =========================
                                // STATUSES
                                // =========================

                                // All authenticated users can read statuses
                                .requestMatchers(
                                        "/api/statuses"
                                ).hasAnyRole(
                                        "EMPLOYEE",
                                        "LINE_MANAGER",
                                        "HR_ADMIN",
                                        "HR_MANAGER"
                                )




                        // =========================
                        // ACTIVE TRIPS
                        // =========================

                        .requestMatchers(
                                "/api/trips/active"
                        ).hasAnyRole(
                                "EMPLOYEE",
                                "LINE_MANAGER",
                                "HR_ADMIN",
                                "HR_MANAGER"
                        )


                        // =========================
                        // HR ADMIN
                        // =========================

                        .requestMatchers(
                                "/api/trips"
                        ).hasRole("HR_ADMIN")

                        .requestMatchers(
                                "/api/trips/*/batches"
                        ).hasRole("HR_ADMIN")

                        .requestMatchers(
                                "/api/trips/*/submit"
                        ).hasRole("HR_ADMIN")


                        // HR ADMIN APPLICATION TASKS
                        // Selection / processing
                        .requestMatchers(
                                "/api/applications/trip/*/ready-for-selection"
                        ).hasRole("HR_ADMIN")

                        .requestMatchers(
                                "/api/applications/trip/*/select"
                        ).hasRole("HR_ADMIN")


                        // =========================
                        // HR MANAGER
                        // =========================

                        // HR Manager approves trips
                        // created/submitted by HR Admin

                        .requestMatchers(
                                "/api/trips/pending"
                        ).hasRole("HR_MANAGER")

                        .requestMatchers(
                                "/api/trips/*/approve"
                        ).hasRole("HR_MANAGER")

                        .requestMatchers(
                                "/api/trips/*/reject"
                        ).hasRole("HR_MANAGER")

                        .requestMatchers(
                                "/api/trips/*/return"
                        ).hasRole("HR_MANAGER")


                        // =========================
                        // LINE MANAGER
                        // =========================

                        // Applications of
                        // employees under this manager

                        .requestMatchers(
                                "/api/applications/manager/**"
                        ).hasRole("LINE_MANAGER")

                        .requestMatchers(
                                "/api/applications/*/approve"
                        ).hasRole("LINE_MANAGER")

                        .requestMatchers(
                                "/api/applications/*/reject"
                        ).hasRole("LINE_MANAGER")


                                // =========================
                               // EMPLOYEE / PERSONAL REQUESTS
                              // =========================

                                .requestMatchers(
                                        "/api/applications"
                                ).hasAnyRole(
                                        "EMPLOYEE",
                                        "LINE_MANAGER",
                                        "HR_ADMIN",
                                        "HR_MANAGER"
                                )

                                .requestMatchers(
                                        "/api/applications/my"
                                ).hasAnyRole(
                                        "EMPLOYEE",
                                        "LINE_MANAGER",
                                        "HR_ADMIN",
                                        "HR_MANAGER"
                                )


                        // =========================
                        // AUTHENTICATED USERS
                        // =========================

                        .requestMatchers(
                                "/api/trips/*"
                        ).authenticated()

                        .requestMatchers(
                                "/api/applications/*"
                        ).authenticated()


                        // =========================
                        // EVERYTHING ELSE
                        // =========================

                        .anyRequest().authenticated()
                )


                // =========================
                // USER DETAILS
                // =========================

                .userDetailsService(userDetailsService)


                // =========================
                // JWT FILTER
                // =========================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }


    // =========================
    // PASSWORD ENCODER
    // =========================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =========================
    // AUTHENTICATION MANAGER
    // =========================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config)
            throws Exception {

        return config.getAuthenticationManager();
    }
}