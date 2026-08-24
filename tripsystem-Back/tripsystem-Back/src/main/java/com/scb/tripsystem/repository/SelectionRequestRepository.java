package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.SelectionRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SelectionRequestRepository
        extends JpaRepository<SelectionRequestEntity, Long> {

    Optional<SelectionRequestEntity>
    findFirstByTrip_TripIdAndBatch_BatchIdAndStatusOrderByRequestedAtDesc(
            Long tripId,
            Long batchId,
            String status
    );

    Optional<SelectionRequestEntity>
    findFirstByTrip_TripIdAndBatch_BatchIdOrderByRequestedAtDesc(
            Long tripId,
            Long batchId
    );

    List<SelectionRequestEntity>
    findByStatusOrderByRequestedAtAsc(
            String status
    );
}