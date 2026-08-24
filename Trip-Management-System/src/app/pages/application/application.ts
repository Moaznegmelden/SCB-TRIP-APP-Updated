import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface AdultCompanion {
  name: string;
  relation: string;
  nationalId: string;
}

interface ChildCompanion {
  name: string;
  dob: string;
  nationalId: string;
}

interface Batch {
  batchId: number;
  startDate: string;
  endDate: string;
  numberOfRooms: number;
  isActive: boolean;
}

interface TripDetails {
  tripId: number;
  title: string;
  destination: string;
  durationDays: number;
  registrationOpen: string;
  registrationClose: string;
  statusName: string;
  batches: Batch[];
}

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './application.html',
  styleUrl: './application.css'   // ← add this
})
export class Application implements OnInit {

  // ---- Pricing variables (can be loaded from API later) ----
  readonly PRICE = {
    employee: 2800,
    adult: 3200,
    child: 1800,
    infant: 0,
    bus: 350,
    activity: 450
  };
  readonly MAX_COMPANIONS = 3;

  // ---- Form state (mirrors the original #departure, #adults, etc.) ----
  departure = '';
  adults = 0;
  children = 0;
  infants = 0;
  busSeat = false;
  extraActivity = false;
  notes = '';

  // ---- Dynamic companion detail rows (was innerHTML in #companionDetails) ----
  adultCompanions: AdultCompanion[] = [];
  childCompanions: ChildCompanion[] = [];

  submitting = false;

  trip: TripDetails | null = null;

selectedBatchId: number | null = null;

loadingTrip = false;

loadError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  // ---- Calculator (was recalculate()) ----
  get busPersons(): number {
    return this.busSeat ? 1 + this.adults + this.children : 0;
  }

  get busCost(): number {
    return this.busSeat ? this.busPersons * this.PRICE.bus : 0;
  }

  get activityCost(): number {
    return this.extraActivity ? this.PRICE.activity : 0;
  }

  get adultsCost(): number {
    return this.adults * this.PRICE.adult;
  }

  get childrenCost(): number {
    return this.children * this.PRICE.child;
  }

  get total(): number {
    return this.PRICE.employee + this.adultsCost + this.childrenCost + this.busCost + this.activityCost;
  }

  format(n: number): string {
    return n.toLocaleString('en-EG') + ' EGP';
  }

  // ---- Companion count changes (was onchange="recalculate(); updateCompanionFields()") ----
  onAdultsChange(): void {
    this.enforceCompanionLimit();
    this.syncAdultCompanions();
  }

  onChildrenChange(): void {
    this.enforceCompanionLimit();
    this.syncChildCompanions();
  }

  private enforceCompanionLimit(): void {
    const totalComp = this.adults + this.children;
    if (totalComp > this.MAX_COMPANIONS) {
      alert(`Maximum ${this.MAX_COMPANIONS} companions allowed (adults + children).`);
      this.adults = 0;
      this.children = 0;
      this.adultCompanions = [];
      this.childCompanions = [];
    }
  }

  private syncAdultCompanions(): void {
    const count = Math.min(this.adults, this.MAX_COMPANIONS);
    if (this.adultCompanions.length < count) {
      while (this.adultCompanions.length < count) {
        this.adultCompanions.push({ name: '', relation: '', nationalId: '' });
      }
    } else {
      this.adultCompanions.length = count;
    }
  }

  private syncChildCompanions(): void {
    const count = Math.min(this.children, this.MAX_COMPANIONS);
    if (this.childCompanions.length < count) {
      while (this.childCompanions.length < count) {
        this.childCompanions.push({ name: '', dob: '', nationalId: '' });
      }
    } else {
      this.childCompanions.length = count;
    }
  }


  ngOnInit(): void {

  const tripId = this.route.snapshot.queryParamMap.get('tripId');

  if (!tripId) {
    alert('Trip ID is missing.');
    return;
  }

  this.loadTrip(Number(tripId));
}


private loadTrip(tripId: number): void {

  this.loadingTrip = true;
  this.loadError = false;

  this.http
    .get<TripDetails>(`/api/trips/${tripId}`)
    .subscribe({

      next: (trip) => {

        console.log('🔥 APPLICATION TRIP:', trip);

        this.trip = trip;

        this.loadingTrip = false;

        if (trip.batches && trip.batches.length === 1) {
          this.selectedBatchId = trip.batches[0].batchId;
        }
      },

      error: (error) => {

        console.error('🔥 APPLICATION TRIP ERROR:', error);

        this.loadingTrip = false;
        this.loadError = true;
      }

    });
}

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



  // ---- Submit (was async handleSubmit(e)) ----
  onSubmit(): void {

  if (!this.trip) {
    alert('Trip information is not loaded.');
    return;
  }

  if (!this.selectedBatchId) {
    alert('Please select a departure slot.');
    return;
  }

  const employeeId = 1015;

  const payload = {

   transportType: this.busSeat
  ? 'TRIP_BUS'
  : 'PRIVATE_CAR',

    pickupPoint: 'Cairo',

    roomsRequested: 1,

    totalPrice: this.total,

    participants: [

      ...this.adultCompanions.map(c => ({
        fullName: c.name,
        relationship: c.relation,
        dateOfBirth: null
      })),

      ...this.childCompanions.map(c => ({
        fullName: c.name,
        relationship: 'CHILD',
        dateOfBirth: c.dob
      }))

    ]

  };

  console.log('🔥 APPLICATION REQUEST:', {
    tripId: this.trip.tripId,
    batchId: this.selectedBatchId,
    employeeId,
    payload
  });

  this.submitting = true;

  this.http
    .post(
      `/api/applications?tripId=${this.trip.tripId}&batchId=${this.selectedBatchId}&employeeId=${employeeId}`,
      payload
    )
    .subscribe({

      next: (response) => {

        console.log('🔥 APPLICATION RESPONSE:', response);

        this.submitting = false;

        alert(
          'Application submitted successfully!\n' +
          'It has been sent to your manager for approval.'
        );

        this.router.navigate(['/my-requests']);
      },

      error: (error) => {

        console.error('🔥 APPLICATION ERROR:', error);

        this.submitting = false;

        const message =
          error?.error?.message ||
          'Unable to submit application.';

        alert(message);
      }

    });
   } 
}