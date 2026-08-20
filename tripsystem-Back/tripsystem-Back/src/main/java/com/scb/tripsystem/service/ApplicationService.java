package com.scb.tripsystem.service;

import com.scb.tripsystem.entity.*;
import com.scb.tripsystem.repository.ApplicationRepository;
import com.scb.tripsystem.repository.ApprovalHistoryRepository;
import com.scb.tripsystem.repository.BatchRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final BatchRepository batchRepository;
    private final StatusService statusService;
    private final TripService tripService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApprovalHistoryRepository approvalHistoryRepository,
            BatchRepository batchRepository,
            StatusService statusService,
            TripService tripService) {

        this.applicationRepository =
                applicationRepository;

        this.approvalHistoryRepository =
                approvalHistoryRepository;

        this.batchRepository =
                batchRepository;

        this.statusService =
                statusService;

        this.tripService =
                tripService;
    }


    // =========================================================
    // EMPLOYEE - APPLY FOR TRIP
    // =========================================================

    @Transactional
    public Application applyForTrip(

            Long tripId,

            Long batchId,

            Employee employee,

            String transportType,

            String pickupPoint,

            Integer roomsRequested,

            BigDecimal totalPrice,

            List<ApplicationParticipant> participants) {

        Trip trip =
                tripService.getTripById(tripId);


        // Prevent duplicate application

        if (applicationRepository
                .existsByEmployee_EmployeeIdAndTrip_TripId(
                        employee.getEmployeeId(),
                        tripId)) {

            throw new RuntimeException(
                    "Employee has already applied for this trip"
            );
        }


        // Trip must be ACTIVE

        if (!"ACTIVE".equals(
                trip.getStatus().getStatusName())) {

            throw new RuntimeException(
                    "You can only apply to ACTIVE trips"
            );
        }


        // Registration period

        LocalDateTime now =
                LocalDateTime.now();

        if (now.isBefore(
                trip.getRegistrationOpen())
                ||
                now.isAfter(
                        trip.getRegistrationClose())) {

            throw new RuntimeException(
                    "Registration is closed for this trip"
            );
        }


        // Batch

        Batch batch =
                batchRepository.findById(batchId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Batch not found"
                                )
                        );


        if (!batch.getTrip()
                .getTripId()
                .equals(tripId)) {

            throw new RuntimeException(
                    "Batch does not belong to this trip"
            );
        }


        // Create application

        Application application =
                new Application();

        application.setEmployee(
                employee
        );

        application.setTrip(
                trip
        );

        application.setBatch(
                batch
        );

        application.setTransportType(
                transportType
        );

        application.setPickupPoint(
                pickupPoint
        );

        application.setRoomsRequested(
                roomsRequested != null
                        ? roomsRequested
                        : 1
        );

        application.setTotalPrice(
                totalPrice
        );

        application.setStatus(
                statusService.getByName(
                        "PENDING_MANAGER"
                )
        );


        // Participants

        if (participants != null) {

            for (
                    ApplicationParticipant p
                    : participants
            ) {

                p.setApplication(
                        application
                );

                application
                        .getParticipants()
                        .add(p);
            }
        }


        Application saved =
                applicationRepository.save(
                        application
                );


        // History

        saveHistory(
                saved,
                employee,
                "EMPLOYEE",
                "APPLIED",
                "Employee submitted application"
        );


        return saved;
    }


    // =========================================================
    // LINE MANAGER
    // =========================================================

    public List<Application>
    getApplicationsForManager(
            Long managerId) {

        return applicationRepository
                .findByEmployee_Manager_EmployeeId(
                        managerId
                );
    }


    public List<Application>
    getPendingApplicationsForManager(
            Long managerId) {

        return applicationRepository
                .findByEmployee_Manager_EmployeeId(
                        managerId
                )
                .stream()
                .filter(app ->
                        "PENDING_MANAGER"
                                .equals(
                                        app.getStatus()
                                                .getStatusName()
                                )
                )
                .toList();
    }


    // =========================================================
    // LINE MANAGER - APPROVE
    // =========================================================

    @Transactional
    public Application approveByManager(

            Long applicationId,

            Employee manager,

            String comments) {

        Application application =
                getApplicationById(
                        applicationId
                );


        // Direct manager check

        if (
                application.getEmployee()
                        .getManager() == null
                        ||
                        !application
                                .getEmployee()
                                .getManager()
                                .getEmployeeId()
                                .equals(
                                        manager.getEmployeeId()
                                )
        ) {

            throw new RuntimeException(
                    "You are not the manager of this employee"
            );
        }


        // Status check

        if (!"PENDING_MANAGER".equals(
                application
                        .getStatus()
                        .getStatusName())) {

            throw new RuntimeException(
                    "Application is not in PENDING_MANAGER status"
            );
        }


        application.setStatus(
                statusService.getByName(
                        "APPROVED_BY_MANAGER"
                )
        );


        Application saved =
                applicationRepository.save(
                        application
                );


        saveHistory(
                saved,
                manager,
                "LINE_MANAGER",
                "APPROVED",
                comments
        );


        return saved;
    }


    // =========================================================
    // LINE MANAGER - REJECT
    // =========================================================

    @Transactional
    public Application rejectByManager(

            Long applicationId,

            Employee manager,

            String comments) {

        Application application =
                getApplicationById(
                        applicationId
                );


        // Direct manager check

        if (
                application.getEmployee()
                        .getManager() == null
                        ||
                        !application
                                .getEmployee()
                                .getManager()
                                .getEmployeeId()
                                .equals(
                                        manager.getEmployeeId()
                                )
        ) {

            throw new RuntimeException(
                    "You are not the manager of this employee"
            );
        }


        // Status check

        if (!"PENDING_MANAGER".equals(
                application
                        .getStatus()
                        .getStatusName())) {

            throw new RuntimeException(
                    "Application is not in PENDING_MANAGER status"
            );
        }


        application.setStatus(
                statusService.getByName(
                        "REJECTED_BY_MANAGER"
                )
        );


        Application saved =
                applicationRepository.save(
                        application
                );


        saveHistory(
                saved,
                manager,
                "LINE_MANAGER",
                "REJECTED",
                comments
        );


        return saved;
    }


    // =========================================================
    // HR ADMIN - READY FOR SELECTION
    // =========================================================

    public List<Application>
    getApplicationsReadyForSelection(
            Long tripId) {

        return applicationRepository
                .findByTrip_TripIdAndStatus_StatusName(
                        tripId,
                        "APPROVED_BY_MANAGER"
                );
    }


    // =========================================================
    // HR ADMIN - SELECTION
    // =========================================================

    @Transactional
    public void performSelection(

            Long tripId,

            String method,

            Employee hrUser) {

        // =====================================================
        // VALIDATE METHOD
        // =====================================================

        if (method == null ||
                (
                        !"FIFO".equalsIgnoreCase(method)
                                &&
                                !"RANDOM".equalsIgnoreCase(method)
                )) {

            throw new RuntimeException(
                    "Selection method must be FIFO or RANDOM"
            );
        }


        String selectionMethod =
                method.trim().toUpperCase();


        // =====================================================
        // GET CANDIDATES
        // =====================================================

        List<Application> candidates =
                new ArrayList<>(
                        getApplicationsReadyForSelection(
                                tripId
                        )
                );


        if (candidates.isEmpty()) {

            throw new RuntimeException(
                    "No applications ready for selection"
            );
        }


        // =====================================================
        // VERIFY ALL APPLICATIONS BELONG TO THE TRIP
        // =====================================================

        for (Application app : candidates) {

            if (app.getTrip() == null ||
                    app.getTrip().getTripId() == null ||
                    !app.getTrip()
                            .getTripId()
                            .equals(tripId)) {

                throw new RuntimeException(
                        "Application does not belong to the selected trip"
                );
            }
        }


        // =====================================================
        // SET IN_SELECTION
        // =====================================================

        Status inSelectionStatus =
                statusService.getByName(
                        "IN_SELECTION"
                );


        for (Application app : candidates) {

            app.setStatus(
                    inSelectionStatus
            );

            app.setSelectionMethod(
                    selectionMethod
            );

            applicationRepository.save(
                    app
            );

            saveHistory(
                    app,
                    hrUser,
                    "HR_ADMIN",
                    "SELECTION_STARTED",
                    "Selection method: "
                            + selectionMethod
            );
        }


        // =====================================================
        // ORDER APPLICATIONS
        // =====================================================

        if ("FIFO".equals(selectionMethod)) {

            /*
             * Application ID is used as the FIFO order.
             *
             * Lower application ID =
             * earlier application in the current system.
             */

            candidates.sort(
                    Comparator.comparing(
                            Application::getApplicationId
                    )
            );

        } else {

            /*
             * RANDOM selection
             */

            Collections.shuffle(
                    candidates
            );
        }


        // =====================================================
        // LOAD FINAL STATUSES FROM DATABASE
        // =====================================================

        Status selectedStatus =
                statusService.getByName(
                        "SELECTED"
                );

        Status waitlistStatus =
                statusService.getByName(
                        "WAITLIST"
                );

        Status notSelectedStatus =
                statusService.getByName(
                        "NOT_SELECTED"
                );


        // =====================================================
        // TRACK REMAINING ROOMS PER BATCH
        // =====================================================

        Map<Long, Integer> remainingRooms =
                new HashMap<>();


        for (Application app : candidates) {

            Batch batch =
                    app.getBatch();


            if (batch == null ||
                    batch.getBatchId() == null) {

                throw new RuntimeException(
                        "Application "
                                + app.getApplicationId()
                                + " has no valid batch"
                );
            }


            Long batchId =
                    batch.getBatchId();


            // -------------------------------------------------
            // Load batch capacity only once
            // -------------------------------------------------

            if (!remainingRooms.containsKey(
                    batchId)) {

                Integer numberOfRooms =
                        batch.getNumberOfRooms();

                if (numberOfRooms == null ||
                        numberOfRooms <= 0) {

                    throw new RuntimeException(
                            "Batch "
                                    + batchId
                                    + " has invalid number of rooms"
                    );
                }

                remainingRooms.put(
                        batchId,
                        numberOfRooms
                );
            }


            int roomsAvailable =
                    remainingRooms.get(
                            batchId
                    );


            // -------------------------------------------------
            // Requested rooms
            // -------------------------------------------------

            int roomsRequested =
                    app.getRoomsRequested() != null
                            &&
                            app.getRoomsRequested() > 0
                            ?
                            app.getRoomsRequested()
                            :
                            1;


            // =================================================
            // SELECTED
            // =================================================

            if (roomsRequested <= roomsAvailable) {

                app.setStatus(
                        selectedStatus
                );

                app.setSelectedAt(
                        LocalDateTime.now()
                );

                app.setSelectionMethod(
                        selectionMethod
                );

                remainingRooms.put(
                        batchId,
                        roomsAvailable
                                - roomsRequested
                );

                applicationRepository.save(
                        app
                );

                saveHistory(
                        app,
                        hrUser,
                        "HR_ADMIN",
                        "SELECTED",
                        "Application selected using "
                                + selectionMethod
                                + ". Rooms requested: "
                                + roomsRequested
                );

            }

            // =================================================
            // WAITLIST
            // =================================================

            else {

                /*
                 * There are not enough rooms remaining.
                 *
                 * We put the application on WAITLIST
                 * instead of rejecting it immediately.
                 */

                app.setStatus(
                        waitlistStatus
                );

                app.setSelectionMethod(
                        selectionMethod
                );

                app.setSelectedAt(
                        null
                );

                applicationRepository.save(
                        app
                );

                saveHistory(
                        app,
                        hrUser,
                        "HR_ADMIN",
                        "WAITLISTED",
                        "Application moved to waitlist. "
                                + "Rooms requested: "
                                + roomsRequested
                                + ", rooms remaining: "
                                + roomsAvailable
                );
            }
        }


        // =====================================================
        // NOT_SELECTED STATUS
        // =====================================================
        //
        // NOT_SELECTED is kept as a valid DB status for cases
        // where the business process explicitly decides that
        // an application should not be selected.
        //
        // Current allocation behavior uses WAITLIST for
        // applications that do not fit the available capacity.
        //
        // Therefore we intentionally DO NOT automatically
        // convert WAITLIST applications into NOT_SELECTED.
        //
        // This prevents losing applicants from the waitlist.
        // =====================================================


        // =====================================================
        // FINAL SAVE
        // =====================================================

        applicationRepository.saveAll(
                candidates
        );
    }


    // =========================================================
    // COMMON
    // =========================================================

    public Application getApplicationById(
            Long applicationId) {

        return applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found"
                        )
                );
    }


    public List<Application>
    getMyApplications(
            Employee employee) {

        return applicationRepository
                .findByEmployee(employee);
    }


    public List<ApprovalHistory>
    getApplicationHistory(
            Long applicationId) {

        return approvalHistoryRepository
                .findByApplication_ApplicationId(
                        applicationId
                );
    }


    // =========================================================
    // HISTORY
    // =========================================================

    private void saveHistory(

            Application application,

            Employee actionBy,

            String role,

            String action,

            String comments) {

        ApprovalHistory history =
                new ApprovalHistory();


        history.setApplication(
                application
        );


        history.setActionBy(
                actionBy
        );


        history.setRoleAtAction(
                role
        );


        history.setAction(
                action
        );


        history.setComments(
                comments
        );


        history.setActionAt(
                LocalDateTime.now()
        );


        approvalHistoryRepository.save(
                history
        );
    }
}