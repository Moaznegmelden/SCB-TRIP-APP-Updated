package com.scb.tripsystem.security;

import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.repository.EmployeeRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(
            EmployeeRepository employeeRepository) {

        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Employee employee = employeeRepository
                .findByEmployeeNumber(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + username
                        )
                );

        if (Boolean.FALSE.equals(employee.getIsActive())) {

            throw new UsernameNotFoundException(
                    "User is inactive"
            );
        }

        String roleName = "EMPLOYEE";

        if (employee.getRole() != null) {
            roleName = employee.getRole().getRoleName();
        }

        System.out.println("=================================");
        System.out.println("AUTH USER: " + employee.getEmployeeNumber());
        System.out.println("AUTH ROLE: " + roleName);
        System.out.println("AUTHORITY: ROLE_" + roleName);
        System.out.println("=================================");

        return User.builder()
                .username(employee.getEmployeeNumber())
                .password(employee.getPassword())
                .authorities(
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + roleName
                                )
                        )
                )
                .build();
    }
}