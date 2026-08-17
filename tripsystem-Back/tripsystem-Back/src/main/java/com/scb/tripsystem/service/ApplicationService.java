package com.scb.tripsystem.service;

import com.scb.tripsystem.entity.*;
import com.scb.tripsystem.repository.ApplicationRepository;
import com.scb.tripsystem.repository.ApprovalHistoryRepository;
import com.scb.tripsystem.repository.BatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final BatchRepository batchRepository;
    private final StatusService statusService;
    private final TripService tripService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApprovalHistoryRepository approvalHistoryRepository,
                              BatchRepository batchRepository,
                              StatusService statusService,
                              TripService tripService) {
        this.applicationRepository = applicationRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.batchRepository = batchRepository;
        this.statusService = statusService;
        this.tripService = tripService;
    }

    
    @Transactional
    public Application applyForTrip(Long tripId,
                                    Long batchId,
                                    Employee employee,
                                    String transportType,
                                    String pickupPoint,
                                    Integer roomsRequested,
                                    BigDecimal totalPrice,
                                    List<ApplicationParticipant> participants) {

        Trip trip = tripService.getTripById(tripId);

        // Prevent duplicate application for the same employee and trip
        if (applicationRepository.existsByEmployee_EmployeeIdAndTrip_TripId(
                employee.getEmployeeId(), tripId)) {
            throw new RuntimeException(
                    "Employee has already applied for this trip"
            );
        }

        // Validation: trip must be ACTIVE
        if (!"ACTIVE".equals(trip.getStatus().getStatusName())) {
            throw new RuntimeException("You can only apply to ACTIVE trips");
        }

        // Validation: registration period
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(trip.getRegistrationOpen()) || now.isAfter(trip.getRegistrationClose())) {
            throw new RuntimeException("Registration is closed for this trip");
        }

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (!batch.getTrip().getTripId().equals(tripId)) {
            throw new RuntimeException("Batch does not belong to this trip");
        }

        Application application = new Application();
        application.setEmployee(employee);
        application.setTrip(trip);
        application.setBatch(batch);
        application.setTransportType(transportType);
        application.setPickupPoint(pickupPoint);
        application.setRoomsRequested(roomsRequested != null ? roomsRequested : 1);
        application.setTotalPrice(totalPrice);
        application.setStatus(statusService.getByName("PENDING_MANAGER"));

        // Add companions
        if (participants != null) {
            for (ApplicationParticipant p : participants) {
                p.setApplication(application);
                application.getParticipants().add(p);
            }
        }

        Application saved = applicationRepository.save(application);

        // Save history
        saveHistory(saved, employee, "EMPLOYEE", "APPLIED", "Employee submitted application");

        return saved;
    }

    // =========================================================
    // 2. LINE MANAGER – View & Decide
    // =========================================================

    /**
     * Get all applications of employees under a specific manager
     */
    public List<Application> getApplicationsForManager(Long managerId) {
        return applicationRepository.findByEmployee_Manager_EmployeeId(managerId);
    }

    /**
     * Get pending applications for a manager
     */
    public List<Application> getPendingApplicationsForManager(Long managerId) {
        return applicationRepository.findByEmployee_Manager_EmployeeId(managerId)
                .stream()
                .filter(app -> "PENDING_MANAGER".equals(app.getStatus().getStatusName()))
                .toList();
    }

    /**
     * Manager approves employee application
     */
    @Transactional
    public Application approveByManager(Long applicationId, Employee manager, String comments) {
        Application application = getApplicationById(applicationId);

        // Security check: only the direct manager can approve
        if (application.getEmployee().getManager() == null ||
                !application.getEmployee().getManager().getEmployeeId().equals(manager.getEmployeeId())) {
            throw new RuntimeException("You are not the manager of this employee");
        }

        if (!"PENDING_MANAGER".equals(application.getStatus().getStatusName())) {
            throw new RuntimeException("Application is not in PENDING_MANAGER status");
        }

        application.setStatus(statusService.getByName("APPROVED_BY_MANAGER"));
        Application saved = applicationRepository.save(application);

        saveHistory(saved, manager, "LINE_MANAGER", "APPROVED", comments);

        return saved;
    }

    /**
     * Manager rejects employee application
     */
    @Transactional
    public Application rejectByManager(Long applicationId, Employee manager, String comments) {
        Application application = getApplicationById(applicationId);

        if (application.getEmployee().getManager() == null ||
                !application.getEmployee().getManager().getEmployeeId().equals(manager.getEmployeeId())) {
            throw new RuntimeException("You are not the manager of this employee");
        }

        if (!"PENDING_MANAGER".equals(application.getStatus().getStatusName())) {
            throw new RuntimeException("Application is not in PENDING_MANAGER status");
        }

        application.setStatus(statusService.getByName("REJECTED_BY_MANAGER"));
        Application saved = applicationRepository.save(application);

        saveHistory(saved, manager, "LINE_MANAGER", "REJECTED", comments);

        return saved;
    }

    // =========================================================
    // 3. HR – Selection (Random / FIFO)
    // =========================================================

    /**
     * Get all applications that are ready for selection (approved by manager)
     */
    public List<Application> getApplicationsReadyForSelection(Long tripId) {
        return applicationRepository.findByTrip_TripIdAndStatus_StatusName(tripId, "APPROVED_BY_MANAGER");
    }

    /**
     * Perform selection (simple version)
     * method = "RANDOM" or "FIFO"
     */
    @Transactional
    public void performSelection(Long tripId, String method, Employee hrUser) {
        List<Application> candidates = getApplicationsReadyForSelection(tripId);

        if (candidates.isEmpty()) {
            throw new RuntimeException("No applications ready for selection");
        }

        // TODO: Real capacity logic based on Batch.numberOfRooms and roomsRequested
        // For now we just mark them as IN_SELECTION
        for (Application app : candidates) {
            app.setStatus(statusService.getByName("IN_SELECTION"));
            app.setSelectionMethod(method);
            applicationRepository.save(app);
            saveHistory(app, hrUser, "HR_MANAGER", "SELECTION_STARTED", "Selection method: " + method);
        }
    }

    // =========================================================
    // 4. Common helpers
    // =========================================================

    public Application getApplicationById(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<Application> getMyApplications(Employee employee) {
        return applicationRepository.findByEmployee(employee);
    }

    public List<ApprovalHistory> getApplicationHistory(Long applicationId) {
        return approvalHistoryRepository.findByApplication_ApplicationId(applicationId);
    }

    private void saveHistory(Application application, Employee actionBy,
                             String role, String action, String comments) {
        ApprovalHistory history = new ApprovalHistory();
        history.setApplication(application);
        history.setActionBy(actionBy);
        history.setRoleAtAction(role);
        history.setAction(action);
        history.setComments(comments);
        history.setActionAt(LocalDateTime.now());
        approvalHistoryRepository.save(history);
    }
}