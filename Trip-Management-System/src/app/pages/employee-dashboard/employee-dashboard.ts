import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../header/header';

interface Trip {
  tripId: string;
  title: string;
  destination: string;
  durationDays: number;

  startDate: string;
  endDate: string;

  registrationOpen: string;
  registrationClose: string;

  seatsAvailable: number;
  totalSeats: number;

  status: 'Open' | 'Nearly full' | 'Upcoming';

  waitlistAvailable?: boolean;
  registrationOpensText?: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    Header
  ],

  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard implements OnInit {

  // =========================================================
  // DEMO MODE
  // =========================================================

  usingDemoData = false;

  loadError = false;

  trips: Trip[] | null = null;


  // =========================================================
  // ELIGIBILITY SNAPSHOT
  // =========================================================

  eligibility = {
    employmentStatus: 'Active',
    employmentVerified: true,

    serviceRequirement: 'Met',
    serviceVerified: true,

    tripsThisYear: '0 of 1',
    tripsVerified: true,

    profileData: 'Complete',
    profileVerified: true
  };


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {
    this.loadTrips();
  }


  // =========================================================
  // LOAD ACTIVE TRIPS FROM BACKEND
  // =========================================================

  private loadTrips(): void {

    this.loadError = false;
    this.trips = null;

    this.http
      .get<any[]>('http://localhost:8081/api/trips/active')
      .subscribe({

        next: (backendTrips) => {

          console.log('🔥 ACTIVE TRIPS:', backendTrips);

          this.trips = backendTrips.map(trip => {

            const firstBatch = trip.batches?.[0];

            return {
              tripId: String(trip.tripId),

              title: trip.title,

              destination: trip.destination,

              durationDays: trip.durationDays,

              startDate: firstBatch?.startDate ?? '',

              endDate: firstBatch?.endDate ?? '',

              registrationOpen: trip.registrationOpen,

              registrationClose: trip.registrationClose,

              seatsAvailable: firstBatch?.numberOfRooms ?? 0,

              totalSeats: firstBatch?.numberOfRooms ?? 0,

              status: 'Open'
            };

          });

          this.cdr.detectChanges();

          console.log('🔥 ANGULAR TRIPS:', this.trips);
        },

        error: (error) => {

          console.error('🔥 ACTIVE TRIPS ERROR:', error);

          this.loadError = true;
          this.trips = [];
        }

      });
  }


  // =========================================================
  // HELPERS
  // =========================================================

  formatDate(date: string): string {

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }


  tripDateRange(trip: Trip): string {

    return `${this.formatDate(trip.startDate)} – ${this.formatDate(trip.endDate)}`;
  }


  registrationWindow(trip: Trip): string {

    return `${this.formatDate(trip.registrationOpen)} – ${this.formatDate(trip.registrationClose)}`;
  }


  getStatusClass(status: Trip['status']): string {

    switch (status) {

      case 'Open':
        return 'status-open';

      case 'Nearly full':
        return 'status-nearly-full';

      case 'Upcoming':
        return 'status-upcoming';

      default:
        return '';
    }
  }

}