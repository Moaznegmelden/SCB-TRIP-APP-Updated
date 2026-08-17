package com.scb.tripsystem.controller;

import com.scb.tripsystem.dto.*;
import com.scb.tripsystem.entity.*;
import com.scb.tripsystem.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }



    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForTrip(
            @RequestParam Long tripId,
            @RequestParam Long batchId,
            @RequestParam Long employeeId,
            @RequestBody ApplicationCreateRequest request) {

        Employee employee = new Employee();
        employee.setEmployeeId(employeeId);

        List<ApplicationParticipant> participants = null;
        if (request.getParticipants() != null) {
            participants = request.getParticipants().stream().map(p -> {
                ApplicationParticipant ap = new ApplicationParticipant();
                ap.setFullName(p.getFullName());
                ap.setRelationship(p.getRelationship());
                ap.setDateOfBirth(p.getDateOfBirth());
                return ap;
            }).collect(Collectors.toList());
        }

        Application saved = applicationService.applyForTrip(
                tripId,
                batchId,
                employee,
                request.getTransportType(),
                request.getPickupPoint(),
                request.getRoomsRequested(),
                request.getTotalPrice(),
                participants
        );

        return ResponseEntity.ok(toApplicationResponse(saved));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(@RequestParam Long employeeId) {
        Employee employee = new Employee();
        employee.setEmployeeId(employeeId);

        List<ApplicationResponse> list = applicationService.getMyApplications(employee)
                .stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{applicationId}/history")
    public ResponseEntity<List<ApprovalHistoryResponse>> getHistory(@PathVariable Long applicationId) {
        List<ApprovalHistoryResponse> list = applicationService.getApplicationHistory(applicationId)
                .stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // -------------------------------------------------------
    // LINE MANAGER
    // -------------------------------------------------------

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForManager(@PathVariable Long managerId) {
        List<ApplicationResponse> list = applicationService.getApplicationsForManager(managerId)
                .stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/manager/{managerId}/pending")
    public ResponseEntity<List<ApplicationResponse>> getPendingForManager(@PathVariable Long managerId) {
        List<ApplicationResponse> list = applicationService.getPendingApplicationsForManager(managerId)
                .stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{applicationId}/approve")
    public ResponseEntity<ApplicationResponse> approveByManager(
            @PathVariable Long applicationId,
            @RequestParam Long managerId,
            @RequestBody(required = false) ManagerDecisionRequest request) {

        Employee manager = new Employee();
        manager.setEmployeeId(managerId);

        String comments = request != null ? request.getComments() : "";
        Application updated = applicationService.approveByManager(applicationId, manager, comments);
        return ResponseEntity.ok(toApplicationResponse(updated));
    }

    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<ApplicationResponse> rejectByManager(
            @PathVariable Long applicationId,
            @RequestParam Long managerId,
            @RequestBody(required = false) ManagerDecisionRequest request) {

        Employee manager = new Employee();
        manager.setEmployeeId(managerId);

        String comments = request != null ? request.getComments() : "";
        Application updated = applicationService.rejectByManager(applicationId, manager, comments);
        return ResponseEntity.ok(toApplicationResponse(updated));
    }



    @GetMapping("/trip/{tripId}/ready-for-selection")
    public ResponseEntity<List<ApplicationResponse>> getReadyForSelection(@PathVariable Long tripId) {
        List<ApplicationResponse> list = applicationService.getApplicationsReadyForSelection(tripId)
                .stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/trip/{tripId}/select")
    public ResponseEntity<String> performSelection(
            @PathVariable Long tripId,
            @RequestParam Long hrUserId,
            @RequestBody SelectionRequest request) {

        Employee hrUser = new Employee();
        hrUser.setEmployeeId(hrUserId);

        applicationService.performSelection(tripId, request.getMethod(), hrUser);
        return ResponseEntity.ok("Selection started with method: " + request.getMethod());
    }


    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplication(@PathVariable Long applicationId) {
        Application app = applicationService.getApplicationById(applicationId);
        return ResponseEntity.ok(toApplicationResponse(app));
    }



    private ApplicationResponse toApplicationResponse(Application app) {
        ApplicationResponse dto = new ApplicationResponse();
        dto.setApplicationId(app.getApplicationId());
        dto.setTransportType(app.getTransportType());
        dto.setPickupPoint(app.getPickupPoint());
        dto.setRoomsRequested(app.getRoomsRequested());
        dto.setTotalPrice(app.getTotalPrice());
        dto.setSelectionMethod(app.getSelectionMethod());
        dto.setSelectedAt(app.getSelectedAt());

        if (app.getStatus() != null) {
            dto.setStatusName(app.getStatus().getStatusName());
        }
        if (app.getEmployee() != null) {
            dto.setEmployeeId(app.getEmployee().getEmployeeId());
            dto.setEmployeeName(app.getEmployee().getFullName());
            dto.setEmployeeNumber(app.getEmployee().getEmployeeNumber());
        }
        if (app.getTrip() != null) {
            dto.setTripId(app.getTrip().getTripId());
            dto.setTripTitle(app.getTrip().getTitle());
            dto.setDestination(app.getTrip().getDestination());
        }
        if (app.getBatch() != null) {
            dto.setBatchId(app.getBatch().getBatchId());
        }
        if (app.getParticipants() != null) {
            dto.setParticipants(app.getParticipants().stream()
                    .map(this::toParticipantResponse)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ParticipantResponse toParticipantResponse(ApplicationParticipant p) {
        ParticipantResponse dto = new ParticipantResponse();
        dto.setParticipantId(p.getParticipantId());
        dto.setFullName(p.getFullName());
        dto.setRelationship(p.getRelationship());
        dto.setDateOfBirth(p.getDateOfBirth());
        return dto;
    }

    private ApprovalHistoryResponse toHistoryResponse(ApprovalHistory h) {
        ApprovalHistoryResponse dto = new ApprovalHistoryResponse();
        dto.setHistoryId(h.getHistoryId());
        dto.setRoleAtAction(h.getRoleAtAction());
        dto.setAction(h.getAction());
        dto.setComments(h.getComments());
        dto.setActionAt(h.getActionAt());
        if (h.getActionBy() != null) {
            dto.setActionByName(h.getActionBy().getFullName());
        }
        return dto;
    }
}