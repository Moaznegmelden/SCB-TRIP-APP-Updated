import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type RequestStatus = 'pending' | 'approved' | 'rejected' | string;
type TabFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface ApplicationApi {
  tripTitle?: string;
  destination?: string;
  batchId?: string;
  statusName?: string;
  participants?: unknown[];
}

interface RequestRow {
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

  private readonly API_URL = 'http://localhost:8080/api/applications/my?employeeId=1';

  // ---- Was static stat-card numbers in .stats-row (kept as-is — see notes) ----
  statPending = 2;
  statApproved = 1;
  statRejected = 1;
  statTotal = 4;

  // ---- Was document.querySelectorAll('#requestTabs .tab') click listeners ----
  activeTab: TabFilter = 'all';

  // null = still loading, [] = loaded but empty/errored
  requests: RequestRow[] | null = null;
  loadError = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  // ---- Was async loadRequests() ----
  loadRequests(): void {
    this.loadError = false;
    this.requests = null;

    this.http.get<ApplicationApi[]>(this.API_URL).subscribe({
      next: (applications) => {
        this.requests = applications.map(app => {
          const status = (app.statusName || 'pending').toLowerCase();
          return {
            tripTitle: app.tripTitle || 'Trip',
            destination: app.destination || 'N/A',
            departure: app.batchId || 'N/A',
            appliedOn: new Date().toLocaleDateString('en-GB'),
            companions: app.participants ? app.participants.length : 0,
            status,
            statusDisplay: app.statusName || 'Pending'
          };
        });
      },
      error: () => {
        this.loadError = true;
        this.requests = [];
      }
    });
  }

  switchTab(tab: TabFilter): void {
    this.activeTab = tab;
  }

  // ---- Was the row.dataset.status === filter / filter === 'all' check ----
  get filteredRequests(): RequestRow[] {
    if (!this.requests) return [];
    if (this.activeTab === 'all') return this.requests;
    return this.requests.filter(r => r.status === this.activeTab);
  }
}