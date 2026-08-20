import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type HistoryStatus =
  'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

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

@Component({
  selector: 'app-manager-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './manager-history.html'
})
export class ManagerHistory implements OnInit {

  // =========================================================
  // CURRENT USER
  // =========================================================

  currentUser: any = null;

  managerId: number | null = null;

  // =========================================================
  // PAGE STATE
  // =========================================================

  requests: HistoryRequest[] = [];

  loading = true;

  loadError = false;

  // =========================================================
  // STATISTICS
  // =========================================================

  statPendingAction = 0;

  statApprovedThisMonth = 0;

  statRejected = 0;

  statExpired = 0;

  // =========================================================
  // TABS
  // =========================================================

  activeTab: HistoryStatus = 'pending';


  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCurrentUser();

  }


  // =========================================================
  // LOAD CURRENT USER
  // =========================================================

  private loadCurrentUser(): void {

    const currentUserJson =
      localStorage.getItem('currentUser');

    if (!currentUserJson) {

      console.error(
        '🔥 MANAGER HISTORY: currentUser not found'
      );

      this.loadError = true;
      this.loading = false;

      return;
    }

    try {

      this.currentUser =
        JSON.parse(currentUserJson);

      console.log(
        '🔥 MANAGER HISTORY USER:',
        this.currentUser
      );

      const employeeNumber =
        this.currentUser?.employeeNumber;

      /*
       * IMPORTANT:
       *
       * Your backend employeeId is numeric.
       *
       * If currentUser contains employeeId,
       * use it directly.
       */

      if (this.currentUser?.employeeId) {

        this.managerId =
          Number(this.currentUser.employeeId);

      }

      /*
       * If employeeId is not available,
       * we cannot safely guess it.
       */

      if (!this.managerId) {

        console.error(
          '🔥 MANAGER HISTORY: employeeId not found in currentUser'
        );

        this.loadError = true;
        this.loading = false;

        return;
      }

      /*
       * Check role before calling manager API.
       */

      const role =
        String(this.currentUser?.role || '')
          .toUpperCase();

      console.log(
        '🔥 MANAGER HISTORY ROLE:',
        role
      );

      if (
        role !== 'MANAGER' &&
        role !== 'LINE_MANAGER'
      ) {

        console.error(
          '🔥 USER IS NOT A MANAGER:',
          role
        );

        this.loadError = true;
        this.loading = false;

        return;
      }

      this.loadRequests();

    } catch (error) {

      console.error(
        '🔥 MANAGER HISTORY USER ERROR:',
        error
      );

      this.loadError = true;
      this.loading = false;

    }
  }


  // =========================================================
  // LOAD APPROVAL HISTORY
  // =========================================================

  loadRequests(): void {

    if (!this.managerId) {

      console.error(
        '🔥 MANAGER ID IS MISSING'
      );

      return;
    }

    this.loading = true;

    this.loadError = false;

    const apiUrl =
      `/api/applications/manager/${this.managerId}`;

    console.log(
      '🔥 MANAGER APPROVAL HISTORY API:',
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
            '🔥 MANAGER APPLICATIONS:',
            applications
          );

          this.requests =
            applications.map(app =>
              this.mapApplication(app)
            );

          this.updateStatistics();

          console.log(
            '🔥 MANAGER APPROVAL HISTORY:',
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


  // =========================================================
  // MAP API RESPONSE
  // =========================================================

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
        this.mapStatus(app.statusName),

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


  // =========================================================
  // MAP STATUS
  // =========================================================

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


  // =========================================================
  // STATISTICS
  // =========================================================

  private updateStatistics(): void {

    this.statPendingAction =
      this.requests.filter(
        r => r.status === 'pending'
      ).length;

    this.statApprovedThisMonth =
      this.requests.filter(
        r => r.status === 'approved'
      ).length;

    this.statRejected =
      this.requests.filter(
        r => r.status === 'rejected'
      ).length;

    this.statExpired =
      this.requests.filter(
        r => r.status === 'expired'
      ).length;
  }


  // =========================================================
  // TABS
  // =========================================================

  switchTab(
    tab: HistoryStatus
  ): void {

    this.activeTab = tab;
  }


  get filteredRequests(): HistoryRequest[] {

    return this.requests.filter(
      r =>
        r.status === this.activeTab
    );
  }


  get pendingCount(): number {

    return this.requests.filter(
      r =>
        r.status === 'pending'
    ).length;
  }


  // =========================================================
  // STATUS LABEL
  // =========================================================

  statusLabel(
    status: HistoryStatus
  ): string {

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }


  // =========================================================
  // APPROVE / REJECT
  // =========================================================

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

          /*
           * Reload from backend.
           * This keeps the UI synchronized
           * with the database.
           */

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