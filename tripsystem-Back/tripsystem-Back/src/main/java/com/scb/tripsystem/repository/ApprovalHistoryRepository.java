package com.scb.tripsystem.repository;

import com.scb.tripsystem.entity.ApprovalHistory;
import com.scb.tripsystem.entity.Application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalHistoryRepository
        extends JpaRepository<ApprovalHistory, Long> {


    // =========================================================
    // HISTORY OF ONE APPLICATION
    // =========================================================

    List<ApprovalHistory> findByApplication(
            Application application
    );


    List<ApprovalHistory>
    findByApplication_ApplicationId(
            Long applicationId
    );


    // =========================================================
    // LINE MANAGER - APPROVAL HISTORY
    //
    // Returns ONLY decisions made by the current manager.
    //
    // actionBy = the employee who performed the action.
    // =========================================================

    List<ApprovalHistory>
    findByActionBy_EmployeeIdAndRoleAtActionOrderByActionAtDesc(
            Long employeeId,
            String roleAtAction
    );
}