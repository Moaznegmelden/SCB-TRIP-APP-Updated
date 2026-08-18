import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type RequestStatus = 'pending' | 'approved' | 'rejected' | string;
type TabFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface ApplicationApi {
  applicationId: number;
  tripTitle?: string;
  destination?: string;
  batchId?: string;
  statusName?: string;
  participants?: unknown[];
}

interface RequestRow {
  applicationId: number;
  tripTitle: string;
  destination: string;
  departure: string;
  appliedOn: string;
  companions: number;
  status: RequestStatus;
  statusDisplay: string;
}

@Component({
  selector: 'app-myreq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-requests.html'
})
export class MyRequests implements OnInit {

 private readonly API_URL = '/api/applications/my?employeeId=1015';

  // ---- Was static stat-card numbers in .stats-row (kept as-is — see notes) ----
  statPending = 2;
  statApproved = 1;
  statRejected = 1;
  statTotal = 4;

  // ---- Was document.querySelectorAll('#requestTabs .tab') click listeners ----
  activeTab: TabFilter = 'all';

  // null = still loading, [] = loaded but empty/errored
  requests: RequestRow[] = [];
loadError = false;

  constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  // ---- Was async loadRequests() ----
  loadRequests(): void {
  this.loadError = false;
  this.requests = [];

  this.http.get<ApplicationApi[]>(this.API_URL).subscribe({
    next: (applications) => {

      console.log('MY REQUESTS API:', applications);

     this.requests = applications.map(app => {
  const rawStatus = (app.statusName || 'PENDING').toUpperCase();

  let status: RequestStatus = 'pending';
  let statusDisplay = 'Pending';

  if (rawStatus.includes('REJECT')) {
    status = 'rejected';
    statusDisplay = 'Rejected';
  } else if (rawStatus.includes('APPROV')) {
    status = 'approved';
    statusDisplay = 'Approved';
  }

  return {
    applicationId: app.applicationId!,
    tripTitle: app.tripTitle || 'Trip',
    destination: app.destination || 'N/A',
    departure: String(app.batchId ?? 'N/A'),
    appliedOn: new Date().toLocaleDateString('en-GB'),
    companions: app.participants?.length ?? 0,
    status,
    statusDisplay
  };
});

      console.log('MY REQUESTS MAPPED:', this.requests);

      // Update statistics from real API data
      this.statTotal = this.requests.length;
      this.statPending = this.requests.filter(r => r.status === 'pending').length;
      this.statApproved = this.requests.filter(r => r.status === 'approved').length;
      this.statRejected = this.requests.filter(r => r.status === 'rejected').length;

      // Force Angular to refresh the view
      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error('MY REQUESTS ERROR:', error);

      this.loadError = true;
      this.requests = [];

      this.statTotal = 0;
      this.statPending = 0;
      this.statApproved = 0;
      this.statRejected = 0;

      this.cdr.detectChanges();
    }
  });
}

  switchTab(tab: TabFilter): void {
    this.activeTab = tab;
  }

  // ---- Was the row.dataset.status === filter / filter === 'all' check ----
  get filteredRequests(): RequestRow[] {
  console.log('🔥 FILTER:', {
    requests: this.requests,
    activeTab: this.activeTab,
    count: this.requests?.length
  });

  if (!this.requests) {
    return [];
  }

  if (this.activeTab === 'all') {
    return this.requests;
  }

  return this.requests.filter(r => r.status === this.activeTab);
}
}