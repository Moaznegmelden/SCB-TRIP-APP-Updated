package com.scb.tripsystem.controller;

import com.scb.tripsystem.dto.ManagerDecisionRequest;
import com.scb.tripsystem.dto.SelectionApplicantResponse;
import com.scb.tripsystem.dto.SelectionRequest;
import com.scb.tripsystem.dto.SelectionRequestResponse;
import com.scb.tripsystem.service.SelectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/selections")
@CrossOrigin(origins = "http://localhost:4200")
public class SelectionController {

    private final SelectionService selectionService;

    public SelectionController(
            SelectionService selectionService
    ) {
        this.selectionService = selectionService;
    }

    // =========================================================
    // ALL APPLICANTS - ALL ACTIVE TRIPS
    // =========================================================

    @GetMapping("/applicants")
    public ResponseEntity<List<SelectionApplicantResponse>>
    getAllApplicants() {

        return ResponseEntity.ok(
                selectionService.getAllApplicants()
        );
    }

    // =========================================================
    // APPLICANTS FOR ONE TRIP - ALL BATCHES
    // =========================================================

    @GetMapping("/trip/{tripId}/applicants")
    public ResponseEntity<List<SelectionApplicantResponse>>
    getApplicants(
            @PathVariable Long tripId
    ) {

        return ResponseEntity.ok(
                selectionService.getApplicants(tripId)
        );
    }

    // =========================================================
    // APPLICANTS FOR ONE SPECIFIC BATCH
    // =========================================================

    @GetMapping("/trip/{tripId}/batch/{batchId}/applicants")
    public ResponseEntity<List<SelectionApplicantResponse>>
    getApplicantsByBatch(
            @PathVariable Long tripId,
            @PathVariable Long batchId
    ) {

        return ResponseEntity.ok(
                selectionService.getApplicantsByBatch(
                        tripId,
                        batchId
                )
        );
    }

    // =========================================================
    // GET LATEST REQUEST FOR ONE SPECIFIC BATCH
    // =========================================================

    @GetMapping("/trip/{tripId}/batch/{batchId}/latest")
    public ResponseEntity<SelectionRequestResponse>
    getLatestRequest(
            @PathVariable Long tripId,
            @PathVariable Long batchId
    ) {

        SelectionRequestResponse response =
                selectionService.getLatestRequest(
                        tripId,
                        batchId
                );

        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // HR ADMIN SUBMITS REQUEST FOR ONE SPECIFIC BATCH
    // =========================================================

    @PostMapping("/trip/{tripId}/batch/{batchId}/requests")
    public ResponseEntity<SelectionRequestResponse>
    submitRequest(
            @PathVariable Long tripId,
            @PathVariable Long batchId,
            @RequestParam Long hrUserId,
            @RequestBody SelectionRequest request
    ) {

        return ResponseEntity.ok(
                selectionService.submitRequest(
                        tripId,
                        batchId,
                        hrUserId,
                        request
                )
        );
    }

    // =========================================================
    // HR MANAGER GETS ALL PENDING REQUESTS
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<List<SelectionRequestResponse>>
    getPendingRequests(
            @RequestParam Long managerId
    ) {

        return ResponseEntity.ok(
                selectionService.getPendingRequests(managerId)
        );
    }

    // =========================================================
    // APPROVE
    // =========================================================

    @PostMapping("/requests/{requestId}/approve")
    public ResponseEntity<SelectionRequestResponse>
    approveRequest(
            @PathVariable Long requestId,
            @RequestParam Long managerId
    ) {

        return ResponseEntity.ok(
                selectionService.approveRequest(
                        requestId,
                        managerId
                )
        );
    }

    // =========================================================
    // REJECT
    // =========================================================

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<SelectionRequestResponse>
    rejectRequest(
            @PathVariable Long requestId,
            @RequestParam Long managerId,
            @RequestBody(required = false)
            ManagerDecisionRequest request
    ) {

        String reason =
                request != null
                        ? request.getComments()
                        : null;

        return ResponseEntity.ok(
                selectionService.rejectRequest(
                        requestId,
                        managerId,
                        reason
                )
        );
    }
}