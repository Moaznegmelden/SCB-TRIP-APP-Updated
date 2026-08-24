package com.scb.tripsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SelectionApplicantResponse {

    private Long applicationId;

    private Long employeeId;
    private String employeeNumber;
    private String employeeName;

    private String department;
    private String role;

    private LocalDateTime submissionTimestamp;
}