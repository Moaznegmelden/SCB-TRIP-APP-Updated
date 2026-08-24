import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Header } from '../../header/header';

type HistoryStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

interface HistoryRequest {
  applicationId: number;
  requestId: string;
  empName: string;
  empId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  submissionDate: string;
  status: HistoryStatus;
  destination: string;
  companions: number;
  totalPrice: number;
}

interface ApplicationApi {
  applicationId?: number;
  batchId?: number;

  destination?: string;

  employeeId?: number;
  employeeName?: string;
  employeeNumber?: string;

  participants?: unknown[];

  pickupPoint?: string;
  roomsRequested?: number;

  selectedAt?: string | null;
  selectionMethod?: string | null;

  statusName?: string;

  totalPrice?: number;
  transportType?: string;

  tripId?: number;
  tripTitle?: string;
}

@Component({
  selector: 'app-app-approval',
  standalone: true,
  imports: [CommonModule,Header],
  templateUrl: './app-approval.html',
  styleUrl: './app-approval.css',
})
export class AppApproval implements OnInit {

  managerId: number | null = null;

  statPendingAction = 0;

  requests: HistoryRequest[] = [];

  loading = true;

  loadError = false;


  constructor(
    private http: HttpClient
  ) {}


  ngOnInit(): void {

    console.log('🔥 APP APPROVAL PAGE LOADED');

    const currentUserJson =
      localStorage.getItem('currentUser');

    console.log(
      '🔥 CURRENT USER FROM LOCAL STORAGE:',
      currentUserJson
    );

    if (!currentUserJson) {

      console.error(
        '🔥 NO CURRENT USER FOUND'
      );

      this.loading = false;
      this.loadError = true;

      return;
    }

    try {

      const currentUser =
        JSON.parse(currentUserJson);

      console.log(
        '🔥 PARSED CURRENT USER:',
        currentUser
      );

      /*
       * Try to get the manager employee ID
       * from the login response.
       */
      this.managerId =
        currentUser.employeeId ??
        currentUser.id ??
        currentUser.employee_id ??
        null;

      console.log(
        '🔥 MANAGER ID:',
        this.managerId
      );

      if (!this.managerId) {

        console.error(
          '🔥 MANAGER ID NOT FOUND IN LOGIN RESPONSE'
        );

        this.loading = false;
        this.loadError = true;

        return;
      }

      this.loadRequests();

    } catch (error) {

      console.error(
        '🔥 ERROR READING CURRENT USER:',
        error
      );

      this.loading = false;
      this.loadError = true;

    }

  }


  get filteredRequests(): HistoryRequest[] {

    return this.requests.filter(
      request => request.status === 'pending'
    );

  }


  statusLabel(
    status: HistoryStatus
  ): string {

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );

  }


  private updateStatistics(): void {

    this.statPendingAction =
      this.requests.filter(
        request => request.status === 'pending'
      ).length;

  }


  loadRequests(): void {

    if (!this.managerId) {

      console.error(
        '🔥 MANAGER ID IS MISSING'
      );

      this.loading = false;
      this.loadError = true;

      return;
    }

    this.loading = true;
    this.loadError = false;

    const apiUrl =
      `/api/applications/manager/pending`;

    console.log(
      '🔥 MANAGER APPROVAL API:',
      apiUrl
    );

    this.http
      .get<ApplicationApi[]>(apiUrl)
      .pipe(
        finalize(() => {

          this.loading = false;

        })
      )
      .subscribe({

        next: (applications) => {

          console.log(
            '🔥 APPLICATIONS RECEIVED:',
            applications
          );

          this.requests =
            applications.map(app =>
              this.mapApplication(app)
            );

          this.updateStatistics();

          console.log(
            '🔥 FINAL REQUESTS:',
            this.requests
          );

        },

        error: (error) => {

          console.error(
            '🔥 MANAGER APPLICATIONS ERROR:',
            error
          );

          this.requests = [];
          this.loadError = true;

        }

      });

  }


  private mapApplication(
    app: ApplicationApi
  ): HistoryRequest {

    return {

      applicationId:
        app.applicationId ?? 0,

      requestId:
        `REQ-${app.applicationId ?? 0}`,

      empName:
        app.employeeName ??
        'Unknown Employee',

      empId:
        app.employeeNumber ??
        'N/A',

      tripName:
        app.tripTitle ??
        'Trip',

      startDate:
        'N/A',

      endDate:
        'N/A',

      submissionDate:
        'N/A',

      status:
        this.mapStatus(
          app.statusName
        ),

      destination:
        app.destination ??
        'N/A',

      companions:
        app.participants?.length ??
        0,

      totalPrice:
        app.totalPrice ??
        0

    };

  }


  private mapStatus(
    statusName?: string
  ): HistoryStatus {

    const status =
      (statusName ?? '')
        .toUpperCase();

    if (
      status === 'PENDING_MANAGER' ||
      status.includes('PENDING')
    ) {

      return 'pending';

    }

    if (
      status.includes('APPROV')
    ) {

      return 'approved';

    }

    if (
      status.includes('REJECT')
    ) {

      return 'rejected';

    }

    if (
      status.includes('EXPIRED')
    ) {

      return 'expired';

    }

    return 'pending';

  }


  actionRow(
    req: HistoryRequest,
    newStatus: 'approved' | 'rejected'
  ): void {

    if (!this.managerId) {

      alert(
        'Manager information is missing.'
      );

      return;

    }

    const action =
      newStatus === 'approved'
        ? 'Approve'
        : 'Reject';

    if (
      !confirm(
        `${action} this request?`
      )
    ) {

      return;

    }

    const endpoint =
      newStatus === 'approved'
        ? 'approve'
        : 'reject';

    const url =
      `/api/applications/` +
      `${req.applicationId}/` +
      `${endpoint}` +
      `?managerId=${this.managerId}`;

    console.log(
      '🔥 MANAGER DECISION API:',
      url
    );

    this.http
      .post<ApplicationApi>(
        url,
        {}
      )
      .subscribe({

        next: (response) => {

          console.log(
            '🔥 MANAGER DECISION RESPONSE:',
            response
          );

          req.status =
            newStatus;

          this.updateStatistics();

          alert(
            `Request ${req.requestId} ${newStatus}.`
          );

          this.loadRequests();

        },

        error: (error) => {

          console.error(
            '🔥 MANAGER DECISION ERROR:',
            error
          );

          alert(
            `Unable to ${newStatus} this request.`
          );

        }

      });

  }

}