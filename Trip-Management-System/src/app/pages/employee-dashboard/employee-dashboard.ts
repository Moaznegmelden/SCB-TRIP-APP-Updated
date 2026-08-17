import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard implements OnInit {

    isHrOrManager = true;

  // =========================================================
  // DEMO MODE
  // =========================================================

  usingDemoData = true;

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


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {
    this.loadDemoTrips();
  }


  // =========================================================
  // DEMO TRIP DATA
  // =========================================================

 private loadDemoTrips(): void {

  this.trips = [

    {
      tripId: 'TRIP-001',

      title: 'Steigenberger El Gouna',
      destination: 'El Gouna',

      durationDays: 5,

      startDate: '2026-08-26',
      endDate: '2026-08-30',

      registrationOpen: '2026-08-01',
      registrationClose: '2026-08-20',

      seatsAvailable: 12,
      totalSeats: 100,

      status: 'Open'
    },

    {
      tripId: 'TRIP-002',

      title: 'Steigenberger El Gouna',
      destination: 'El Gouna',

      durationDays: 5,

      startDate: '2026-09-05',
      endDate: '2026-09-09',

      registrationOpen: '2026-08-05',
      registrationClose: '2026-08-30',

      seatsAvailable: 3,
      totalSeats: 100,

      status: 'Nearly full',

      waitlistAvailable: true
    },

    {
      tripId: 'TRIP-003',

      title: 'Alexandria Summer Weekend',
      destination: 'Alexandria',

      durationDays: 3,

      startDate: '2026-10-20',
      endDate: '2026-10-22',

      registrationOpen: '2026-10-01',
      registrationClose: '2026-10-15',

      seatsAvailable: 50,
      totalSeats: 50,

      status: 'Upcoming',

      registrationOpensText: 'Registration opens 1 Oct'
    }

  ];
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


  // =========================================================
  // BACKEND VERSION - USE LATER
  // =========================================================

  /*
   * When the Spring Boot backend is ready, we can replace
   * loadDemoTrips() with the HttpClient implementation.
   *
   * For now we deliberately use local data so that you can
   * finish and test the UI independently from the backend.
   */
}