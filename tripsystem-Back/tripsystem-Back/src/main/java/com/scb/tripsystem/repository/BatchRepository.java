package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.Batch;
import com.scb.tripsystem.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    List<Batch> findByTrip(Trip trip);

    List<Batch> findByTrip_TripId(Long tripId);
}