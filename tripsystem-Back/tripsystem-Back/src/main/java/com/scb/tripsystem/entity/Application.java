package com.scb.tripsystem.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status;

    @Column(name = "transport_type")
    private String transportType;

    @Column(name = "pickup_point")
    private String pickupPoint;

    @Column(name = "rooms_requested")
    private Integer roomsRequested = 1;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "selected_at")
    private LocalDateTime selectedAt;

    @Column(name = "selection_method")
    private String selectionMethod; // RANDOM or FIFO

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    private List<ApprovalHistory> approvalHistory = new ArrayList<>();

    public Application() {}

    // Getters and Setters
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getTransportType() { return transportType; }
    public void setTransportType(String transportType) { this.transportType = transportType; }

    public String getPickupPoint() { return pickupPoint; }
    public void setPickupPoint(String pickupPoint) { this.pickupPoint = pickupPoint; }

    public Integer getRoomsRequested() { return roomsRequested; }
    public void setRoomsRequested(Integer roomsRequested) { this.roomsRequested = roomsRequested; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getSelectedAt() { return selectedAt; }
    public void setSelectedAt(LocalDateTime selectedAt) { this.selectedAt = selectedAt; }

    public String getSelectionMethod() { return selectionMethod; }
    public void setSelectionMethod(String selectionMethod) { this.selectionMethod = selectionMethod; }

    public List<ApplicationParticipant> getParticipants() { return participants; }
    public void setParticipants(List<ApplicationParticipant> participants) { this.participants = participants; }

    public List<ApprovalHistory> getApprovalHistory() { return approvalHistory; }
    public void setApprovalHistory(List<ApprovalHistory> approvalHistory) { this.approvalHistory = approvalHistory; }
}