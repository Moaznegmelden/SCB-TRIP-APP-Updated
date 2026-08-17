package com.scb.tripsystem.dto;

import java.time.LocalDateTime;

public class ApprovalHistoryResponse {

    private Long historyId;
    private String actionByName;
    private String roleAtAction;
    private String action;
    private String comments;
    private LocalDateTime actionAt;

    public ApprovalHistoryResponse() {}

    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public String getActionByName() { return actionByName; }
    public void setActionByName(String actionByName) { this.actionByName = actionByName; }

    public String getRoleAtAction() { return roleAtAction; }
    public void setRoleAtAction(String roleAtAction) { this.roleAtAction = roleAtAction; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getActionAt() { return actionAt; }
    public void setActionAt(LocalDateTime actionAt) { this.actionAt = actionAt; }
}