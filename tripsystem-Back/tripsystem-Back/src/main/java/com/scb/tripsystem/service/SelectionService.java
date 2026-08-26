package com.scb.tripsystem.service;

import com.scb.tripsystem.dto.SelectionApplicantResponse;
import com.scb.tripsystem.dto.SelectionRequest;
import com.scb.tripsystem.dto.SelectionRequestResponse;
import com.scb.tripsystem.entity.Application;
import com.scb.tripsystem.entity.Batch;
import com.scb.tripsystem.entity.Employee;
import com.scb.tripsystem.entity.SelectionRequestEntity;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.repository.ApplicationRepository;
import com.scb.tripsystem.repository.BatchRepository;
import com.scb.tripsystem.repository.EmployeeRepository;
import com.scb.tripsystem.repository.SelectionRequestRepository;
import com.scb.tripsystem.repository.TripRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class SelectionService {

    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";

    private static final Set<String> ALLOWED_METHODS =
            Set.of("RANDOM", "FIFO");

    private static final Set<String> HR_EMPLOYEE_ROLES =
            Set.of(
                    "HR_ADMIN"
            );

    private static final Set<String> HR_MANAGER_ROLES =
            Set.of(
                    "HR_MANAGER"
            );

    private final SelectionRequestRepository selectionRequestRepository;
    private final TripRepository tripRepository;
    private final BatchRepository batchRepository;
    private final EmployeeRepository employeeRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;


    public SelectionService(
            SelectionRequestRepository selectionRequestRepository,
            TripRepository tripRepository,
            BatchRepository batchRepository,
            EmployeeRepository employeeRepository,
            ApplicationRepository applicationRepository,
            ApplicationService applicationService

    ) {
        this.selectionRequestRepository = selectionRequestRepository;
        this.tripRepository = tripRepository;
        this.batchRepository = batchRepository;
        this.employeeRepository = employeeRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;


    }

    // =========================================================
    // ALL APPLICANTS
    // =========================================================

    public List<SelectionApplicantResponse> getAllApplicants() {

        return applicationRepository
                .findAllActiveTripApplicationsOrderByCreatedAtAsc()
                .stream()
                .map(this::toApplicantResponse)
                .toList();
    }

    // =========================================================
    // APPLICANTS FOR ONE TRIP
    // =========================================================

    public List<SelectionApplicantResponse> getApplicants(
            Long tripId
    ) {

        Trip trip = getTrip(tripId);

        return applicationRepository
                .findByTrip_TripIdOrderByCreatedAtAsc(
                        trip.getTripId()
                )
                .stream()
                .map(this::toApplicantResponse)
                .toList();
    }

    // =========================================================
    // APPLICANTS FOR ONE SPECIFIC BATCH
    // =========================================================

    public List<SelectionApplicantResponse> getApplicantsByBatch(
            Long tripId,
            Long batchId
    ) {

        getBatchForTrip(tripId, batchId);

        return applicationRepository
                .findByBatch_BatchIdOrderByCreatedAtAsc(batchId)
                .stream()
                .filter(application ->
                        application.getTrip() != null
                                && tripId.equals(
                                application.getTrip().getTripId()
                        )
                )
                .map(this::toApplicantResponse)
                .toList();
    }

    // =========================================================
    // GET LATEST REQUEST FOR ONE BATCH
    // =========================================================

    public SelectionRequestResponse getLatestRequest(
            Long tripId,
            Long batchId
    ) {

        getBatchForTrip(tripId, batchId);

        return selectionRequestRepository
                .findFirstByTrip_TripIdAndBatch_BatchIdOrderByRequestedAtDesc(
                        tripId,
                        batchId
                )
                .map(this::toResponse)
                .orElse(null);
    }

    // =========================================================
    // HR MANAGER - GET ALL PENDING REQUESTS
    // =========================================================

    public List<SelectionRequestResponse> getPendingRequests(
            Long managerId
    ) {

        requireHrManager(managerId);

        return selectionRequestRepository
                .findByStatusOrderByRequestedAtAsc(PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // HR ADMIN - SUBMIT REQUEST FOR ONE BATCH
    // =========================================================

    @Transactional
    public SelectionRequestResponse submitRequest(
            Long tripId,
            Long batchId,
            Long hrUserId,
            SelectionRequest request
    ) {

        Employee hrUser =
                requireHrEmployee(hrUserId);

        Trip trip =
                getTrip(tripId);

        Batch batch =
                getBatchForTrip(
                        tripId,
                        batchId
                );

        String method =
                normalizeMethod(
                        request != null
                                ? request.getMethod()
                                : null
                );

        // Trip must be active
        if (trip.getStatus() == null ||
                !"ACTIVE".equalsIgnoreCase(
                        trip.getStatus().getStatusName()
                )) {

            throw new IllegalStateException(
                    "Selection can only be requested for an ACTIVE trip."
            );
        }

        // Prevent duplicate pending request ONLY for this batch
        boolean alreadyPending =
                selectionRequestRepository
                        .findFirstByTrip_TripIdAndBatch_BatchIdAndStatusOrderByRequestedAtDesc(
                                tripId,
                                batchId,
                                PENDING
                        )
                        .isPresent();

        if (alreadyPending) {

            throw new IllegalStateException(
                    "A selection request for this batch is already waiting for HR Manager approval."
            );
        }

        // Only applications approved by the line manager
        // for THIS specific batch can be selected.
        boolean hasApprovedApplicants =
                applicationRepository
                        .findByTrip_TripIdAndBatch_BatchIdAndStatus_StatusName(
                                tripId,
                                batchId,
                                "APPROVED_BY_MANAGER"
                        )
                        .stream()
                        .findAny()
                        .isPresent();

        if (!hasApprovedApplicants) {

            throw new IllegalStateException(
                    "There are no manager-approved applicants ready for selection in this batch."
            );
        }

        SelectionRequestEntity entity =
                new SelectionRequestEntity();

        entity.setTrip(trip);
        entity.setBatch(batch);
        entity.setRequestedBy(hrUser);
        entity.setMethod(method);
        entity.setStatus(PENDING);
        entity.setRequestedAt(LocalDateTime.now());

        SelectionRequestEntity saved =
                selectionRequestRepository.save(entity);

        return toResponse(saved);
    }

    // =========================================================
    // HR MANAGER - APPROVE
    // =========================================================

    @Transactional
    public SelectionRequestResponse approveRequest(
            Long requestId,
            Long managerId
    ) {

        Employee manager =
                requireHrManager(managerId);

        SelectionRequestEntity request =
                getRequest(requestId);

        if (!PENDING.equalsIgnoreCase(
                request.getStatus()
        )) {

            throw new IllegalStateException(
                    "This selection request is no longer pending."
            );
        }

        if (request.getRequestedBy() != null &&
                request.getRequestedBy()
                        .getEmployeeId()
                        .equals(manager.getEmployeeId())) {

            throw new IllegalStateException(
                    "The requester cannot approve their own selection request."
            );
        }

        if (request.getTrip() == null) {

            throw new IllegalStateException(
                    "The selection request is not associated with a trip."
            );
        }

        if (request.getBatch() == null) {

            throw new IllegalStateException(
                    "The selection request is not associated with a batch."
            );
        }

        request.setStatus(APPROVED);
        request.setReviewedBy(manager);
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(null);

        selectionRequestRepository.save(request);

        // Execute selection after manager approval.
        applicationService.performSelection(
                request.getTrip().getTripId(),
                request.getMethod(),
                request.getRequestedBy()
        );

        return toResponse(request);
    }

    // =========================================================
    // HR MANAGER - REJECT
    // =========================================================

    @Transactional
    public SelectionRequestResponse rejectRequest(
            Long requestId,
            Long managerId,
            String reason
    ) {

        Employee manager =
                requireHrManager(managerId);

        SelectionRequestEntity request =
                getRequest(requestId);

        if (!PENDING.equalsIgnoreCase(
                request.getStatus()
        )) {

            throw new IllegalStateException(
                    "This selection request is no longer pending."
            );
        }

        if (reason == null ||
                reason.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "A rejection reason is required."
            );
        }

        request.setStatus(REJECTED);
        request.setReviewedBy(manager);
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(reason.trim());

        SelectionRequestEntity saved =
                selectionRequestRepository.save(request);

        return toResponse(saved);
    }

    // =========================================================
    // ROLE VALIDATION
    // =========================================================

    private Employee requireHrEmployee(
            Long employeeId
    ) {

        Employee employee =
                getEmployee(employeeId);

        String role =
                getNormalizedRole(employee);

        if (!HR_EMPLOYEE_ROLES.contains(role)) {

            throw new IllegalStateException(
                    "Only an HR Admin can submit a selection request. Current role: "
                            + (role == null
                            ? "NONE"
                            : role)
            );
        }

        return employee;
    }

    private Employee requireHrManager(
            Long employeeId
    ) {

        Employee employee =
                getEmployee(employeeId);

        String role =
                getNormalizedRole(employee);

        if (!HR_MANAGER_ROLES.contains(role)) {

            throw new IllegalStateException(
                    "Only an HR Manager can approve or reject a selection request. Current role: "
                            + (role == null
                            ? "NONE"
                            : role)
            );
        }

        return employee;
    }

    private Employee getEmployee(
            Long employeeId
    ) {

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Employee not found: "
                                                + employeeId
                                )
                        );

        if (!Boolean.TRUE.equals(
                employee.getIsActive()
        )) {

            throw new IllegalStateException(
                    "This employee is inactive."
            );
        }

        return employee;
    }

    private String getNormalizedRole(
            Employee employee
    ) {

        if (employee == null ||
                employee.getRole() == null ||
                employee.getRole().getRoleName() == null) {

            return null;
        }

        return employee.getRole()
                .getRoleName()
                .trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[\\s-]+", "_");
    }

    // =========================================================
    // ENTITY HELPERS
    // =========================================================

    private Trip getTrip(
            Long tripId
    ) {

        return tripRepository
                .findById(tripId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Trip not found: "
                                        + tripId
                        )
                );
    }

    private Batch getBatchForTrip(
            Long tripId,
            Long batchId
    ) {

        Batch batch =
                batchRepository
                        .findById(batchId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Batch not found: "
                                                + batchId
                                )
                        );

        if (batch.getTrip() == null ||
                !tripId.equals(
                        batch.getTrip().getTripId()
                )) {

            throw new IllegalArgumentException(
                    "The selected batch does not belong to this trip."
            );
        }

        return batch;
    }

    private SelectionRequestEntity getRequest(
            Long requestId
    ) {

        return selectionRequestRepository
                .findById(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Selection request not found: "
                                        + requestId
                        )
                );
    }

    private String normalizeMethod(
            String method
    ) {

        if (method == null ||
                method.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Selection method is required."
            );
        }

        String normalized =
                method.trim()
                        .toUpperCase(Locale.ROOT);

        if (!ALLOWED_METHODS.contains(
                normalized
        )) {

            throw new IllegalArgumentException(
                    "Selection method must be RANDOM or FIFO."
            );
        }

        return normalized;
    }

    // =========================================================
    // DTO MAPPING - APPLICANTS
    // =========================================================

    private SelectionApplicantResponse toApplicantResponse(
            Application app
    ) {

        SelectionApplicantResponse dto =
                new SelectionApplicantResponse();

        dto.setApplicationId(
                app.getApplicationId()
        );

        dto.setSubmissionTimestamp(
                app.getCreatedAt()
        );

        if (app.getEmployee() != null) {

            Employee employee =
                    app.getEmployee();

            dto.setEmployeeId(
                    employee.getEmployeeId()
            );

            dto.setEmployeeNumber(
                    employee.getEmployeeNumber()
            );

            dto.setEmployeeName(
                    employee.getFullName()
            );

            if (employee.getDepartment() != null) {

                dto.setDepartment(
                        employee.getDepartment()
                                .getDepartmentName()
                );
            }

            if (employee.getRole() != null) {

                dto.setRole(
                        employee.getRole()
                                .getRoleName()
                );
            }
        }

        return dto;
    }

    // =========================================================
    // DTO MAPPING - REQUESTS
    // =========================================================

    private SelectionRequestResponse toResponse(
            SelectionRequestEntity entity
    ) {

        SelectionRequestResponse dto =
                new SelectionRequestResponse();

        dto.setSelectionRequestId(
                entity.getSelectionRequestId()
        );

        if (entity.getTrip() != null) {

            dto.setTripId(
                    entity.getTrip().getTripId()
            );

            dto.setTripName(
                    entity.getTrip().getTitle()
            );
        }

        if (entity.getBatch() != null) {

            dto.setBatchId(
                    entity.getBatch().getBatchId()
            );

            dto.setBatchName(
                    "Batch "
                            + entity.getBatch()
                            .getBatchId()
            );
        }

        dto.setMethod(
                entity.getMethod()
        );

        dto.setStatus(
                entity.getStatus()
        );

        dto.setRejectionReason(
                entity.getRejectionReason()
        );

        dto.setRequestedAt(
                entity.getRequestedAt()
        );

        dto.setReviewedAt(
                entity.getReviewedAt()
        );

        if (entity.getRequestedBy() != null) {

            dto.setRequestedById(
                    entity.getRequestedBy()
                            .getEmployeeId()
            );

            dto.setRequestedByName(
                    entity.getRequestedBy()
                            .getFullName()
            );
        }

        if (entity.getReviewedBy() != null) {

            dto.setReviewedById(
                    entity.getReviewedBy()
                            .getEmployeeId()
            );

            dto.setReviewedByName(
                    entity.getReviewedBy()
                            .getFullName()
            );
        }

        return dto;
    }
}