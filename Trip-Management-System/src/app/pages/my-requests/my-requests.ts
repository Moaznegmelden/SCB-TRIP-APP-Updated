import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../header/header';
import {
  StatusService,
  StatusApi
} from '../../services/status.service';

type RequestStatus = 'pending' | 'approved' | 'rejected' | string;

type TabFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected';

interface ApplicationApi {
  applicationId: number;
  tripTitle?: string;
  destination?: string;
  batchId?: string;
  statusName?: string;
  participants?: unknown[];
}

interface RequestRow {
  applicationId: number;
  tripTitle: string;
  destination: string;
  departure: string;
  appliedOn: string;
  companions: number;
  status: RequestStatus;
  statusDisplay: string;
}

@Component({
  selector: 'app-myreq',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    Header
  ],

  templateUrl: './my-requests.html'
})
export class MyRequests implements OnInit {

  // =========================================================
  // API
  // =========================================================

  private readonly API_URL = 'http://localhost:8081/api/applications/my';


  // =========================================================
  // STATUSES FROM DATABASE
  // =========================================================

  statuses: StatusApi[] = [];


  // =========================================================
  // STATISTICS
  // =========================================================

  statPending = 0;
  statApproved = 0;
  statRejected = 0;
  statTotal = 0;


  // =========================================================
  // TABS
  // =========================================================

  activeTab: TabFilter = 'all';


  // =========================================================
  // REQUESTS
  // =========================================================

  requests: RequestRow[] = [];

  loadError = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private statusService: StatusService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.loadStatuses();

    this.loadRequests();
  }


  // =========================================================
  // LOAD STATUSES FROM DATABASE
  // =========================================================

  loadStatuses(): void {

    this.statusService
      .getStatuses()
      .subscribe({

        next: (statuses) => {

          console.log(
            '🔥 MY REQUESTS - STATUSES FROM DATABASE:',
            statuses
          );

          this.statuses = statuses;
        },

        error: (error) => {

          console.error(
            '🔥 MY REQUESTS - STATUS API ERROR:',
            error
          );

        }

      });
  }


  // =========================================================
  // LOAD CURRENT USER REQUESTS
  // =========================================================

  loadRequests(): void {

    this.loadError = false;
    this.requests = [];

    this.http
      .get<ApplicationApi[]>(this.API_URL)
      .subscribe({

        next: (applications) => {

          console.log(
            '🔥 MY REQUESTS API:',
            applications
          );


          this.requests =
            applications.map(app =>
              this.mapApplication(app)
            );


          console.log(
            '🔥 MY REQUESTS MAPPED:',
            this.requests
          );


          // ===================================================
          // STATISTICS
          // ===================================================

          this.statTotal =
            this.requests.length;

          this.statPending =
            this.requests.filter(
              r => r.status === 'pending'
            ).length;

          this.statApproved =
            this.requests.filter(
              r => r.status === 'approved'
            ).length;

          this.statRejected =
            this.requests.filter(
              r => r.status === 'rejected'
            ).length;


          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            '🔥 MY REQUESTS ERROR:',
            error
          );

          this.loadError = true;

          this.requests = [];

          this.statTotal = 0;
          this.statPending = 0;
          this.statApproved = 0;
          this.statRejected = 0;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // MAP APPLICATION
  // =========================================================

  private mapApplication(
    app: ApplicationApi
  ): RequestRow {

    const statusInfo =
      this.resolveStatus(app.statusName);


    return {

      applicationId:
        app.applicationId,

      tripTitle:
        app.tripTitle || 'Trip',

      destination:
        app.destination || 'N/A',

      departure:
        String(app.batchId ?? 'N/A'),

      appliedOn:
        new Date()
          .toLocaleDateString('en-GB'),

      companions:
        app.participants?.length ?? 0,

      status:
        statusInfo.status,

      statusDisplay:
        statusInfo.display

    };
  }


  // =========================================================
  // RESOLVE STATUS
  //
  // Status names are loaded from the DATABASE.
  // We don't create separate APIs for Pending / Approved /
  // Rejected.
  // =========================================================

  private resolveStatus(
    statusName?: string
  ): {
    status: RequestStatus;
    display: string;
  } {

    const rawStatus =
      (statusName ?? '')
        .trim()
        .toUpperCase();


    // -------------------------------------------------------
    // Find the actual status returned by the DATABASE
    // -------------------------------------------------------

    const dbStatus =
      this.statuses.find(
        s =>
          s.statusName
            ?.trim()
            .toUpperCase() === rawStatus
      );


    const actualStatusName =
      dbStatus?.statusName
        ?.trim()
        .toUpperCase() || rawStatus;


    // -------------------------------------------------------
    // REJECTED
    // -------------------------------------------------------

    if (
      actualStatusName.includes('REJECT')
    ) {

      return {
        status: 'rejected',
        display: dbStatus?.statusName || 'Rejected'
      };
    }


    // -------------------------------------------------------
    // APPROVED
    // -------------------------------------------------------

    if (
      actualStatusName.includes('APPROV')
    ) {

      return {
        status: 'approved',
        display: dbStatus?.statusName || 'Approved'
      };
    }


    // -------------------------------------------------------
    // PENDING
    // -------------------------------------------------------

    if (
      actualStatusName.includes('PENDING')
    ) {

      return {
        status: 'pending',
        display: dbStatus?.statusName || 'Pending'
      };
    }


    // -------------------------------------------------------
    // FALLBACK
    // -------------------------------------------------------

    return {

      status: actualStatusName
        ? actualStatusName.toLowerCase()
        : 'pending',

      display:
        dbStatus?.statusName ||
        statusName ||
        'Pending'
    };
  }


  // =========================================================
  // TAB SWITCH
  // =========================================================

  switchTab(
    tab: TabFilter
  ): void {

    this.activeTab = tab;
  }


  // =========================================================
  // FILTER
  // =========================================================

  get filteredRequests(): RequestRow[] {

    if (!this.requests) {
      return [];
    }


    if (this.activeTab === 'all') {
      return this.requests;
    }


    return this.requests.filter(
      r => r.status === this.activeTab
    );
  }

}