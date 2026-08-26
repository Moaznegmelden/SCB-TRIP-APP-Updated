package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.Application;
import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.entity.Status;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Long> {


    // =========================================================
    // DUPLICATE APPLICATION CHECK
    // =========================================================

    boolean existsByEmployee_EmployeeIdAndTrip_TripId(
            Long employeeId,
            Long tripId
    );


    // =========================================================
    // EMPLOYEE APPLICATIONS
    // =========================================================

    List<Application> findByEmployee(
            Employee employee
    );


    List<Application> findByEmployee_EmployeeId(
            Long employeeId
    );


    // =========================================================
    // TRIP APPLICATIONS
    // =========================================================

    List<Application> findByTrip(
            Trip trip
    );


    // =========================================================
    // STATUS
    // =========================================================

    List<Application> findByStatus(
            Status status
    );


    List<Application> findByStatus_StatusName(
            String statusName
    );


    // =========================================================
    // LINE MANAGER
    //
    // All applications belonging to employees
    // directly managed by this manager.
    // =========================================================

    List<Application> findByEmployee_Manager_EmployeeId(
            Long managerId
    );


    // =========================================================
    // LINE MANAGER - PENDING TASKS
    //
    // Only applications waiting for the manager's decision.
    // =========================================================

    List<Application>
    findByEmployee_Manager_EmployeeIdAndStatus_StatusName(
            Long managerId,
            String statusName
    );


    // =========================================================
    // TRIP + STATUS
    // =========================================================

    List<Application>
    findByTrip_TripIdAndStatus_StatusName(
            Long tripId,
            String statusName
    );


    // =========================================================
    // TRIP + MULTIPLE STATUSES
    // =========================================================

    @Query("""
        SELECT a
        FROM Application a
        WHERE a.trip.tripId = :tripId
        AND a.status.statusName IN :statusNames
    """)
    List<Application> findByTripIdAndStatusNames(
            @Param("tripId") Long tripId,
            @Param("statusNames") List<String> statusNames
    );


    // =========================================================
    // EMPLOYEE - COMPLETED HISTORY
    //
    // Only this employee's applications.
    //
    // Newest result first based on the actual creation/
    // submission timestamp.
    // =========================================================

    @Query("""
        SELECT a
        FROM Application a
        WHERE a.employee.employeeId = :employeeId
        AND a.status.statusName IN :statusNames
        ORDER BY a.createdAt DESC
    """)
    List<Application> findHistoryByEmployeeId(
            @Param("employeeId") Long employeeId,
            @Param("statusNames") List<String> statusNames
    );


    // =========================================================
    // EMPLOYEE - ALL REQUESTS
    //
    // Explicitly ordered by submission time.
    // =========================================================

    @Query("""
        SELECT a
        FROM Application a
        WHERE a.employee.employeeId = :employeeId
        ORDER BY a.createdAt DESC
    """)
    List<Application> findMyApplicationsOrdered(
            @Param("employeeId") Long employeeId
    );


    // =========================================================
    // FCFS SELECTION
    //
    // Oldest applications first.
    // =========================================================

    @Query("""
        SELECT a
        FROM Application a
        WHERE a.trip.tripId = :tripId
        AND a.status.statusName = :statusName
        ORDER BY a.createdAt ASC
    """)
    List<Application> findForFifoSelection(
            @Param("tripId") Long tripId,
            @Param("statusName") String statusName
    );

    // =========================================================
// SELECTION - ALL ACTIVE TRIP APPLICATIONS
// =========================================================

    @Query("""
    SELECT a
    FROM Application a
    WHERE a.trip.status.statusName = 'ACTIVE'
    ORDER BY a.createdAt ASC
""")
    List<Application> findAllActiveTripApplicationsOrderByCreatedAtAsc();


// =========================================================
// SELECTION - ONE TRIP
// =========================================================

    List<Application> findByTrip_TripIdOrderByCreatedAtAsc(
            Long tripId
    );


// =========================================================
// SELECTION - ONE BATCH
// =========================================================

    List<Application> findByBatch_BatchIdOrderByCreatedAtAsc(
            Long batchId
    );


// =========================================================
// SELECTION - TRIP + BATCH + STATUS
// =========================================================

    List<Application>
    findByTrip_TripIdAndBatch_BatchIdAndStatus_StatusName(
            Long tripId,
            Long batchId,
            String statusName
    );
}