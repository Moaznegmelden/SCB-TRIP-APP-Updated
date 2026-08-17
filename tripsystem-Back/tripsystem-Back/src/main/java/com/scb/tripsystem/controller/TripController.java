package com.scb.tripsystem.controller;

import com.scb.tripsystem.dto.*;
import com.scb.tripsystem.entity.Batch;
import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.entity.Trip;
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

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }



    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@RequestBody TripCreateRequest request,
                                                   @RequestParam Long createdById) {
        Employee createdBy = new Employee();
        createdBy.setEmployeeId(createdById);

        Trip trip = new Trip();
        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setRegistrationOpen(request.getRegistrationOpen());
        trip.setRegistrationClose(request.getRegistrationClose());
        trip.setDurationDays(request.getDurationDays());

        Trip saved = tripService.createTrip(trip, createdBy);
        return ResponseEntity.ok(toTripResponse(saved));
    }

    @PostMapping("/{tripId}/batches")
    public ResponseEntity<BatchResponse> addBatch(@PathVariable Long tripId,
                                                  @RequestBody BatchRequest request,
                                                  @RequestParam Long createdById) {
        Employee createdBy = new Employee();
        createdBy.setEmployeeId(createdById);

        Batch batch = new Batch();
        batch.setStartDate(request.getStartDate());
        batch.setEndDate(request.getEndDate());
        batch.setNumberOfRooms(request.getNumberOfRooms());

        Batch saved = tripService.addBatch(tripId, batch, createdBy);
        return ResponseEntity.ok(toBatchResponse(saved));
    }

    @PostMapping("/{tripId}/submit")
    public ResponseEntity<TripResponse> submitForApproval(@PathVariable Long tripId) {
        Trip updated = tripService.submitForApproval(tripId);
        return ResponseEntity.ok(toTripResponse(updated));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TripResponse>> getPendingTrips() {
        List<TripResponse> list = tripService.getPendingApprovalTrips()
                .stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{tripId}/approve")
    public ResponseEntity<TripResponse> approveTrip(@PathVariable Long tripId,
                                                    @RequestParam Long managerId) {
        Employee manager = new Employee();
        manager.setEmployeeId(managerId);

        Trip updated = tripService.approveTrip(tripId, manager);
        return ResponseEntity.ok(toTripResponse(updated));
    }

    @PostMapping("/{tripId}/reject")
    public ResponseEntity<TripResponse> rejectTrip(@PathVariable Long tripId,
                                                   @RequestParam Long managerId,
                                                   @RequestBody ManagerDecisionRequest request) {
        Employee manager = new Employee();
        manager.setEmployeeId(managerId);

        Trip updated = tripService.rejectTrip(tripId, manager, request.getComments());
        return ResponseEntity.ok(toTripResponse(updated));
    }

    @PostMapping("/{tripId}/return")
    public ResponseEntity<TripResponse> returnTrip(@PathVariable Long tripId,
                                                   @RequestParam Long managerId,
                                                   @RequestBody ManagerDecisionRequest request) {
        Employee manager = new Employee();
        manager.setEmployeeId(managerId);

        Trip updated = tripService.returnTrip(tripId, manager, request.getComments());
        return ResponseEntity.ok(toTripResponse(updated));
    }



    @GetMapping("/active")
    public ResponseEntity<List<TripResponse>> getActiveTrips() {
        List<TripResponse> list = tripService.getActiveTrips()
                .stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long tripId) {
        Trip trip = tripService.getTripById(tripId);
        return ResponseEntity.ok(toTripResponse(trip));
    }



    private TripResponse toTripResponse(Trip trip) {
        TripResponse dto = new TripResponse();
        dto.setTripId(trip.getTripId());
        dto.setTitle(trip.getTitle());
        dto.setDestination(trip.getDestination());
        dto.setRegistrationOpen(trip.getRegistrationOpen());
        dto.setRegistrationClose(trip.getRegistrationClose());
        dto.setDurationDays(trip.getDurationDays());
        dto.setCreatedAt(trip.getCreatedAt());

        if (trip.getStatus() != null) {
            dto.setStatusName(trip.getStatus().getStatusName());
        }
        if (trip.getCreatedBy() != null) {
            dto.setCreatedByName(trip.getCreatedBy().getFullName());
        }
        if (trip.getBatches() != null) {
            dto.setBatches(trip.getBatches().stream()
                    .map(this::toBatchResponse)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private BatchResponse toBatchResponse(Batch batch) {
        BatchResponse dto = new BatchResponse();
        dto.setBatchId(batch.getBatchId());
        dto.setStartDate(batch.getStartDate());
        dto.setEndDate(batch.getEndDate());
        dto.setNumberOfRooms(batch.getNumberOfRooms());
        dto.setIsActive(batch.getIsActive());
        return dto;
    }
}