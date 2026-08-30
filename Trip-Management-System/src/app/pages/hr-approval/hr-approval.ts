import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../header/header';

interface BackendPendingTrip {
  tripId: number;
  title: string;
  destination: string;
  registrationOpen: string;
  registrationClose: string;
  durationDays: number;
  createdAt: string;
  statusName: string;
  createdByName: string;
  batches: unknown[];
}

interface PendingTrip {
  id: string;
  title: string;
  destination: string;
  duration: string;
  registrationOpens: string;
  registrationCloses: string;
  batches: unknown[];
  createdBy: string;
  submittedAt: string;
}

interface BackendSelectionRequest {
  selectionRequestId: number;
  tripId: number;
  tripName: string;
  batchId: number;
  batchName: string;
  method: string;
  status: string;
  rejectionReason: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  requestedById: number;
  requestedByName: string;
  reviewedById: number | null;
  reviewedByName: string | null;
}

@Component({
  selector: 'app-hr-approval',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    Header
  ],

  templateUrl: './hr-approval.html',
  styleUrl: './hr-approval.css'
})
export class HrApproval implements OnInit {

  pendingTrips: PendingTrip[] | null = null;

  pendingSelections: BackendSelectionRequest[] | null = null;

  private managerId: number | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

  this.managerId = this.getCurrentUserId();

  console.log('🔥 HR MANAGER ID:', this.managerId);

  if (!this.managerId) {
    console.error('🔥 No valid HR Manager ID found.');
    this.pendingSelections = [];
    return;
  }

  this.loadPendingTrips();
  this.loadPendingSelections();
}

  loadPendingTrips(): void {

    this.pendingTrips = null;

    this.http
      .get<BackendPendingTrip[]>('http://localhost:8081/api/trips/pending')
      .subscribe({

        next: (trips) => {
          this.pendingTrips = trips.map(trip => ({
            id: String(trip.tripId),
            title: trip.title,
            destination: trip.destination,
            duration: `${trip.durationDays} days`,
            registrationOpens: trip.registrationOpen,
            registrationCloses: trip.registrationClose,
            batches: trip.batches ?? [],
            createdBy: trip.createdByName,
            submittedAt: trip.createdAt
          }));

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('🔥 PENDING TRIPS ERROR:', error);
          this.pendingTrips = [];
        }
      });
  }

loadPendingSelections(): void {

  if (!this.managerId) {
    console.error('🔥 Cannot load selections: managerId is missing.');
    this.pendingSelections = [];
    return;
  }

  this.pendingSelections = null;

  this.http
    .get<BackendSelectionRequest[]>(
      `http://localhost:8081/api/selections/pending?managerId=${this.managerId}`
    )
    .subscribe({

      next: (requests) => {
        console.log('🔥 PENDING SELECTIONS:', requests);
        this.pendingSelections = requests;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('🔥 PENDING SELECTIONS ERROR:', error);
        this.pendingSelections = [];
      }
    });
}


  private getCurrentUserId(): number | null {
  try {
    const raw =
      sessionStorage.getItem('currentUser') ??
      localStorage.getItem('currentUser');

    if (!raw) {
      return null;
    }

    const user = JSON.parse(raw);
    const id = Number(user?.employeeId);

    return Number.isFinite(id) && id > 0 ? id : null;

  } catch (error) {
    console.error('🔥 Failed to read current user:', error);
    return null;
  }
}

  approveSelection(requestId: number): void {

  if (!this.managerId) {
    alert('HR Manager ID not found.');
    return;
  }

  const confirmed = window.confirm('Approve this selection?');

  if (!confirmed) {
    return;
  }

  this.http
    .post(
      `http://localhost:8081/api/selections/requests/${requestId}/approve?managerId=${this.managerId}`,
      {}
    )
    .subscribe({

      next: () => {
        alert('Selection approved.');
        this.loadPendingSelections();
      },

      error: (error) => {
        console.error('🔥 APPROVE SELECTION ERROR:', error);
        alert(error?.error?.message ?? 'Failed to approve selection.');
      }
    });
}
  rejectSelection(requestId: number): void {

  if (!this.managerId) {
    alert('HR Manager ID not found.');
    return;
  }

  const reason = window.prompt('Reason for rejecting this selection:');

  if (!reason || !reason.trim()) {
    return;
  }

  this.http
    .post(
      `http://localhost:8081/api/selections/requests/${requestId}/reject?managerId=${this.managerId}`,
      { comments: reason.trim() }
    )
    .subscribe({

      next: () => {
        alert('Selection rejected.');
        this.loadPendingSelections();
      },

      error: (error) => {
        console.error('🔥 REJECT SELECTION ERROR:', error);
        alert(error?.error?.message ?? 'Failed to reject selection.');
      }
    });
}
}