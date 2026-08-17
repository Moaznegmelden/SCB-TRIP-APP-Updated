package com.scb.tripsystem.config;

import com.scb.tripsystem.entity.Batch;
import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.entity.Status;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.entity.Role;
import com.scb.tripsystem.repository.BatchRepository;
import com.scb.tripsystem.repository.EmployeeRepository;
import com.scb.tripsystem.repository.StatusRepository;
import com.scb.tripsystem.repository.TripRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import com.scb.tripsystem.repository.RoleRepository;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(StatusRepository statusRepository,
                                      EmployeeRepository employeeRepository,
                                      RoleRepository roleRepository,
                                      TripRepository tripRepository,
                                      BatchRepository batchRepository) {
        return args -> {
            if (statusRepository.count() == 0) {
                Status draft = new Status();
                draft.setStatusName("DRAFT");
                statusRepository.save(draft);

                Status pending = new Status();
                pending.setStatusName("PENDING_APPROVAL");
                statusRepository.save(pending);

                Status active = new Status();
                active.setStatusName("ACTIVE");
                statusRepository.save(active);

                Status cancelled = new Status();
                cancelled.setStatusName("CANCELLED");
                statusRepository.save(cancelled);
            }

            if (roleRepository.count() == 0) {
                Role employeeRole = new Role();
                employeeRole.setRoleName("EMPLOYEE");
                employeeRole.setIsActive(true);
                roleRepository.save(employeeRole);
            }

            Role employeeRole = roleRepository
                    .findByRoleName("EMPLOYEE")
                    .orElseThrow();

            if (employeeRepository.count() == 0) {
                Employee employee = new Employee();
                employee.setEmployeeNumber("EMP001");
                employee.setFullName("Ahmed Hassan");
//                employee.setPassword("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGad1zM2o2j7s5gK6");
                employee.setIsActive(true);
                employee.setCreatedAt(LocalDateTime.now());
                employee = employeeRepository.save(employee);
                employee.setCreatedBy(employee);
                employeeRepository.save(employee);
            }

            Employee employee = employeeRepository
                    .findByEmployeeNumber("EMP001")
                    .orElseThrow();

            if (employee.getRole() == null) {
                employee.setRole(employeeRole);
                employeeRepository.save(employee);
            }

            if (tripRepository.count() == 0) {
                Status activeStatus = statusRepository.findByStatusName("ACTIVE").orElseThrow();
                Employee creator = employeeRepository.findByEmployeeNumber("EMP001").orElseThrow();

                Trip trip = new Trip();
                trip.setTitle("Steigenberger El Gouna");
                trip.setDestination("El Gouna");
                trip.setRegistrationOpen(LocalDateTime.of(2026, 7, 20, 9, 0));
                trip.setRegistrationClose(LocalDateTime.of(2026, 7, 27, 16, 0));
                trip.setDurationDays(5);
                trip.setIsActive(true);
                trip.setStatus(activeStatus);
                trip.setCreatedBy(creator);
                trip.setCreatedAt(LocalDateTime.now());
                trip = tripRepository.save(trip);

                Batch batch = new Batch();
                batch.setTrip(trip);
                batch.setStartDate(java.time.LocalDate.of(2026, 7, 26));
                batch.setEndDate(java.time.LocalDate.of(2026, 7, 30));
                batch.setNumberOfRooms(10);
                batch.setCreatedBy(creator);
                batch.setCreatedAt(LocalDateTime.now());
                batch.setIsActive(true);
                batchRepository.save(batch);
            }
        };
    }
}
