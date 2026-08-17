import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor() { }

  getPendingTrips(): Observable<Trip[]> {

    return of([]);

  }

}