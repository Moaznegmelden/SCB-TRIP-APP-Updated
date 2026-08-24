package com.scb.tripsystem.service;

import com.scb.tripsystem.dto.AllocationResult;
import com.scb.tripsystem.dto.SelectedApplicant;
import com.scb.tripsystem.entity.Application;
import com.scb.tripsystem.entity.Status;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.repository.ApplicationRepository;
import com.scb.tripsystem.repository.StatusRepository;
import com.scb.tripsystem.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final TripRepository tripRepository;
    private final ApplicationRepository applicationRepository;
    private final StatusRepository statusRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern(
                    "dd/MM/yyyy HH:mm:ss"
            );

    // =========================================================
    // ACTUAL SELECTION
    // =========================================================

    @Transactional
    public void executeSelection(
            Long tripId,
            String method) {

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found: "
                                                + tripId
                                )
                        );

        String normalizedMethod =
                method == null
                        ? ""
                        : method.trim()
                        .toUpperCase(Locale.ROOT);

        if (!normalizedMethod.equals("RANDOM") &&
                !normalizedMethod.equals("FIFO")) {

            throw new IllegalArgumentException(
                    "Selection method must be RANDOM or FIFO"
            );
        }

        Integer confirmedQuota =
                trip.getConfirmedQuota();

        if (confirmedQuota == null ||
                confirmedQuota <= 0) {

            throw new IllegalStateException(
                    "Trip confirmed quota must be configured before selection"
            );
        }

        /*
         * Only applications approved by the
         * employee's direct manager participate.
         */
        List<Application> candidates =
                new ArrayList<>(
                        applicationRepository
                                .findByTrip_TripIdAndStatus_StatusName(
                                        tripId,
                                        "CONFIRMED"
                                )
                );

        if (candidates.isEmpty()) {

            throw new IllegalStateException(
                    "No applications are ready for selection"
            );
        }

        // =====================================================
        // FIFO
        // =====================================================

        if (normalizedMethod.equals("FIFO")) {

            candidates.sort((a, b) -> {

                LocalDateTime aTime =
                        a.getCreatedAt();

                LocalDateTime bTime =
                        b.getCreatedAt();

                if (aTime == null &&
                        bTime == null) {
                    return 0;
                }

                if (aTime == null) {
                    return 1;
                }

                if (bTime == null) {
                    return -1;
                }

                int result =
                        aTime.compareTo(bTime);

                if (result != 0) {
                    return result;
                }

                return Long.compare(
                        a.getApplicationId(),
                        b.getApplicationId()
                );
            });
        }

        // =====================================================
        // RANDOM
        // =====================================================

        else {

            Collections.shuffle(candidates);
        }

        Status confirmed =
                getStatus("CONFIRMED");

        Status waitlist =
                getStatus("WAITLIST");

        LocalDateTime selectedAt =
                LocalDateTime.now();

        int confirmedCount =
                Math.min(
                        confirmedQuota,
                        candidates.size()
                );

        // =====================================================
        // APPLY RESULT
        // =====================================================

        for (int i = 0;
             i < candidates.size();
             i++) {

            Application application =
                    candidates.get(i);

            application.setSelectionMethod(
                    normalizedMethod
            );

            application.setSelectedAt(
                    selectedAt
            );

            if (i < confirmedCount) {

                application.setStatus(
                        confirmed
                );

            } else {

                application.setStatus(
                        waitlist
                );
            }

            applicationRepository.save(
                    application
            );
        }

        /*
         * Save approved selection method on Trip.
         */
        trip.setAllocationMethod(
                normalizedMethod
        );

        tripRepository.save(trip);
    }
    @Transactional
    public void executeSelection(
            Long tripId,
            Long batchId,
            String method
    ) {

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found: "
                                                + tripId
                                )
                        );

        String normalizedMethod =
                method == null
                        ? ""
                        : method.trim()
                        .toUpperCase(Locale.ROOT);

        if (!normalizedMethod.equals("RANDOM") &&
                !normalizedMethod.equals("FIFO")) {

            throw new IllegalArgumentException(
                    "Selection method must be RANDOM or FIFO"
            );
        }

        Integer confirmedQuota =
                trip.getConfirmedQuota();

        if (confirmedQuota == null ||
                confirmedQuota <= 0) {

            throw new IllegalStateException(
                    "Trip confirmed quota must be configured before selection"
            );
        }

        List<Application> candidates =
                new ArrayList<>(
                        applicationRepository
                                .findByTrip_TripIdAndBatch_BatchIdAndStatus_StatusName(
                                        tripId,
                                        batchId,
                                        "APPROVED_BY_MANAGER"
                                )
                );

        if (candidates.isEmpty()) {

            throw new IllegalStateException(
                    "No applications are ready for selection in this batch"
            );
        }

        if (normalizedMethod.equals("FIFO")) {

            candidates.sort((a, b) -> {

                LocalDateTime aTime =
                        a.getCreatedAt();

                LocalDateTime bTime =
                        b.getCreatedAt();

                if (aTime == null && bTime == null) {
                    return 0;
                }

                if (aTime == null) {
                    return 1;
                }

                if (bTime == null) {
                    return -1;
                }

                int result =
                        aTime.compareTo(bTime);

                if (result != 0) {
                    return result;
                }

                return Long.compare(
                        a.getApplicationId(),
                        b.getApplicationId()
                );
            });

        } else {

            Collections.shuffle(candidates);
        }

        Status confirmed =
                getStatus("CONFIRMED");

        Status waitlist =
                getStatus("WAITLIST");

        LocalDateTime selectedAt =
                LocalDateTime.now();

        int confirmedCount =
                Math.min(
                        confirmedQuota,
                        candidates.size()
                );

        for (int i = 0;
             i < candidates.size();
             i++) {

            Application application =
                    candidates.get(i);

            application.setSelectionMethod(
                    normalizedMethod
            );

            application.setSelectedAt(
                    selectedAt
            );

            if (i < confirmedCount) {

                application.setStatus(
                        confirmed
                );

            } else {

                application.setStatus(
                        waitlist
                );
            }

            applicationRepository.save(
                    application
            );
        }
    }
    // =========================================================
    // GET RESULT
    // =========================================================

    public AllocationResult getAllocationResult(
            Long tripId) {

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found: "
                                                + tripId
                                )
                        );

        List<Application> selected =
                applicationRepository
                        .findByTripIdAndStatusNames(
                                tripId,
                                List.of(
                                        "CONFIRMED",
                                        "WAITLIST"
                                )
                        );

        List<SelectedApplicant> dtos =
                selected.stream()
                        .map(this::mapToDto)
                        .toList();

        AllocationResult result =
                new AllocationResult();

        result.setTripName(
                trip.getTitle()
        );

        result.setMethod(
                trip.getAllocationMethod()
        );

        result.setConfirmedQuota(
                trip.getConfirmedQuota()
        );

        result.setWaitlistQuota(
                trip.getWaitlistQuota()
        );

        result.setSelectedApplicants(
                dtos
        );

        return result;
    }

    // =========================================================
    // ANNOUNCEMENT
    // =========================================================

    @Transactional
    public void publishAnnouncement(
            Long tripId,
            String message) {

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found: "
                                                + tripId
                                )
                        );

        trip.setAnnouncementMessage(
                message
        );

        tripRepository.save(trip);
    }

    // =========================================================
    // STATUS
    // =========================================================

    private Status getStatus(String name) {

        return statusRepository
                .findByStatusName(name)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Status '" +
                                        name +
                                        "' is missing from the database"
                        )
                );
    }

    // =========================================================
    // RESULT DTO
    // =========================================================

    private SelectedApplicant mapToDto(
            Application app) {

        SelectedApplicant dto =
                new SelectedApplicant();

        if (app.getEmployee() != null) {

            dto.setEmployeeId(
                    String.valueOf(
                            app.getEmployee()
                                    .getEmployeeId()
                    )
            );

            dto.setEmployeeName(
                    app.getEmployee()
                            .getFullName()
            );

            if (app.getEmployee()
                    .getDepartment() != null) {

                dto.setDepartment(
                        app.getEmployee()
                                .getDepartment()
                                .getDepartmentName()
                );
            }
        }

        /*
         * The UI calls this Submission Timestamp,
         * therefore it should use createdAt,
         * NOT selectedAt.
         */
        if (app.getCreatedAt() != null) {

            dto.setSubmissionTimestamp(
                    app.getCreatedAt()
                            .format(FORMATTER)
            );
        }

        if (app.getStatus() != null) {

            dto.setStatus(
                    app.getStatus()
                            .getStatusName()
            );
        }

        return dto;
    }
}