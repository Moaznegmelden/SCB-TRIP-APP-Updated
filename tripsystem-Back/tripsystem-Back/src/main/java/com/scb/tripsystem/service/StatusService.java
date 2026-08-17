package com.scb.tripsystem.service;

import com.scb.tripsystem.entity.Status;
import com.scb.tripsystem.repository.StatusRepository;
import org.springframework.stereotype.Service;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

    public Status getByName(String name) {
        return statusRepository.findByStatusName(name)
                .orElseThrow(() -> new RuntimeException("Status not found: " + name));
    }
}