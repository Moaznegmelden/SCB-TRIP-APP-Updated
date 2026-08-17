import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Departure {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creation.html'
})
export class Creation {

  // ---- Trip fields (was th:field="*{title}" etc.) ----
  title = '';
  destination = '';
  duration = '';
  registrationOpens = '';
  registrationCloses = '';

  // ---- Departures / batches (was th:each="dep, iterStat : *{departures}") ----
  // Starts with one empty row, mirroring a fresh Thymeleaf-backed form.
  departures: Departure[] = [
    { startDate: '', endDate: '' }
  ];

  submitting = false;

  constructor(private http: HttpClient, private router: Router) {}

  // ---- Was the "addDeparture" named submit button (server round-trip) ----
  addDeparture(): void {
    this.departures.push({ startDate: '', endDate: '' });
  }

  // ---- Was the "removeDeparture" named submit button (server round-trip) ----
  removeDeparture(index: number): void {
    this.departures.splice(index, 1);
  }

  // ---- Was th:action="@{/admin/trips/save}" th:object="${trip}" method="post" ----
  onSubmit(): void {
    const payload = {
      title: this.title,
      destination: this.destination,
      duration: this.duration,
      registrationOpens: this.registrationOpens,
      registrationCloses: this.registrationCloses,
      departures: this.departures
    };

    this.submitting = true;

    this.http.post('/admin/trips/save', payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/trips']);
      },
      error: () => {
        this.submitting = false;
        alert('Unable to save the trip. Please try again.');
      }
    });
  }
}