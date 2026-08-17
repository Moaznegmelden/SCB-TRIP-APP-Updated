package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.Trip;
import com.scb.tripsystem.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByStatus(Status status);

    List<Trip> findByStatus_StatusName(String statusName);
}