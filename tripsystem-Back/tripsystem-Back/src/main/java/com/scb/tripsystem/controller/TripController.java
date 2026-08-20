package com.scb.tripsystem.controller;

import com.scb.tripsystem.dto.*;
import com.scb.tripsystem.entity.Batch;
import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.service.CurrentUserService;
import com.scb.tripsystem.service.TripService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:4200")
public class TripController {

    private final TripService tripService;
    private final CurrentUserService currentUserService;


    public TripController(
            TripService tripService,
            CurrentUserService currentUserService) {

        this.tripService = tripService;
        this.currentUserService = currentUserService;
    }


    // =========================================================
    // HR ADMIN - CREATE TRIP
    // =========================================================

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @RequestBody TripCreateRequest request) {

        Employee createdBy =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                createdBy,
                "HR_ADMIN"
        );

        Trip trip = new Trip();

        trip.setTitle(
                request.getTitle()
        );

        trip.setDestination(
                request.getDestination()
        );

        trip.setRegistrationOpen(
                request.getRegistrationOpen()
        );

        trip.setRegistrationClose(
                request.getRegistrationClose()
        );

        trip.setDurationDays(
                request.getDurationDays()
        );

        Trip saved =
                tripService.createTrip(
                        trip,
                        createdBy
                );

        return ResponseEntity.ok(
                toTripResponse(saved)
        );
    }


    // =========================================================
    // HR ADMIN - ADD BATCH
    // =========================================================

    @PostMapping("/{tripId}/batches")
    public ResponseEntity<BatchResponse> addBatch(

            @PathVariable Long tripId,

            @RequestBody BatchRequest request) {

        Employee createdBy =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                createdBy,
                "HR_ADMIN"
        );

        Batch batch = new Batch();

        batch.setStartDate(
                request.getStartDate()
        );

        batch.setEndDate(
                request.getEndDate()
        );

        batch.setNumberOfRooms(
                request.getNumberOfRooms()
        );

        Batch saved =
                tripService.addBatch(
                        tripId,
                        batch,
                        createdBy
                );

        return ResponseEntity.ok(
                toBatchResponse(saved)
        );
    }


    // =========================================================
    // HR ADMIN - SUBMIT FOR APPROVAL
    // =========================================================

    @PostMapping("/{tripId}/submit")
    public ResponseEntity<TripResponse>
    submitForApproval(
            @PathVariable Long tripId) {

        Employee currentUser =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                currentUser,
                "HR_ADMIN"
        );

        Trip updated =
                tripService.submitForApproval(
                        tripId
                );

        return ResponseEntity.ok(
                toTripResponse(updated)
        );
    }


    // =========================================================
    // HR MANAGER - PENDING TRIPS
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<List<TripResponse>>
    getPendingTrips() {

        Employee currentUser =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                currentUser,
                "HR_MANAGER"
        );

        List<TripResponse> list =
                tripService
                        .getPendingApprovalTrips()
                        .stream()
                        .map(this::toTripResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // HR MANAGER - APPROVE
    // =========================================================

    @PostMapping("/{tripId}/approve")
    public ResponseEntity<TripResponse>
    approveTrip(
            @PathVariable Long tripId) {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "HR_MANAGER"
        );

        Trip updated =
                tripService.approveTrip(
                        tripId,
                        manager
                );

        return ResponseEntity.ok(
                toTripResponse(updated)
        );
    }


    // =========================================================
    // HR MANAGER - REJECT
    // =========================================================

    @PostMapping("/{tripId}/reject")
    public ResponseEntity<TripResponse>
    rejectTrip(

            @PathVariable Long tripId,

            @RequestBody
            ManagerDecisionRequest request) {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "HR_MANAGER"
        );

        String comments =
                request != null
                        ? request.getComments()
                        : "";

        Trip updated =
                tripService.rejectTrip(
                        tripId,
                        manager,
                        comments
                );

        return ResponseEntity.ok(
                toTripResponse(updated)
        );
    }


    // =========================================================
    // HR MANAGER - RETURN
    // =========================================================

    @PostMapping("/{tripId}/return")
    public ResponseEntity<TripResponse>
    returnTrip(

            @PathVariable Long tripId,

            @RequestBody
            ManagerDecisionRequest request) {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "HR_MANAGER"
        );

        String comments =
                request != null
                        ? request.getComments()
                        : "";

        Trip updated =
                tripService.returnTrip(
                        tripId,
                        manager,
                        comments
                );

        return ResponseEntity.ok(
                toTripResponse(updated)
        );
    }


    // =========================================================
    // COMMON - ACTIVE TRIPS
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<List<TripResponse>>
    getActiveTrips() {

        List<TripResponse> list =
                tripService
                        .getActiveTrips()
                        .stream()
                        .map(this::toTripResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // COMMON - TRIP DETAILS
    // =========================================================

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse>
    getTripById(
            @PathVariable Long tripId) {

        Trip trip =
                tripService.getTripById(
                        tripId
                );

        return ResponseEntity.ok(
                toTripResponse(trip)
        );
    }


    // =========================================================
    // TRIP RESPONSE
    // =========================================================

    private TripResponse toTripResponse(
            Trip trip) {

        TripResponse dto =
                new TripResponse();

        dto.setTripId(
                trip.getTripId()
        );

        dto.setTitle(
                trip.getTitle()
        );

        dto.setDestination(
                trip.getDestination()
        );

        dto.setRegistrationOpen(
                trip.getRegistrationOpen()
        );

        dto.setRegistrationClose(
                trip.getRegistrationClose()
        );

        dto.setDurationDays(
                trip.getDurationDays()
        );

        dto.setCreatedAt(
                trip.getCreatedAt()
        );


        if (trip.getStatus() != null) {

            dto.setStatusName(
                    trip.getStatus().getStatusName()
            );
        }


        if (trip.getCreatedBy() != null) {

            dto.setCreatedByName(
                    trip.getCreatedBy().getFullName()
            );
        }


        if (trip.getBatches() != null) {

            dto.setBatches(
                    trip.getBatches()
                            .stream()
                            .map(
                                    this::toBatchResponse
                            )
                            .collect(
                                    Collectors.toList()
                            )
            );
        }

        return dto;
    }


    // =========================================================
    // BATCH RESPONSE
    // =========================================================

    private BatchResponse toBatchResponse(
            Batch batch) {

        BatchResponse dto =
                new BatchResponse();

        dto.setBatchId(
                batch.getBatchId()
        );

        dto.setStartDate(
                batch.getStartDate()
        );

        dto.setEndDate(
                batch.getEndDate()
        );

        dto.setNumberOfRooms(
                batch.getNumberOfRooms()
        );

        dto.setIsActive(
                batch.getIsActive()
        );

        return dto;
    }
}