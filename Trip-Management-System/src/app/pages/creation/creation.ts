import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Departure {
  startDate: string;
  endDate: string;
  numberOfRooms: number;
}

@Component({
  selector: 'app-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creation.html'
})
export class Creation {

  title = '';
  destination = '';
  duration = '';
  registrationOpens = '';
  registrationCloses = '';

  departures: Departure[] = [
    { startDate: '', endDate: '', numberOfRooms: 0 }
  ];

  submitting = false;

  constructor(private http: HttpClient, private router: Router) {}

  addDeparture(): void {
    this.departures.push({ startDate: '', endDate: '', numberOfRooms: 0 });
  }

  removeDeparture(index: number): void {
    this.departures.splice(index, 1);
  }

  onSubmit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const createdById = currentUser.employeeId;

    const tripPayload = {
      title: this.title,
      destination: this.destination,
      durationDays: Number(this.duration),
      registrationOpen: this.registrationOpens,
      registrationClose: this.registrationCloses
    };

    console.log('PAYLOAD:', tripPayload);

    this.submitting = true;

    this.http.post<any>(
      `http://localhost:8080/api/trips?createdById=${createdById}`,
      tripPayload
    ).subscribe({
      next: (trip) => {
        const tripId = trip.tripId;

        const batchRequests = this.departures.map(dep =>
          this.http.post(
            `http://localhost:8080/api/trips/${tripId}/batches?createdById=${createdById}`,
            {
              startDate: dep.startDate,
              endDate: dep.endDate,
              numberOfRooms: dep.numberOfRooms
            }
          ).toPromise()
        );

        Promise.all(batchRequests)
          .then(() => this.http.post(`http://localhost:8080/api/trips/${tripId}/submit`, {}).toPromise())
          .then(() => {
            this.submitting = false;
            alert('Trip created and submitted for approval!');
            this.title = '';
            this.destination = '';
            this.duration = '';
            this.registrationOpens = '';
            this.registrationCloses = '';
            this.departures = [{ startDate: '', endDate: '', numberOfRooms: 0 }];
          })
          .catch(() => {
            this.submitting = false;
            alert('Trip created, but saving batches or submitting failed.');
          });
      },
      error: () => {
        this.submitting = false;
        alert('Unable to save the trip. Please try again.');
      }
    });
  }
}