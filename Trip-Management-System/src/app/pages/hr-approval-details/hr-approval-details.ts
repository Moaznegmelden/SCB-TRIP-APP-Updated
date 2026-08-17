import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface Departure {
  startDate: string;
  endDate: string;
  capacity: number;
  busSeats: number;
}

interface Trip {
  id: number;
  title: string;
  destination: string;
  duration: string;
  registrationOpens: string;
  registrationCloses: string;
  familyDegree: string;
  numberOfCompanions: number;
  createdBy: string;
  submittedAt: string;
  status: string;
  rejectionReason?: string;
  departures: Departure[];
}

@Component({
  selector: 'app-hr-approval-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './hr-approval-details.html',
  styleUrl: './hr-approval-details.css'
})
export class HrApprovalDetails implements OnInit {

  // =========================================================
  // TRIP
  // =========================================================

  trip: Trip | null = null;


  // =========================================================
  // REJECTION PANEL
  // =========================================================

  showRejectReason = false;

  rejectionReasonInput = '';


 constructor(
  private route: ActivatedRoute,
  private router: Router,
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadTrip(id);
  }


  // =========================================================
  // LOAD TRIP
  // =========================================================

 private loadTrip(id: number): void {

  console.log('🔥 LOAD TRIP DETAILS:', id);

  this.http
    .get<any>(`/api/trips/${id}`)
    .subscribe({

      next: (trip) => {

        console.log('🔥 TRIP DETAILS RESPONSE:', trip);

        this.trip = {
          id: trip.tripId,
          title: trip.title,
          destination: trip.destination,
          duration: `${trip.durationDays} days`,
          registrationOpens: trip.registrationOpen,
          registrationCloses: trip.registrationClose,
          familyDegree: '-',
          numberOfCompanions: 0,
          createdBy: trip.createdByName,
          submittedAt: trip.createdAt,
          status: trip.statusName,

          departures: (trip.batches ?? []).map((batch: any) => ({
            startDate: batch.startDate,
            endDate: batch.endDate,
            capacity: batch.numberOfRooms ?? 0,
            busSeats: 0
          }))
        };

        console.log('🔥 TRIP DATA FOR PAGE:', this.trip);
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('🔥 TRIP DETAILS ERROR:', error);

        this.trip = null;

        alert('Failed to load trip details.');
      }
    });
}


  // =========================================================
  // REJECTION PANEL
  // =========================================================

  toggleReason(show: boolean): void {

    this.showRejectReason = show;

    /*
     * If the panel is being closed,
     * don't delete the typed reason.
     * This allows the user to reopen it without losing text.
     */
  }


  // =========================================================
  // APPROVE
  // =========================================================

  approve(): void {

  if (!this.trip) {
    return;
  }

  const confirmed = window.confirm(
    'Approve this trip and publish it?'
  );

  if (!confirmed) {
    return;
  }

  const managerId = 1;

  console.log(
    '🔥 APPROVING TRIP:',
    this.trip.id,
    'MANAGER:',
    managerId
  );

  this.http
    .post(
      `/api/trips/${this.trip.id}/approve?managerId=${managerId}`,
      {}
    )
    .subscribe({

      next: (response) => {

        console.log('🔥 APPROVE RESPONSE:', response);

        alert('Trip approved successfully.');

        this.router.navigate(['/admin/trips/approvals']);
      },

      error: (error) => {

        console.error('🔥 APPROVE ERROR:', error);

        alert('Failed to approve trip.');
      }
    });
}


    // =========================================================
  // REJECT
  // =========================================================

  reject(): void {

    if (!this.trip) {
      return;
    }

    const reason = this.rejectionReasonInput.trim();

    if (!reason) {

      alert(
        'Please enter a reason for rejecting this trip.'
      );

      return;
    }

    const managerId = 1;

    console.log(
      '🔥 REJECTING TRIP:',
      this.trip.id,
      'MANAGER:',
      managerId,
      'REASON:',
      reason
    );

    const body = {
      comments: reason
    };

    this.http
      .post(
        `/api/trips/${this.trip.id}/reject?managerId=${managerId}`,
        body
      )
      .subscribe({

        next: (response) => {

          console.log('🔥 REJECT RESPONSE:', response);

          alert('Trip rejected successfully.');

          this.showRejectReason = false;

          this.router.navigate(['/admin/trips/approvals']);
        },

        error: (error) => {

          console.error('🔥 REJECT ERROR:', error);

          alert('Failed to reject trip.');
        }

      });
  }
}