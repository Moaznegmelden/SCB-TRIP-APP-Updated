import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef,Component,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, retry } from 'rxjs';
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


interface CurrentUser {

  employeeId?: number;

  employeeNumber?: string;

  fullName?: string;

  email?: string;

  role?: string;

  roleName?: string;

  role_name?: string;

  id?: number;

  token?: string;
}


@Component({

  selector: 'app-app-approval',

  standalone: true,

  imports: [
    CommonModule,
    Header
  ],

  templateUrl: './app-approval.html',

  styleUrl: './app-approval.css'

})
export class AppApproval implements OnInit {


  // =========================================================
  // CURRENT USER
  // =========================================================

  currentUser: CurrentUser | null = null;

  managerId: number | null = null;


  // =========================================================
  // DATA
  // =========================================================

  requests: HistoryRequest[] = [];


  // =========================================================
  // UI STATE
  // =========================================================

  loading = true;

  loadError = false;

  statPendingAction = 0;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log(
      '🔥 APP APPROVAL PAGE LOADED'
    );


    /*
     * IMPORTANT:
     * User is stored per browser TAB using
     * sessionStorage.
     *
     * Do NOT use localStorage here.
     */

    const currentUserJson =
      sessionStorage.getItem('currentUser');


    console.log(
      '🔥 CURRENT USER FROM SESSION STORAGE:',
      currentUserJson
    );


    // ---------------------------------------------------------
    // USER NOT FOUND
    // ---------------------------------------------------------

    if (!currentUserJson) {

      console.error(
        '🔥 NO CURRENT USER FOUND IN SESSION STORAGE'
      );

      this.loading = false;

      this.loadError = true;

      return;
    }


    // ---------------------------------------------------------
    // READ USER
    // ---------------------------------------------------------

    try {

      this.currentUser =
        JSON.parse(currentUserJson);


      console.log(
        '🔥 PARSED CURRENT USER:',
        this.currentUser
      );


      // -------------------------------------------------------
      // ROLE
      // -------------------------------------------------------

      const role =
        (
          this.currentUser?.roleName ??
          this.currentUser?.role ??
          this.currentUser?.role_name ??
          ''
        )
          .toString()
          .toUpperCase()
          .trim();


      console.log(
        '🔥 CURRENT ROLE:',
        role
      );


      /*
       * This page is ONLY for LINE MANAGERS.
       *
       * The guard already protects the route,
       * but we keep this check here as an extra safety layer.
       */

      if (role !== 'LINE_MANAGER') {

        console.error(
          '🔥 USER IS NOT A LINE MANAGER'
        );

        this.loading = false;

        this.loadError = true;

        return;
      }


      // -------------------------------------------------------
      // MANAGER EMPLOYEE ID
      // -------------------------------------------------------

      this.managerId =
        this.currentUser?.employeeId ??
        this.currentUser?.id ??
        null;


      console.log(
        '🔥 LINE MANAGER ID:',
        this.managerId
      );


      // -------------------------------------------------------
      // ID NOT FOUND
      // -------------------------------------------------------

      if (!this.managerId) {

        console.error(
          '🔥 MANAGER EMPLOYEE ID NOT FOUND'
        );

        this.loading = false;

        this.loadError = true;

        return;
      }


      // -------------------------------------------------------
      // LOAD REQUESTS
      // -------------------------------------------------------

      this.loadRequests();


    } catch (error) {

      console.error(
        '🔥 ERROR READING CURRENT USER:',
        error
      );

      this.currentUser = null;

      this.managerId = null;

      this.loading = false;

      this.loadError = true;
    }

  }


  // =========================================================
  // FILTERED REQUESTS
  // =========================================================

  get filteredRequests(): HistoryRequest[] {

    return this.requests.filter(
      request =>
        request.status === 'pending'
    );

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
  // STATISTICS
  // =========================================================

  private updateStatistics(): void {

    this.statPendingAction =
      this.requests.filter(
        request =>
          request.status === 'pending'
      ).length;


    console.log(
      '🔥 PENDING ACTION COUNT:',
      this.statPendingAction
    );

  }


  // =========================================================
  // LOAD MANAGER REQUESTS
  // =========================================================

  loadRequests(): void {

    // ---------------------------------------------------------
    // CHECK MANAGER ID
    // ---------------------------------------------------------

    if (!this.managerId) {

      console.error(
        '🔥 MANAGER ID IS MISSING'
      );

      this.loading = false;

      this.loadError = true;

      return;
    }


    // ---------------------------------------------------------
    // RESET UI STATE
    // ---------------------------------------------------------

    this.loading = true;

    this.loadError = false;


    const apiUrl =
      'http://localhost:8081/api/applications/manager/pending';


    console.log(
      '🔥 LOADING MANAGER APPLICATIONS:',
      apiUrl
    );


    console.log(
      '🔥 MANAGER ID:',
      this.managerId
    );


    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT send managerId
     * to the GET endpoint.
     *
     * The backend identifies the logged-in manager
     * from the authenticated JWT and returns only
     * applications belonging to employees under
     * that manager.
     *
     * This prevents one manager from requesting
     * another manager's applications.
     */

    this.http
      .get<ApplicationApi[]>(
        apiUrl
      )
      .pipe(

        /*
         * If the first request has a temporary
         * connection/startup problem, retry once.
         *
         * This helps with the "first click loads,
         * second click works" behavior without
         * making the user click twice.
         */

        retry({
          count: 1,
          delay: 500
        }),

       finalize(() => {

  this.loading = false;

  console.log(
    '🔥 MANAGER REQUEST LOADING FINISHED'
  );

  this.cdr.detectChanges();

})

      )
      .subscribe({

        // =====================================================
        // SUCCESS
        // =====================================================

        next: (applications) => {

          console.log(
            '🔥 APPLICATIONS RECEIVED:',
            applications
          );


          /*
           * Always normalize the response.
           */

          const safeApplications =
            Array.isArray(applications)
              ? applications
              : [];


          this.requests =
            safeApplications.map(
              app =>
                this.mapApplication(app)
            );


          this.updateStatistics();


          this.loadError = false;


          console.log(
            '🔥 FINAL MANAGER REQUESTS:',
            this.requests
          );


          console.log(
            '🔥 FINAL PENDING COUNT:',
            this.statPendingAction
          );

          this.cdr.detectChanges();

        },


        // =====================================================
        // ERROR
        // =====================================================

        error: (error) => {

          console.error(
            '🔥 MANAGER APPLICATIONS ERROR:',
            error
          );


          this.requests = [];

          this.statPendingAction = 0;

          this.loadError = true;

        }

      });

  }


  // =========================================================
  // MAP BACKEND APPLICATION
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
        this.mapStatus(
          app.statusName
        ),


      destination:
        app.destination ??
        'N/A',


      companions:
        Array.isArray(app.participants)
          ? app.participants.length
          : 0,


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
        .toUpperCase()
        .trim();


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


    /*
     * Existing behavior:
     * unknown statuses are treated as pending.
     */

    return 'pending';

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
      `http://localhost:8081/api/applications/` +
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

        // ===================================================
        // SUCCESS
        // ===================================================

        next: (response) => {

          console.log(
            '🔥 MANAGER DECISION RESPONSE:',
            response
          );


          /*
           * Update the current row immediately.
           */

          req.status =
            newStatus;


          this.updateStatistics();


          alert(
            `Request ${req.requestId} ${newStatus}.`
          );


          /*
           * Reload from backend.
           *
           * This guarantees the screen reflects
           * the real database state.
           */

          this.loadRequests();

        },


        // ===================================================
        // ERROR
        // ===================================================

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