package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.ApplicationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationParticipantRepository extends JpaRepository<ApplicationParticipant, Long> {
}