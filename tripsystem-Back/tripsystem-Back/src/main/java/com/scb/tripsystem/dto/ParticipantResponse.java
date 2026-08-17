package com.scb.tripsystem.dto;

import java.time.LocalDate;

public class ParticipantResponse {

    private Long participantId;
    private String fullName;
    private String relationship;
    private LocalDate dateOfBirth;

    public ParticipantResponse() {}

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}