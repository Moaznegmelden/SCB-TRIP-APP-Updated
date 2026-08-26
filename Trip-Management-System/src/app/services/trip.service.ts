import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private readonly apiUrl = '/api';

  constructor(
    private http: HttpClient
  ) {}

  // =========================
  // PENDING TRIPS
  // =========================

  getPendingTrips(): Observable<Trip[]> {

    return of([]);

  }

  // =========================
  // ACTIVE TRIPS
  // =========================

  getActiveTrips(): Observable<Trip[]> {

    console.log(
      '🔥 TRIP SERVICE - GET ACTIVE TRIPS'
    );

    return this.http.get<Trip[]>(
      `${this.apiUrl}/trips/active`
    );

  }

}