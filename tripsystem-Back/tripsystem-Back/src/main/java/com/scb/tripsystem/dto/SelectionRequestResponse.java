package com.scb.tripsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SelectionRequestResponse {

    private Long selectionRequestId;

    private Long tripId;
    private String tripName;

    private Long batchId;
    private String batchName;

    private String method;
    private String status;

    private String rejectionReason;

    private Long requestedById;
    private String requestedByName;

    private Long reviewedById;
    private String reviewedByName;

    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
}