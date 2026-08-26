import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Header } from '../../header/header';



interface TripBatch {
  batchId: number;
  startDate?: string;
  endDate?: string;
  numberOfRooms?: number;
  isActive?: boolean;
}


interface ActiveTrip {
  tripId: number;
  title: string;
  destination: string;
  registrationOpen: string;
  registrationClose: string;
  durationDays: number;
  statusName: string;
  batches?: TripBatch[];
}


interface SelectionApplicant {
  applicationId: number;
  employeeId?: number;
  employeeNumber?: string;
  employeeName: string;
  department?: string;
  role?: string;
  submissionTimestamp?: string;
}


interface SelectionRequestResponse {
  selectionRequestId: number;

  tripId: number;
  tripName: string;

  batchId: number;
  batchName?: string;

  method: 'RANDOM' | 'FIFO';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;

  rejectionReason?: string | null;

  requestedAt?: string;
  reviewedAt?: string | null;

  requestedById?: number;
  requestedByName?: string;

  reviewedById?: number | null;
  reviewedByName?: string | null;
}


type AllocationMethod =
  | 'RANDOM'
  | 'FIFO';


@Component({
  selector: 'app-selection',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Header
  ],

  templateUrl: './selection.html',
  styleUrl: './selection.css'
})
export class Selection implements OnInit {

  readonly apiUrl = 'http://localhost:8080/api';

  activeTrips: ActiveTrip[] = [];

  selectedTripId: number | null = null;

  selectedBatchId: number | null = null;

  applicants: SelectionApplicant[] = [];

  selectedMethod: AllocationMethod = 'RANDOM';

  latestRequest: SelectionRequestResponse | null = null;

  loadingTrips = false;
  loadingApplicants = false;
  loadingRequest = false;

  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  currentPage = 1;

  readonly pageSize = 5;

  private applicantsRequestId = 0;


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.loadActiveTrips();
  }


  // =========================================================
  // LOAD ACTIVE TRIPS
  // =========================================================

  loadActiveTrips(): void {

    this.loadingTrips = true;
    this.errorMessage = '';

    this.http
      .get<ActiveTrip[]>(`${this.apiUrl}/trips/active`)
      .subscribe({

        next: (trips) => {

          this.activeTrips = trips ?? [];
          this.loadingTrips = false;
          this.selectedTripId = null;
          this.selectedBatchId = null;
          this.latestRequest = null;

          this.loadApplicants();

          this.cdr.detectChanges();
        },

        error: (error) => {

          this.loadingTrips = false;
          this.activeTrips = [];

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to load active trips.'
          );

          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // TRIP CHANGED
  // =========================================================

  onTripChanged(): void {

    this.errorMessage = '';
    this.successMessage = '';
    this.selectedBatchId = null;
    this.latestRequest = null;
    this.currentPage = 1;

    this.loadApplicants();
  }


  // =========================================================
  // BATCH CHANGED
  // =========================================================

  onBatchChanged(): void {

    this.errorMessage = '';
    this.successMessage = '';
    this.latestRequest = null;
    this.currentPage = 1;

    this.loadApplicants();

    if (this.isSpecificBatchSelected) {
      this.loadLatestRequest();
    }
  }


  // =========================================================
  // LOAD APPLICANTS
  // =========================================================

  loadApplicants(): void {

    const requestId = ++this.applicantsRequestId;

    this.loadingApplicants = true;

    let url = '';

    if (this.selectedTripId === null) {

      url = `${this.apiUrl}/selections/applicants`;

    } else if (this.selectedBatchId === null) {

      url = `${this.apiUrl}/selections/trip/${this.selectedTripId}/applicants`;

    } else {

      url = `${this.apiUrl}/selections/trip/${this.selectedTripId}/batch/${this.selectedBatchId}/applicants`;
    }

    this.http
      .get<SelectionApplicant[]>(url)
      .subscribe({

        next: (applicants) => {

          if (requestId !== this.applicantsRequestId) {
            return;
          }

          this.applicants = applicants ?? [];
          this.currentPage = 1;
          this.loadingApplicants = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          if (requestId !== this.applicantsRequestId) {
            return;
          }

          this.applicants = [];
          this.loadingApplicants = false;

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to load applicants.'
          );

          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // LOAD REQUEST STATUS FOR CURRENT BATCH
  // =========================================================

  loadLatestRequest(): void {

    if (this.selectedTripId === null || this.selectedBatchId === null) {
      this.latestRequest = null;
      return;
    }

    this.loadingRequest = true;

    this.http
      .get<SelectionRequestResponse>(
        `${this.apiUrl}/selections/trip/${this.selectedTripId}/batch/${this.selectedBatchId}/latest`
      )
      .subscribe({

        next: (request) => {

          this.latestRequest = request ?? null;

          if (request?.method) {
            this.selectedMethod = request.method;
          }

          this.loadingRequest = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          if (error?.status === 204) {
            this.latestRequest = null;
          } else {
            console.error('Failed to load batch selection request:', error);
            this.latestRequest = null;
          }

          this.loadingRequest = false;

          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // SELECTED TRIP
  // =========================================================

  get selectedTrip(): ActiveTrip | null {

    if (this.selectedTripId === null) {
      return null;
    }

    return this.activeTrips.find(
      trip => trip.tripId === this.selectedTripId
    ) ?? null;
  }


  get selectedTripBatches(): TripBatch[] {

    if (!this.selectedTrip?.batches) {
      return [];
    }

    return this.selectedTrip.batches
      .filter(batch => batch.isActive !== false)
      .sort((a, b) => a.batchId - b.batchId);
  }


  get selectedBatch(): TripBatch | null {

    if (this.selectedBatchId === null) {
      return null;
    }

    return this.selectedTripBatches.find(
      batch => batch.batchId === this.selectedBatchId
    ) ?? null;
  }


  // =========================================================
  // SELECTION SCOPE
  // =========================================================

  get isAllTripsSelected(): boolean {
    return this.selectedTripId === null;
  }


  get isAllBatchesSelected(): boolean {
    return this.selectedTripId !== null && this.selectedBatchId === null;
  }


  get isSpecificBatchSelected(): boolean {
    return this.selectedTripId !== null && this.selectedBatchId !== null;
  }


  // =========================================================
  // REQUEST STATE
  // =========================================================

  get isRequestLocked(): boolean {
    return (
      this.latestRequest?.status === 'PENDING' ||
      this.latestRequest?.status === 'APPROVED'
    );
  }


  get canChangeMethod(): boolean {
    return (
      this.isSpecificBatchSelected &&
      !this.loadingRequest &&
      !this.isSubmitting &&
      !this.isRequestLocked
    );
  }


  get canSubmit(): boolean {
    return (
      this.isSpecificBatchSelected &&
      this.applicants.length > 0 &&
      !this.loadingRequest &&
      !this.isSubmitting &&
      !this.isRequestLocked
    );
  }


  // =========================================================
  // SELECT METHOD
  // =========================================================

  selectMethod(method: AllocationMethod): void {

    if (!this.canChangeMethod) {
      return;
    }

    this.selectedMethod = method;
    this.errorMessage = '';
  }


  // =========================================================
  // SEND TO MANAGER
  // =========================================================

  sendToManager(): void {

    if (!this.isSpecificBatchSelected) {
      this.errorMessage = 'Please select one specific batch before sending the selection method to the manager.';
      return;
    }

    if (this.selectedTripId === null || this.selectedBatchId === null) {
      this.errorMessage = 'Please select both a trip and a batch first.';
      return;
    }

    if (this.applicants.length === 0) {
      this.errorMessage = 'There are no applicants for the selected batch.';
      return;
    }

    if (this.isRequestLocked) {
      this.errorMessage = this.latestRequest?.status === 'PENDING'
        ? 'This batch already has a selection request waiting for HR Manager approval.'
        : 'This batch has already been approved for selection.';
      return;
    }

    const hrUserId = this.getCurrentUserId();

    if (!hrUserId) {
      this.errorMessage = 'No logged-in HR Admin was found. Please log in again.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post<SelectionRequestResponse>(
        `${this.apiUrl}/selections/trip/${this.selectedTripId}/batch/${this.selectedBatchId}/requests?hrUserId=${hrUserId}`,
        { method: this.selectedMethod }
      )
      .subscribe({

        next: (response) => {

          this.latestRequest = response;
          this.isSubmitting = false;
          this.successMessage = 'Selection method was sent successfully to the HR Manager and is waiting for approval.';

          this.cdr.detectChanges();

          this.router.navigate(['/admin/trips/approvals']);
        },

        error: (error) => {

          console.error('Failed to submit selection request:', error);

          this.isSubmitting = false;

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to send the selection request.'
          );

          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // PAGINATION
  // =========================================================

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.applicants.length / this.pageSize));
  }


  get pagedApplicants(): SelectionApplicant[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.applicants.slice(start, start + this.pageSize);
  }


  get firstDisplayedApplicant(): number {
    if (this.applicants.length === 0) {
      return 0;
    }
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }


  get lastDisplayedApplicant(): number {
    return Math.min(this.currentPage * this.pageSize, this.applicants.length);
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }


  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }


  // =========================================================
  // BATCH LABEL
  // =========================================================

  batchLabel(batch: TripBatch, index: number): string {

    const parts = [`Batch ${index + 1}`];

    if (batch.startDate) {
      parts.push(new Date(batch.startDate).toLocaleDateString());
    }

    if (batch.endDate) {
      parts.push(new Date(batch.endDate).toLocaleDateString());
    }

    return parts.join(' — ');
  }


  // =========================================================
  // CURRENT USER
  // =========================================================

  private getCurrentUserId(): number | null {

    try {

      const raw = sessionStorage.getItem('currentUser')

      if (!raw) {
        return null;
      }

      const user = JSON.parse(raw);
      const id = Number(user?.employeeId);

      return Number.isFinite(id) && id > 0 ? id : null;

    } catch {
      return null;
    }
  }


  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: any, fallback: string): string {

    const message =
      error?.error?.message ||
      error?.error?.error ||
      error?.error ||
      error?.message;

    return typeof message === 'string' && message.trim()
      ? message
      : fallback;
  }
}