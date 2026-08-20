import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type HistoryStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface ApplicationApi {
  applicationId?: number;
  batchId?: number;
  destination?: string;
  employeeId?: number;
  employeeName?: string;
  employeeNumber?: string;
  participants?: unknown[];
  pickupPoint?: string;
  roomsRequested?: number;
  selectedAt?: string | null;
  selectionMethod?: string | null;
  statusName?: string;
  totalPrice?: number;
  transportType?: string;
  tripId?: number;
  tripTitle?: string;
}

interface HistoryRequest {
  applicationId: number;
  requestId: string;
  empName: string;
  empId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  submissionDate: string;
  status: HistoryStatus;
  destination: string;
  companions: number;
  totalPrice: number;
}

@Component({
  selector: 'app-manager-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manager-history.html'
})
export class ManagerHistory implements OnInit {

  private readonly MANAGER_ID = 1017;
  private readonly API_URL = `http://localhost:8080/api/applications/manager/${this.MANAGER_ID}`;

  requests: HistoryRequest[] = [];
  loading = true;
  loadError = false;

  statPendingAction = 0;
  statApprovedThisMonth = 0;
  statRejected = 0;
  statExpired = 0;

  activeTab: HistoryStatus = 'pending';

  constructor(private http: HttpClient) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    const savedRequests = localStorage.getItem('managerRequests');
    if (savedRequests) {
      this.requests = JSON.parse(savedRequests);
      this.updateStatistics();
      this.loading = false;
    } else {
      this.loadRequests();
    }
  }

  // =========================
  // LOAD MANAGER REQUESTS
  // =========================
  loadRequests(): void {
    this.loading = true;
    this.loadError = false;

    this.http
      .get<ApplicationApi[]>(this.API_URL)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (applications) => {
          this.requests = applications.map(app => this.mapApplication(app));
          
          localStorage.setItem('managerRequests', JSON.stringify(this.requests));
          this.updateStatistics();
        },
        error: (error) => {
          console.error('🔥 MANAGER APPLICATIONS ERROR:', error);
          this.requests = [];
          this.loadError = true;
        }
      });
  }

  private mapApplication(app: ApplicationApi): HistoryRequest {
    return {
      applicationId: app.applicationId ?? 0,
      requestId: `REQ-${app.applicationId ?? 0}`,
      empName: app.employeeName ?? 'Unknown Employee',
      empId: app.employeeNumber ?? 'N/A',
      tripName: app.tripTitle ?? 'Trip',
      startDate: 'N/A',
      endDate: 'N/A',
      submissionDate: 'N/A',
      status: this.mapStatus(app.statusName),
      destination: app.destination ?? 'N/A',
      companions: app.participants?.length ?? 0,
      totalPrice: app.totalPrice ?? 0
    };
  }

  private mapStatus(statusName?: string): HistoryStatus {
    const status = (statusName ?? '').toUpperCase();
    if (status === 'PENDING_MANAGER' || status.includes('PENDING')) return 'pending';
    if (status.includes('APPROV')) return 'approved';
    if (status.includes('REJECT')) return 'rejected';
    if (status.includes('EXPIRED')) return 'expired';
    return 'pending';
  }

  private updateStatistics(): void {
    this.statPendingAction = this.requests.filter(r => r.status === 'pending').length;
    this.statApprovedThisMonth = this.requests.filter(r => r.status === 'approved').length;
    this.statRejected = this.requests.filter(r => r.status === 'rejected').length;
    this.statExpired = this.requests.filter(r => r.status === 'expired').length;
  }

  switchTab(tab: HistoryStatus): void {
    this.activeTab = tab;
  }

  get filteredRequests(): HistoryRequest[] {
    return this.requests.filter(r => r.status === this.activeTab);
  }

  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  statusLabel(status: HistoryStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  actionRow(req: HistoryRequest, newStatus: 'approved' | 'rejected'): void {
    const action = newStatus === 'approved' ? 'Approve' : 'Reject';
    if (!confirm(`${action} this request?`)) return;

    const url = `http://localhost:8080/api/applications/${req.applicationId}/${newStatus === 'approved' ? 'approve' : 'reject'}?managerId=${this.MANAGER_ID}`;

    this.http.post<ApplicationApi>(url, {}).subscribe({
      next: (response) => {
        req.status = newStatus;
        this.updateStatistics();
        alert(`Request ${req.requestId} ${newStatus}.`);
      
        localStorage.setItem('managerRequests', JSON.stringify(this.requests));
        this.loadRequests();
      },
      error: (error) => {
        console.error('🔥 MANAGER DECISION ERROR:', error);
        alert(`Unable to ${newStatus} this request.`);
      }
    });
  }
}
