import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SelectedApplicant {
  employeeId: string;
  employeeName: string;
  department: string;
  submissionTimestamp: string;
  status: string;
}

export interface AllocationResult {
  tripName: string;
  method: string;
  confirmedQuota: number;
  waitlistQuota: number;
  selectedApplicants: SelectedApplicant[];
}

@Injectable({
  providedIn: 'root'
})
export class HrTripService {

  private baseUrl = 'http://localhost:8081/api/hr/trips';

  constructor(
    private http: HttpClient
  ) {}

  getAllocationResult(
    tripId: number
  ): Observable<AllocationResult> {

    return this.http.get<AllocationResult>(
      `${this.baseUrl}/${tripId}/allocation/result`
    );
  }
}