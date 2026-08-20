package com.scb.tripsystem.service;

import com.scb.tripsystem.entity.*;
import com.scb.tripsystem.repository.BatchRepository;
import com.scb.tripsystem.repository.TripRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final BatchRepository batchRepository;
    private final StatusService statusService;


    public TripService(
            TripRepository tripRepository,
            BatchRepository batchRepository,
            StatusService statusService) {

        this.tripRepository =
                tripRepository;

        this.batchRepository =
                batchRepository;

        this.statusService =
                statusService;
    }


    // =========================================================
    // HR ADMIN - CREATE TRIP
    // =========================================================

    @Transactional
    public Trip createTrip(
            Trip trip,
            Employee createdBy) {

        requireRole(
                createdBy,
                "HR_ADMIN"
        );


        trip.setCreatedBy(
                createdBy
        );

        trip.setCreatedAt(
                LocalDateTime.now()
        );

        trip.setStatus(
                statusService.getByName(
                        "DRAFT"
                )
        );


        return tripRepository.save(
                trip
        );
    }


    // =========================================================
    // HR ADMIN - ADD BATCH
    // =========================================================

    @Transactional
    public Batch addBatch(

            Long tripId,

            Batch batch,

            Employee createdBy) {

        requireRole(
                createdBy,
                "HR_ADMIN"
        );


        Trip trip =
                tripRepository
                        .findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found"
                                )
                        );


        batch.setTrip(
                trip
        );

        batch.setCreatedBy(
                createdBy
        );

        batch.setCreatedAt(
                LocalDateTime.now()
        );

        batch.setIsActive(
                true
        );


        return batchRepository.save(
                batch
        );
    }


    // =========================================================
    // HR ADMIN - SUBMIT
    // =========================================================

    @Transactional
    public Trip submitForApproval(
            Long tripId) {

        Trip trip =
                tripRepository
                        .findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found"
                                )
                        );


        if (!"DRAFT".equals(
                trip.getStatus()
                        .getStatusName())
                &&
                !"RETURNED".equals(
                        trip.getStatus()
                                .getStatusName())
        ) {

            throw new RuntimeException(
                    "Only DRAFT or RETURNED trips can be submitted"
            );
        }


        if (
                trip.getBatches() == null
                        ||
                        trip.getBatches().isEmpty()
        ) {

            throw new RuntimeException(
                    "Trip must have at least one batch before submitting"
            );
        }


        trip.setStatus(
                statusService.getByName(
                        "PENDING_APPROVAL"
                )
        );


        return tripRepository.save(
                trip
        );
    }


    // =========================================================
    // HR MANAGER - PENDING
    // =========================================================

    public List<Trip>
    getPendingApprovalTrips() {

        return tripRepository
                .findByStatus_StatusName(
                        "PENDING_APPROVAL"
                );
    }


    // =========================================================
    // COMMON - GET TRIP
    // =========================================================

    public Trip getTripById(
            Long tripId) {

        return tripRepository
                .findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found"
                        )
                );
    }


    // =========================================================
    // COMMON - ACTIVE TRIPS
    // =========================================================

    public List<Trip>
    getActiveTrips() {

        return tripRepository
                .findByStatus_StatusName(
                        "ACTIVE"
                );
    }


    // =========================================================
    // HR MANAGER - APPROVE
    // =========================================================

    @Transactional
    public Trip approveTrip(

            Long tripId,

            Employee manager) {

        requireRole(
                manager,
                "HR_MANAGER"
        );


        Trip trip =
                getTripById(
                        tripId
                );


        if (!"PENDING_APPROVAL".equals(
                trip.getStatus()
                        .getStatusName())) {

            throw new RuntimeException(
                    "Only PENDING_APPROVAL trips can be approved"
            );
        }


        trip.setStatus(
                statusService.getByName(
                        "ACTIVE"
                )
        );


        return tripRepository.save(
                trip
        );
    }


    // =========================================================
    // HR MANAGER - REJECT
    // =========================================================

    @Transactional
    public Trip rejectTrip(

            Long tripId,

            Employee manager,

            String comments) {

        requireRole(
                manager,
                "HR_MANAGER"
        );


        Trip trip =
                getTripById(
                        tripId
                );


        if (!"PENDING_APPROVAL".equals(
                trip.getStatus()
                        .getStatusName())) {

            throw new RuntimeException(
                    "Only PENDING_APPROVAL trips can be rejected"
            );
        }


        trip.setStatus(
                statusService.getByName(
                        "CANCELLED"
                )
        );


        // TODO:
        // Save comments in TripHistory
        // when TripHistory is implemented.


        return tripRepository.save(
                trip
        );
    }


    // =========================================================
    // HR MANAGER - RETURN
    // =========================================================

    @Transactional
    public Trip returnTrip(

            Long tripId,

            Employee manager,

            String comments) {

        requireRole(
                manager,
                "HR_MANAGER"
        );


        Trip trip =
                getTripById(
                        tripId
                );


        if (!"PENDING_APPROVAL".equals(
                trip.getStatus()
                        .getStatusName())) {

            throw new RuntimeException(
                    "Only PENDING_APPROVAL trips can be returned"
            );
        }


        trip.setStatus(
                statusService.getByName(
                        "RETURNED"
                )
        );


        // TODO:
        // Save comments in TripHistory
        // when TripHistory is implemented.


        return tripRepository.save(
                trip
        );
    }


    // =========================================================
    // ROLE VALIDATION
    // =========================================================

    private void requireRole(
            Employee employee,
            String requiredRole) {

        if (
                employee == null
                        ||
                        employee.getRole() == null
                        ||
                        !requiredRole.equalsIgnoreCase(
                                employee.getRole()
                                        .getRoleName()
                        )
        ) {

            throw new RuntimeException(
                    "Access denied. Required role: "
                            + requiredRole
            );
        }
    }
}