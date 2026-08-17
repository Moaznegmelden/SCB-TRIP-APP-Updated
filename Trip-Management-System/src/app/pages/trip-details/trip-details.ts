import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

interface TripBatch {
  startDate?: string;
  endDate?: string;
}

interface Trip {
  tripId: number | string;
  title: string;
  destination: string;
  durationDays?: number;
  registrationOpen?: string;
  registrationClose?: string;
  statusName?: string;
  createdByName?: string;
  batches?: TripBatch[];
}

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-details.html'
})
export class TripDetails implements OnInit {

  private readonly apiBase = 'http://localhost:8080/api';

  tripName = 'Loading...';
  tripLocationDuration = '';

  infoDestination = '-';
  infoDuration = '-';
  infoRegOpen = '-';
  infoRegClose = '-';

  description = '-';

  departures: TripBatch[] = [];

  priceEmployee = '-';
  priceCompanion = '-';
  priceChild = '-';
  priceBus = '-';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.loadTrip();
  }

  private loadTrip(): void {

    const tripId = this.route.snapshot.queryParamMap.get('id');

    if (!tripId) {
      this.tripName = 'Trip not selected';
      return;
    }

    this.http
      .get<Trip>(`${this.apiBase}/trips/${tripId}`, {
        headers: { Accept: 'application/json' }
      })
      .subscribe({

        next: (trip) => {

          this.titleService.setTitle(`Trip Details – ${trip.title}`);

          this.tripName = trip.title;

          this.tripLocationDuration =
            `${trip.destination} · ${trip.durationDays || 'N/A'} days`;

          this.infoDestination =
            trip.destination;

          this.infoDuration =
            `${trip.durationDays || 'N/A'} days`;

          this.infoRegOpen =
            trip.registrationOpen || 'N/A';

          this.infoRegClose =
            trip.registrationClose || 'N/A';

          this.description =
            `Status: ${trip.statusName || 'Unknown'} · Created by ${trip.createdByName || 'N/A'}`;

          this.priceEmployee = 'Loading…';
          this.priceCompanion = 'Loading…';
          this.priceChild = 'Loading…';
          this.priceBus = 'Loading…';

          this.departures =
            trip.batches || [];
        },

        error: () => {

          this.tripName = 'Unable to load trip';

          this.description =
            'Start the backend server and ensure the selected trip ID exists.';
        }
      });
  }

  goToApplication(): void {

    const tripId =
      this.route.snapshot.queryParamMap.get('id');

    if (!tripId) {
      return;
    }

    this.router.navigate(
      ['/application'],
      {
        queryParams: {
          tripId: tripId,
          batchId: 1
        }
      }
    );
  }
}