package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.Application;
import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByEmployee_EmployeeIdAndTrip_TripId(Long employeeId, Long tripId);

    List<Application> findByEmployee(Employee employee);

    List<Application> findByTrip(Trip trip);

    List<Application> findByStatus(Status status);

    List<Application> findByStatus_StatusName(String statusName);

    List<Application> findByEmployee_Manager_EmployeeId(Long managerId);

    List<Application> findByTrip_TripIdAndStatus_StatusName(Long tripId, String statusName);
    @Query("SELECT a FROM Application a " +
            "WHERE a.trip.tripId = :tripId " +
            "AND a.status.statusName IN :statusNames")
    List<Application> findByTripIdAndStatusNames(
            @Param("tripId") Long tripId,
            @Param("statusNames") List<String> statusNames
    );
}