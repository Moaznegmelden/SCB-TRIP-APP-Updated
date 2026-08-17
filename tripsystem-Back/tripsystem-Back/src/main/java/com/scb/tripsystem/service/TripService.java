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

    public TripService(TripRepository tripRepository,
                       BatchRepository batchRepository,
                       StatusService statusService) {
        this.tripRepository = tripRepository;
        this.batchRepository = batchRepository;
        this.statusService = statusService;
    }

    /**
     * HR Operation Admin creates a new trip (status = DRAFT)
     */
    @Transactional
    public Trip createTrip(Trip trip, Employee createdBy) {
        trip.setCreatedBy(createdBy);
        trip.setCreatedAt(LocalDateTime.now());
        trip.setStatus(statusService.getByName("DRAFT"));
        return tripRepository.save(trip);
    }

    /**
     * Add a batch to an existing trip
     */
    @Transactional
    public Batch addBatch(Long tripId, Batch batch, Employee createdBy) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        batch.setTrip(trip);
        batch.setCreatedBy(createdBy);
        batch.setCreatedAt(LocalDateTime.now());
        batch.setIsActive(true);

        return batchRepository.save(batch);
    }

    /**
     * HR Operation Admin submits the trip for approval
     * Changes status from DRAFT → PENDING_APPROVAL
     */
    @Transactional
    public Trip submitForApproval(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!"DRAFT".equals(trip.getStatus().getStatusName()) &&
                !"RETURNED".equals(trip.getStatus().getStatusName())) {
            throw new RuntimeException("Only DRAFT or RETURNED trips can be submitted");
        }

        // Optional: check that the trip has at least one batch
        if (trip.getBatches() == null || trip.getBatches().isEmpty()) {
            throw new RuntimeException("Trip must have at least one batch before submitting");
        }

        trip.setStatus(statusService.getByName("PENDING_APPROVAL"));
        return tripRepository.save(trip);
    }

    /**
     * Get all trips waiting for HR Manager approval
     */
    public List<Trip> getPendingApprovalTrips() {
        return tripRepository.findByStatus_StatusName("PENDING_APPROVAL");
    }

    /**
     * Get a trip by ID
     */
    public Trip getTripById(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    /**
     * Get all Active trips (for employees)
     */
    public List<Trip> getActiveTrips() {
        return tripRepository.findByStatus_StatusName("ACTIVE");
    }
    /**
     * HR Operation Manager approves the trip → status becomes ACTIVE
     */
    @Transactional
    public Trip approveTrip(Long tripId, Employee manager) {
        Trip trip = getTripById(tripId);

        if (!"PENDING_APPROVAL".equals(trip.getStatus().getStatusName())) {
            throw new RuntimeException("Only PENDING_APPROVAL trips can be approved");
        }

        trip.setStatus(statusService.getByName("ACTIVE"));
        return tripRepository.save(trip);
    }

    /**
     * HR Operation Manager rejects the trip → status becomes CANCELLED
     */
    @Transactional
    public Trip rejectTrip(Long tripId, Employee manager, String comments) {
        Trip trip = getTripById(tripId);

        if (!"PENDING_APPROVAL".equals(trip.getStatus().getStatusName())) {
            throw new RuntimeException("Only PENDING_APPROVAL trips can be rejected");
        }

        trip.setStatus(statusService.getByName("CANCELLED"));
        // You can later save the comments in a TripHistory table if needed
        return tripRepository.save(trip);
    }

    /**
     * HR Operation Manager returns the trip with comments → status becomes RETURNED
     */
    @Transactional
    public Trip returnTrip(Long tripId, Employee manager, String comments) {
        Trip trip = getTripById(tripId);

        if (!"PENDING_APPROVAL".equals(trip.getStatus().getStatusName())) {
            throw new RuntimeException("Only PENDING_APPROVAL trips can be returned");
        }

        trip.setStatus(statusService.getByName("RETURNED"));
        return tripRepository.save(trip);
    }
}

