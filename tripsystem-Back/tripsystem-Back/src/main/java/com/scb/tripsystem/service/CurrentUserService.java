package com.scb.tripsystem.service;

import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final EmployeeRepository employeeRepository;


    // =========================================================
    // GET CURRENT LOGGED-IN EMPLOYEE
    // =========================================================

    public Employee getCurrentEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String employeeNumber =
                authentication.getName();

        Employee employee =
                employeeRepository
                        .findByEmployeeNumber(employeeNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Current employee not found"
                                )
                        );

        System.out.println("=================================");
        System.out.println("CURRENT USER NUMBER: " + employee.getEmployeeNumber());
        System.out.println("CURRENT USER NAME: " + employee.getFullName());

        if (employee.getRole() != null) {
            System.out.println(
                    "CURRENT USER ROLE: " +
                            employee.getRole().getRoleName()
            );
        }

        System.out.println(
                "CURRENT USER ID: " +
                        employee.getEmployeeId()
        );

        System.out.println("=================================");

        return employee;
    }


    // =========================================================
    // CHECK ROLE
    // =========================================================

    public boolean hasRole(
            Employee employee,
            String roleName) {

        return employee != null
                && employee.getRole() != null
                && employee.getRole().getRoleName() != null
                && employee.getRole()
                .getRoleName()
                .equalsIgnoreCase(roleName);
    }


    // =========================================================
    // REQUIRE ROLE
    // =========================================================

    public void requireRole(
            Employee employee,
            String roleName) {

        if (!hasRole(employee, roleName)) {

            throw new RuntimeException(
                    "Access denied. Required role: "
                            + roleName
            );
        }
    }
}