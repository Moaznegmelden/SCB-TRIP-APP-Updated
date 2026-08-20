package com.scb.tripsystem.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;


    // =========================
    // SECRET KEY
    // =========================

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }


    // =========================
    // GENERATE TOKEN
    // =========================

    public String generateToken(
            UserDetails userDetails,
            Long employeeId,
            String role
    ) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("employeeId", employeeId);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + jwtExpiration
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }


    // =========================
    // EXTRACT USERNAME
    // =========================

    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }


    // =========================
    // EXTRACT EMPLOYEE ID
    // =========================

    public Long extractEmployeeId(String token) {

        return extractClaim(
                token,
                claims -> {

                    Object value =
                            claims.get("employeeId");

                    if (value instanceof Number number) {
                        return number.longValue();
                    }

                    return Long.valueOf(
                            value.toString()
                    );
                }
        );
    }


    // =========================
    // EXTRACT ROLE
    // =========================

    public String extractRole(String token) {

        return extractClaim(
                token,
                claims -> claims.get("role", String.class)
        );
    }


    // =========================
    // EXTRACT CLAIM
    // =========================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver
    ) {

        Claims claims =
                extractAllClaims(token);

        return resolver.apply(claims);
    }


    // =========================
    // EXTRACT ALL CLAIMS
    // =========================

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    // =========================
    // VALIDATE TOKEN
    // =========================

    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {

        try {

            final String username =
                    extractUsername(token);

            return username.equals(
                    userDetails.getUsername()
            )
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }


    // =========================
    // CHECK EXPIRATION
    // =========================

    private boolean isTokenExpired(
            String token
    ) {

        return extractExpiration(token)
                .before(new Date());
    }


    // =========================
    // EXTRACT EXPIRATION
    // =========================

    private Date extractExpiration(
            String token
    ) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }
}