package com.scb.tripsystem.dto;

import java.time.LocalDate;

public class ParticipantRequest {

    private String fullName;
    private String relationship;
    private LocalDate dateOfBirth;

    public ParticipantRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}