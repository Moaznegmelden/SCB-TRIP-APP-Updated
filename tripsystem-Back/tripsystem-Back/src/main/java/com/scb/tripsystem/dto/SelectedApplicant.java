package com.scb.tripsystem.dto;

import lombok.Data;

@Data
public class SelectedApplicant {
    private String employeeId;
    private String employeeName;
    private String department;
    private String submissionTimestamp;
    private String status;          // CONFIRMED / WAITLIST
}