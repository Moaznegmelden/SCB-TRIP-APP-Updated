import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type HistoryStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface HistoryRequest {
  requestId: string;
  empName: string;
  empId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  submissionDate: string;
  status: HistoryStatus;
}

@Component({
  selector: 'app-manager-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manager-history.html'
})
export class ManagerHistory {

  // ---- Was the static <tr> rows in #historyTable ----
  requests: HistoryRequest[] = [
    { requestId: 'TRP-2026-00487', empName: 'Ahmed Hassan', empId: 'EMP-1042', tripName: 'Steigenberger El Gouna', startDate: '26-Jul-2026', endDate: '30-Jul-2026', submissionDate: '18-Jul-2026', status: 'pending' },
    { requestId: 'TRP-2026-00491', empName: 'Sara Ali', empId: 'EMP-1088', tripName: 'Marsa Alam Resort', startDate: '15-Aug-2026', endDate: '18-Aug-2026', submissionDate: '20-Jul-2026', status: 'pending' },
    { requestId: 'TRP-2026-00495', empName: 'Omar Farouk', empId: 'EMP-1102', tripName: 'Steigenberger El Gouna', startDate: '02-Aug-2026', endDate: '06-Aug-2026', submissionDate: '21-Jul-2026', status: 'pending' },
    { requestId: 'TRP-2026-00501', empName: 'Nour El-Din', empId: 'EMP-1154', tripName: 'Ain Sokhna Escape', startDate: '05-Sep-2026', endDate: '07-Sep-2026', submissionDate: '22-Jul-2026', status: 'pending' },
    { requestId: 'TRP-2026-00312', empName: 'Ahmed Hassan', empId: 'EMP-1042', tripName: 'Ain Sokhna Weekend', startDate: '05-Jun-2026', endDate: '07-Jun-2026', submissionDate: '01-May-2026', status: 'approved' },
    { requestId: 'TRP-2026-00288', empName: 'Sara Ali', empId: 'EMP-1088', tripName: 'Sharm El Sheikh', startDate: '12-May-2026', endDate: '16-May-2026', submissionDate: '20-Apr-2026', status: 'approved' },
    { requestId: 'TRP-2026-00245', empName: 'Omar Farouk', empId: 'EMP-1102', tripName: 'Sharm El Sheikh', startDate: '10-Apr-2026', endDate: '14-Apr-2026', submissionDate: '01-Mar-2026', status: 'rejected' },
    { requestId: 'TRP-2026-00190', empName: 'Nour El-Din', empId: 'EMP-1154', tripName: 'Marsa Alam Resort', startDate: '01-Mar-2026', endDate: '04-Mar-2026', submissionDate: '10-Feb-2026', status: 'expired' }
  ];

  // ---- Was static stat-card numbers in .stats-row (kept as-is, not tied to the table below — see notes) ----
  statPendingAction = 4;
  statApprovedThisMonth = 7;
  statRejected = 2;
  statExpired = 1;

  // ---- Was document.querySelectorAll('#historyTabs .tab') click listeners ----
  activeTab: HistoryStatus = 'pending';

  switchTab(tab: HistoryStatus): void {
    this.activeTab = tab;
  }

  // ---- Was row.style.display filtering by row.dataset.status === filter ----
  get filteredRequests(): HistoryRequest[] {
    return this.requests.filter(r => r.status === this.activeTab);
  }

  // ---- Was the hardcoded "4" next to the Pending tab label ----
  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  statusLabel(status: HistoryStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // ---- Was function actionRow(btn, newStatus) ----
  actionRow(req: HistoryRequest, newStatus: 'approved' | 'rejected'): void {
    const action = newStatus === 'approved' ? 'Approve' : 'Reject';
    if (!confirm(`${action} this request?`)) return;

    // If approved, store record so it can be added to the Employee Page
    if (newStatus === 'approved') {
      const approvedRecord = {
        requestId: req.requestId,
        empName: req.empName,
        empId: req.empId,
        tripName: req.tripName,
        startDate: req.startDate,
        endDate: req.endDate,
        approvalDate: new Date().toISOString().split('T')[0]
      };

      const currentApproved = JSON.parse(localStorage.getItem('approvedEmployees') || '[]');
      currentApproved.push(approvedRecord);
      localStorage.setItem('approvedEmployees', JSON.stringify(currentApproved));

      alert(`Request ${req.requestId} approved! ${req.empName} (${req.empId}) has been added to the employee records.`);
    }

    // Update status — the table/badge/action-buttons re-render automatically
    // from this state change (was manual DOM mutation of badge.className,
    // badge.textContent, and actionCell.innerHTML in the original).
    req.status = newStatus;
  }
}