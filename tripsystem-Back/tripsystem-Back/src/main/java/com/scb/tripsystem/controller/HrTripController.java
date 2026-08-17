package com.scb.tripsystem.controller;

import com.scb.tripsystem.dto.AllocationResult;
import com.scb.tripsystem.service.AllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hr/trips")
@RequiredArgsConstructor
public class HrTripController {

    private final AllocationService allocationService;

    /**
     * Used by Selection Approval page AND Announcement page
     * GET /api/hr/trips/{tripId}/allocation/result
     */
    @GetMapping("/{tripId}/allocation/result")
    public ResponseEntity<AllocationResult> getAllocationResult(@PathVariable Long tripId) {
        return ResponseEntity.ok(allocationService.getAllocationResult(tripId));
    }

    /**
     * Optional – Publish the announcement
     * POST /api/hr/trips/{tripId}/announcement/publish
     */
    @PostMapping("/{tripId}/announcement/publish")
    public ResponseEntity<?> publishAnnouncement(
            @PathVariable Long tripId,
            @RequestBody(required = false) Map<String, String> body) {

        String message = body != null ? body.get("message") : null;
        allocationService.publishAnnouncement(tripId, message);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Announcement published successfully"
        ));
    }
}