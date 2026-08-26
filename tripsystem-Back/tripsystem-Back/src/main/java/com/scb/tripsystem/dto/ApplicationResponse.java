package com.scb.tripsystem.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ApplicationResponse {

    private Long applicationId;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private Long tripId;
    private String tripTitle;
    private String destination;
    private Long batchId;
    private String statusName;
    private String transportType;
    private String pickupPoint;
    private Integer roomsRequested;
    private BigDecimal totalPrice;
    private String selectionMethod;
    private LocalDateTime selectedAt;
    private LocalDateTime submittedAt;
    private List<ParticipantResponse> participants;

    public ApplicationResponse() {}

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTripTitle() { return tripTitle; }
    public void setTripTitle(String tripTitle) { this.tripTitle = tripTitle; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }

    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }

    public String getTransportType() { return transportType; }
    public void setTransportType(String transportType) { this.transportType = transportType; }

    public String getPickupPoint() { return pickupPoint; }
    public void setPickupPoint(String pickupPoint) { this.pickupPoint = pickupPoint; }

    public Integer getRoomsRequested() { return roomsRequested; }
    public void setRoomsRequested(Integer roomsRequested) { this.roomsRequested = roomsRequested; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getSelectionMethod() { return selectionMethod; }
    public void setSelectionMethod(String selectionMethod) { this.selectionMethod = selectionMethod; }

    public LocalDateTime getSelectedAt() { return selectedAt; }
    public void setSelectedAt(LocalDateTime selectedAt) { this.selectedAt = selectedAt; }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public List<ParticipantResponse> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantResponse> participants) { this.participants = participants; }
}