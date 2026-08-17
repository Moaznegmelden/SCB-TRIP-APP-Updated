import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

@Component({
  selector: 'app-hr-approval',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hr-approval.html'
})
export class HrApproval implements OnInit {

  pendingTrips: PendingTrip[] | null = null;

 constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.loadPendingTrips();
  }

  loadPendingTrips(): void {

  console.log('🔥 LOAD PENDING TRIPS START');

  this.pendingTrips = null;

  this.http
    .get<BackendPendingTrip[]>('/api/trips/pending')
    .subscribe({

    
      next: (trips) => {

        console.log('🔥 BACKEND RESPONSE:', trips);

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

        console.log('🔥 ANGULAR DATA:', this.pendingTrips);
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('🔥 HTTP ERROR:', error);

        this.pendingTrips = [];
      }
    });
}
}