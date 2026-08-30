import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface StatusApi {
  statusId: number;
  statusName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private readonly API_URL = 'http://localhost:8081/api/statuses';

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<StatusApi[]> {
    return this.http
      .get<StatusApi[]>(this.API_URL)
      .pipe(
        shareReplay(1)
      );
  }
}