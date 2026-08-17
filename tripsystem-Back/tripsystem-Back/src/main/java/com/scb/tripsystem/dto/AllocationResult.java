package com.scb.tripsystem.dto;

import lombok.Data;
import java.util.List;

@Data
public class AllocationResult {
    private String tripName;
    private String method;              // LOTTERY or FCFS
    private Integer confirmedQuota;
    private Integer waitlistQuota;
    private List<SelectedApplicant> selectedApplicants;
}