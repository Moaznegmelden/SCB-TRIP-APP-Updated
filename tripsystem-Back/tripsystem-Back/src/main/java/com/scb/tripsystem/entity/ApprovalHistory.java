package com.scb.tripsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_history")
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_by")
    private Employee actionBy;

    @Column(name = "role_at_action")
    private String roleAtAction;

    private String action;

    private String comments;

    @Column(name = "action_at")
    private LocalDateTime actionAt;

    public ApprovalHistory() {}

    // Getters and Setters
    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public Employee getActionBy() { return actionBy; }
    public void setActionBy(Employee actionBy) { this.actionBy = actionBy; }

    public String getRoleAtAction() { return roleAtAction; }
    public void setRoleAtAction(String roleAtAction) { this.roleAtAction = roleAtAction; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getActionAt() { return actionAt; }
    public void setActionAt(LocalDateTime actionAt) { this.actionAt = actionAt; }
}