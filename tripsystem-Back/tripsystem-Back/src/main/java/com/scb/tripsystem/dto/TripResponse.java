package com.scb.tripsystem.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TripResponse {

    private Long tripId;
    private String title;
    private String destination;
    private LocalDateTime registrationOpen;
    private LocalDateTime registrationClose;
    private Integer durationDays;
    private String statusName;
    private String createdByName;
    private LocalDateTime createdAt;
    private List<BatchResponse> batches;

    public TripResponse() {}

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDateTime getRegistrationOpen() { return registrationOpen; }
    public void setRegistrationOpen(LocalDateTime registrationOpen) { this.registrationOpen = registrationOpen; }

    public LocalDateTime getRegistrationClose() { return registrationClose; }
    public void setRegistrationClose(LocalDateTime registrationClose) { this.registrationClose = registrationClose; }

    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }

    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<BatchResponse> getBatches() { return batches; }
    public void setBatches(List<BatchResponse> batches) { this.batches = batches; }
}