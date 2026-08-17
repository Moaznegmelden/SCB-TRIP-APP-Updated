package com.scb.tripsystem.dto;

import java.math.BigDecimal;
import java.util.List;

public class ApplicationCreateRequest {

    private String transportType;
    private String pickupPoint;
    private Integer roomsRequested;
    private BigDecimal totalPrice;
    private List<ParticipantRequest> participants;

    public ApplicationCreateRequest() {}

    public String getTransportType() { return transportType; }
    public void setTransportType(String transportType) { this.transportType = transportType; }

    public String getPickupPoint() { return pickupPoint; }
    public void setPickupPoint(String pickupPoint) { this.pickupPoint = pickupPoint; }

    public Integer getRoomsRequested() { return roomsRequested; }
    public void setRoomsRequested(Integer roomsRequested) { this.roomsRequested = roomsRequested; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public List<ParticipantRequest> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantRequest> participants) { this.participants = participants; }
}