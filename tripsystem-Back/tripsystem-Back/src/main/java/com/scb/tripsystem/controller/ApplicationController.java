package com.scb.tripsystem.controller;

import com.scb.tripsystem.dto.*;
import com.scb.tripsystem.entity.*;
import com.scb.tripsystem.service.ApplicationService;
import com.scb.tripsystem.service.CurrentUserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final CurrentUserService currentUserService;

    public ApplicationController(
            ApplicationService applicationService,
            CurrentUserService currentUserService) {

        this.applicationService = applicationService;
        this.currentUserService = currentUserService;
    }


    // =========================================================
    // EMPLOYEE / ALL EMPLOYEES - APPLY FOR TRIP
    // =========================================================

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForTrip(

            @RequestParam Long tripId,

            @RequestParam Long batchId,

            @RequestBody ApplicationCreateRequest request) {

        // Always get the employee from the authenticated JWT.
        // Never trust an employee ID coming from the frontend.

        Employee employee =
                currentUserService.getCurrentEmployee();

        List<ApplicationParticipant> participants = null;

        if (request.getParticipants() != null) {

            participants =
                    request.getParticipants()
                            .stream()
                            .map(p -> {

                                ApplicationParticipant ap =
                                        new ApplicationParticipant();

                                ap.setFullName(
                                        p.getFullName()
                                );

                                ap.setRelationship(
                                        p.getRelationship()
                                );

                                ap.setDateOfBirth(
                                        p.getDateOfBirth()
                                );

                                return ap;
                            })
                            .collect(Collectors.toList());
        }

        Application saved =
                applicationService.applyForTrip(

                        tripId,

                        batchId,

                        employee,

                        request.getTransportType(),

                        request.getPickupPoint(),

                        request.getRoomsRequested(),

                        request.getTotalPrice(),

                        participants
                );

        return ResponseEntity.ok(
                toApplicationResponse(saved)
        );
    }


    // =========================================================
    // ALL EMPLOYEES - MY REQUESTS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>>
    getMyApplications() {

        Employee employee =
                currentUserService.getCurrentEmployee();

        List<ApplicationResponse> list =
                applicationService
                        .getMyApplications(employee)
                        .stream()
                        .map(this::toApplicationResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // ALL EMPLOYEES - MY HISTORY
    // =========================================================

    @GetMapping("/my/history")
    public ResponseEntity<List<ApplicationResponse>>
    getMyHistory() {

        Employee employee =
                currentUserService.getCurrentEmployee();

        List<ApplicationResponse> list =
                applicationService
                        .getMyHistory(employee)
                        .stream()
                        .map(this::toApplicationResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // APPLICATION HISTORY
    // =========================================================

    @GetMapping("/{applicationId}/history")
    public ResponseEntity<List<ApprovalHistoryResponse>>
    getHistory(
            @PathVariable Long applicationId) {

        Employee employee =
                currentUserService.getCurrentEmployee();

        // The service must verify ownership / manager access
        // before exposing the application's approval history.

        Application application =
                applicationService.getApplicationById(
                        applicationId,
                        employee
                );

        List<ApprovalHistoryResponse> list =
                applicationService
                        .getApplicationHistory(
                                application.getApplicationId()
                        )
                        .stream()
                        .map(this::toHistoryResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // LINE MANAGER - ALL APPLICATIONS OF DIRECT REPORTS
    // =========================================================

    @GetMapping("/manager")
    public ResponseEntity<List<ApplicationResponse>>
    getApplicationsForCurrentManager() {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "LINE_MANAGER"
        );

        List<ApplicationResponse> list =
                applicationService
                        .getApplicationsForManager(
                                manager.getEmployeeId()
                        )
                        .stream()
                        .map(this::toApplicationResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // LINE MANAGER - PENDING TASKS
    // =========================================================

    @GetMapping("/manager/pending")
    public ResponseEntity<List<ApplicationResponse>>
    getPendingForCurrentManager() {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "LINE_MANAGER"
        );

        List<ApplicationResponse> list =
                applicationService
                        .getPendingApplicationsForManager(
                                manager.getEmployeeId()
                        )
                        .stream()
                        .map(this::toApplicationResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // LINE MANAGER - APPROVE
    // =========================================================

    @PostMapping("/{applicationId}/approve")
    public ResponseEntity<ApplicationResponse>
    approveByManager(

            @PathVariable Long applicationId,

            @RequestBody(
                    required = false
            )
            ManagerDecisionRequest request) {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "LINE_MANAGER"
        );

        String comments =
                request != null
                        ? request.getComments()
                        : "";

        Application updated =
                applicationService.approveByManager(

                        applicationId,

                        manager,

                        comments
                );

        return ResponseEntity.ok(
                toApplicationResponse(updated)
        );
    }


    // =========================================================
    // LINE MANAGER - REJECT
    // =========================================================

    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<ApplicationResponse>
    rejectByManager(

            @PathVariable Long applicationId,

            @RequestBody(
                    required = false
            )
            ManagerDecisionRequest request) {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "LINE_MANAGER"
        );

        String comments =
                request != null
                        ? request.getComments()
                        : "";

        Application updated =
                applicationService.rejectByManager(

                        applicationId,

                        manager,

                        comments
                );

        return ResponseEntity.ok(
                toApplicationResponse(updated)
        );
    }


    // =========================================================
    // HR ADMIN - READY FOR SELECTION
    // =========================================================

    @GetMapping(
            "/trip/{tripId}/ready-for-selection"
    )
    public ResponseEntity<List<ApplicationResponse>>
    getReadyForSelection(
            @PathVariable Long tripId) {

        Employee hrAdmin =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                hrAdmin,
                "HR_ADMIN"
        );

        List<ApplicationResponse> list =
                applicationService
                        .getApplicationsReadyForSelection(
                                tripId
                        )
                        .stream()
                        .map(this::toApplicationResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // HR ADMIN - SELECTION
    // =========================================================

    @PostMapping(
            "/trip/{tripId}/select"
    )
    public ResponseEntity<String>
    performSelection(

            @PathVariable Long tripId,

            @RequestBody SelectionRequest request) {

        Employee hrAdmin =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                hrAdmin,
                "HR_ADMIN"
        );

        applicationService.performSelection(

                tripId,



                request.getMethod(),

                hrAdmin
        );

        return ResponseEntity.ok(
                "Selection started with method: "
                        + request.getMethod()
        );
    }


    // =========================================================
    // GET APPLICATION
    // =========================================================

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse>
    getApplication(
            @PathVariable Long applicationId) {

        Employee employee =
                currentUserService.getCurrentEmployee();

        Application app =
                applicationService
                        .getApplicationById(
                                applicationId,
                                employee
                        );

        return ResponseEntity.ok(
                toApplicationResponse(app)
        );
    }


    // =========================================================
    // RESPONSE MAPPING
    // =========================================================

    private ApplicationResponse toApplicationResponse(
            Application app) {

        ApplicationResponse dto =
                new ApplicationResponse();

        dto.setApplicationId(
                app.getApplicationId()
        );

        dto.setTransportType(
                app.getTransportType()
        );

        dto.setPickupPoint(
                app.getPickupPoint()
        );

        dto.setRoomsRequested(
                app.getRoomsRequested()
        );

        dto.setTotalPrice(
                app.getTotalPrice()
        );

        dto.setSelectionMethod(
                app.getSelectionMethod()
        );

        dto.setSelectedAt(
                app.getSelectedAt()
        );

        dto.setSubmittedAt(
                app.getCreatedAt()
        );

        if (app.getStatus() != null) {

            dto.setStatusName(
                    app.getStatus().getStatusName()
            );
        }

        if (app.getEmployee() != null) {

            dto.setEmployeeId(
                    app.getEmployee().getEmployeeId()
            );

            dto.setEmployeeName(
                    app.getEmployee().getFullName()
            );

            dto.setEmployeeNumber(
                    app.getEmployee().getEmployeeNumber()
            );
        }

        if (app.getTrip() != null) {

            dto.setTripId(
                    app.getTrip().getTripId()
            );

            dto.setTripTitle(
                    app.getTrip().getTitle()
            );

            dto.setDestination(
                    app.getTrip().getDestination()
            );
        }

        if (app.getBatch() != null) {

            dto.setBatchId(
                    app.getBatch().getBatchId()
            );
        }

        if (app.getParticipants() != null) {

            dto.setParticipants(
                    app.getParticipants()
                            .stream()
                            .map(
                                    this::toParticipantResponse
                            )
                            .collect(
                                    Collectors.toList()
                            )
            );
        }

        return dto;
    }


    // =========================================================
// LINE MANAGER - APPROVAL HISTORY
// =========================================================

    @GetMapping("/manager/approval-history")
    public ResponseEntity<List<ApprovalHistoryResponse>>
    getManagerApprovalHistory() {

        Employee manager =
                currentUserService.getCurrentEmployee();

        currentUserService.requireRole(
                manager,
                "LINE_MANAGER"
        );

        List<ApprovalHistoryResponse> list =
                applicationService
                        .getManagerApprovalHistory(manager)
                        .stream()
                        .map(this::toHistoryResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // PARTICIPANT MAPPING
    // =========================================================

    private ParticipantResponse toParticipantResponse(
            ApplicationParticipant p) {

        ParticipantResponse dto =
                new ParticipantResponse();

        dto.setParticipantId(
                p.getParticipantId()
        );

        dto.setFullName(
                p.getFullName()
        );

        dto.setRelationship(
                p.getRelationship()
        );

        dto.setDateOfBirth(
                p.getDateOfBirth()
        );

        return dto;
    }


    // =========================================================
    // HISTORY MAPPING
    // =========================================================

    private ApprovalHistoryResponse toHistoryResponse(
            ApprovalHistory h) {

        ApprovalHistoryResponse dto =
                new ApprovalHistoryResponse();

        dto.setHistoryId(
                h.getHistoryId()
        );

        dto.setRoleAtAction(
                h.getRoleAtAction()
        );

        dto.setAction(
                h.getAction()
        );

        dto.setComments(
                h.getComments()
        );

        dto.setActionAt(
                h.getActionAt()
        );

        if (h.getActionBy() != null) {

            dto.setActionByName(
                    h.getActionBy().getFullName()
            );
        }

        return dto;
    }
}