package com.scb.tripsystem.service;

import com.scb.tripsystem.dto.AllocationResult;
import com.scb.tripsystem.dto.SelectedApplicant;
import com.scb.tripsystem.entity.Application;
import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.repository.ApplicationRepository;
import com.scb.tripsystem.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final TripRepository tripRepository;
    private final ApplicationRepository applicationRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public AllocationResult getAllocationResult(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        List<Application> selected = applicationRepository
                .findByTripIdAndStatusNames(tripId, List.of("CONFIRMED", "WAITLIST", "ACCEPTED", "SELECTED"));

        List<SelectedApplicant> dtos = selected.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        AllocationResult result = new AllocationResult();
        result.setTripName(trip.getTitle());                    // ← correct (you use title)
        result.setMethod(trip.getAllocationMethod());
        result.setConfirmedQuota(trip.getConfirmedQuota());
        result.setWaitlistQuota(trip.getWaitlistQuota());
        result.setSelectedApplicants(dtos);

        return result;
    }

    @Transactional
    public void publishAnnouncement(Long tripId, String message) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        trip.setAnnouncementMessage(message);
        tripRepository.save(trip);
    }

    private SelectedApplicant mapToDto(Application app) {
        SelectedApplicant dto = new SelectedApplicant();

        if (app.getEmployee() != null) {
            dto.setEmployeeId(String.valueOf(app.getEmployee().getEmployeeId()));
            dto.setEmployeeName(app.getEmployee().getFullName());   // change if different

            if (app.getEmployee().getDepartment() != null) {
                dto.setDepartment(app.getEmployee().getDepartment().getDepartmentName());
            }
        }

        if (app.getSelectedAt() != null) {
            dto.setSubmissionTimestamp(app.getSelectedAt().format(FORMATTER));
        }

        if (app.getStatus() != null) {
            dto.setStatus(app.getStatus().getStatusName());
        }

        return dto;
    }
}