package com.scb.tripsystem.dto;

import java.time.LocalDate;

public class BatchRequest {

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfRooms;

    public BatchRequest() {}

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getNumberOfRooms() { return numberOfRooms; }
    public void setNumberOfRooms(Integer numberOfRooms) { this.numberOfRooms = numberOfRooms; }
}