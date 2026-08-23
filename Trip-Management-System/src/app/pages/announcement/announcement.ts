import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { HrTripService } from '../../services/hr-trip.service';
import { TripService, ActiveTripResponse } from '../../services/trip.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './announcement.html',
  styleUrl: './announcement.css'
})
export class Announcement implements OnInit {

  allocation: any = null;

  loading = true;
  errorMessage = '';

  // Header user information
  currentUser: any = null;

  userDisplayName = 'Employee Portal';
  userDisplayRole = 'View Mode';
  userInitials = 'EP';

  // Approved / Active trips
  activeTrips: ActiveTripResponse[] = [];
  isListMode = false;


  constructor(
    private hrTripService: HrTripService,
    private tripService: TripService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('ANNOUNCEMENT INIT');

    // Get logged-in user
    const user = localStorage.getItem('currentUser');

    if (user) {
      this.currentUser = JSON.parse(user);

      if (this.currentUser.role === 'HR_ADMIN') {
        this.userDisplayName = 'HR User';
        this.userDisplayRole = 'Administration';
        this.userInitials = 'HU';

      } else if (this.currentUser.role === 'HR_MANAGER') {
        this.userDisplayName = 'HR Manager';
        this.userDisplayRole = 'Manager Authority';
        this.userInitials = 'HM';
      }
    }

    // Check whether a tripId exists in the URL
    const tripIdParam = this.route.snapshot.paramMap.get('tripId');
    
if (tripIdParam) {

  this.isListMode = false;

  // =====================================================
  // DETAILS MODE
  // =====================================================

  const tripId = Number(tripIdParam);

  if (!tripId) {
    this.loading = false;
    this.errorMessage = 'Invalid Trip ID.';
    return;
  }

  console.log('DETAILS MODE - TRIP ID:', tripId);

  this.loadAllocationResult(tripId);

} else {

  this.isListMode = true;

  // =====================================================
  // LIST MODE
  // =====================================================

  console.log('LIST MODE - LOADING APPROVED TRIPS');

  this.loadActiveTrips();
}

  }

  // =========================================================
  // LOAD APPROVED / ACTIVE TRIPS
  // =========================================================

  private loadActiveTrips(): void {

    this.tripService.getActiveTrips().subscribe({

      next: (data) => {

        console.log('ACTIVE TRIPS API SUCCESS:', data);

        this.activeTrips = data;

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('ACTIVE TRIPS API ERROR:', error);

        this.errorMessage = 'Failed to load approved trips.';
        this.loading = false;
      }

    });
  }

  // =========================================================
  // LOAD ALLOCATION DETAILS
  // =========================================================

  private loadAllocationResult(tripId: number): void {

    console.log('CALLING ALLOCATION API');

    this.hrTripService.getAllocationResult(tripId).subscribe({

      next: (data) => {

        console.log('API SUCCESS:', data);

        this.allocation = data;

        console.log('CONFIRMED BEFORE CDR:', this.confirmedApplicants);

        this.loading = false;

        this.cdr.detectChanges();

        console.log('CDR DETECT CHANGES DONE');
      },

      error: (error) => {

        console.error('API ERROR:', error);

        this.errorMessage = 'Failed to load announcement.';
        this.loading = false;
      }

    });
  }

  // =========================================================
  // CONFIRMED APPLICANTS
  // =========================================================

  get confirmedApplicants() {

    return this.allocation?.selectedApplicants?.filter(
      (applicant: any) =>
        String(applicant.status ?? '').trim().toUpperCase() === 'CONFIRMED'
    ) ?? [];

  }

}
