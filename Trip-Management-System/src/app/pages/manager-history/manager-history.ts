import {ChangeDetectorRef,Component,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

import { Header } from '../../header/header';


type HistoryStatus =
  | 'approved'
  | 'rejected';


interface ApprovalHistoryApi {

  id?: number;

  applicationId?: number;

  actionByEmployeeId?: number;

  roleAtAction?: string;

  action?: string;

  comments?: string;

  actionAt?: string;

  application?: {

    applicationId?: number;

    employeeName?: string;

    employeeNumber?: string;

    tripTitle?: string;

    destination?: string;

    createdAt?: string;

    statusName?: string;

  };
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

  comments: string;

  actionDate: string;
}


@Component({

  selector: 'app-manager-history',

  standalone: true,

  imports: [
    CommonModule,
    Header
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

  statApproved = 0;

  statRejected = 0;

  statTotal = 0;


  // =========================================================
  // TABS
  // =========================================================

  activeTab: HistoryStatus | 'all' = 'all';


 constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
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
      sessionStorage.getItem('currentUser');


    if (!currentUserJson) {

      console.error(
        '🔥 APPROVAL HISTORY: currentUser not found'
      );

      this.loading = false;

      this.loadError = true;

      return;
    }


    try {

      this.currentUser =
        JSON.parse(currentUserJson);


      console.log(
        '🔥 APPROVAL HISTORY USER:',
        this.currentUser
      );


      this.managerId =
        Number(
          this.currentUser?.employeeId
        );


      const role =
        String(
          this.currentUser?.role || ''
        )
          .toUpperCase()
          .trim();


      console.log(
        '🔥 APPROVAL HISTORY ROLE:',
        role
      );


      // =====================================================
      // LINE MANAGER ONLY
      // =====================================================

      if (role !== 'LINE_MANAGER') {

        console.error(
          '🔥 USER IS NOT A LINE MANAGER:',
          role
        );

        this.loading = false;

        this.loadError = true;

        return;
      }


      if (!this.managerId) {

        console.error(
          '🔥 APPROVAL HISTORY: employeeId not found'
        );

        this.loading = false;

        this.loadError = true;

        return;
      }


      this.loadRequests();

    } catch (error) {

      console.error(
        '🔥 APPROVAL HISTORY USER ERROR:',
        error
      );

      this.loading = false;

      this.loadError = true;

    }

  }


  // =========================================================
  // LOAD LINE MANAGER APPROVAL HISTORY
  //
  // IMPORTANT:
  // No managerId is sent from Angular.
  //
  // Backend gets the current manager from JWT.
  // =========================================================

  loadRequests(): void {

    this.loading = true;

    this.loadError = false;


    const apiUrl =
      `http://localhost:8081/api/applications/manager/approval-history`;


    console.log(
      '🔥 MANAGER APPROVAL HISTORY API:',
      apiUrl
    );


    this.http

      .get<ApprovalHistoryApi[]>(apiUrl)

      .pipe(

       finalize(() => {

  this.loading = false;

  console.log(
    '🔥 MANAGER APPROVAL HISTORY LOADING FINISHED'
  );

  this.cdr.detectChanges();

})

      )

      .subscribe({

        next: (history) => {

          console.log(
            '🔥 MANAGER APPROVAL HISTORY RESPONSE:',
            history
          );


          this.requests =
            history

              .map(item =>
                this.mapHistory(item)
              )

              .filter(item =>
                item.status === 'approved' ||
                item.status === 'rejected'
              );


          this.updateStatistics();
          this.cdr.detectChanges();


          console.log(
            '🔥 FINAL MANAGER APPROVAL HISTORY:',
            this.requests
          );

        },


        error: (error) => {

          console.error(
            '🔥 MANAGER APPROVAL HISTORY ERROR:',
            error
          );


          this.requests = [];

          this.loadError = true;

        }
        

      });

  }


  // =========================================================
  // MAP APPROVAL HISTORY
  // =========================================================

  private mapHistory(
    item: ApprovalHistoryApi
  ): HistoryRequest {


    const application =
      item.application;


    return {

      applicationId:
        item.applicationId ??
        application?.applicationId ??
        0,


      requestId:
        `REQ-${
          item.applicationId ??
          application?.applicationId ??
          0
        }`,


      empName:
        application?.employeeName ??
        'Unknown Employee',


      empId:
        application?.employeeNumber ??
        'N/A',


      tripName:
        application?.tripTitle ??
        'Trip',


      startDate:
        'N/A',


      endDate:
        'N/A',


      submissionDate:
        this.formatDateTime(
          application?.createdAt
        ),


      status:
        this.mapAction(
          item.action
        ),


      destination:
        application?.destination ??
        'N/A',


      comments:
        item.comments ??
        '',


      actionDate:
        this.formatDateTime(
          item.actionAt
        )

    };

  }


  // =========================================================
  // MAP ACTION
  // =========================================================

  private mapAction(
    action?: string
  ): HistoryStatus {

    const normalized =
      (action ?? '')
        .toUpperCase()
        .trim();


    if (
      normalized.includes('REJECT')
    ) {

      return 'rejected';

    }


    return 'approved';

  }


  // =========================================================
  // DATE FORMAT
  // =========================================================

  private formatDateTime(
    value?: string
  ): string {

    if (!value) {

      return 'N/A';

    }


    const date =
      new Date(value);


    if (Number.isNaN(
      date.getTime()
    )) {

      return value;

    }


    return date.toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  private updateStatistics(): void {

    this.statApproved =
      this.requests.filter(
        request =>
          request.status === 'approved'
      ).length;


    this.statRejected =
      this.requests.filter(
        request =>
          request.status === 'rejected'
      ).length;


    this.statTotal =
      this.requests.length;

  }


  // =========================================================
  // TABS
  // =========================================================

  switchTab(
    tab: HistoryStatus | 'all'
  ): void {

    this.activeTab = tab;

  }


  // =========================================================
  // FILTERED HISTORY
  // =========================================================

  get filteredRequests(): HistoryRequest[] {

    if (this.activeTab === 'all') {

      return this.requests;

    }


    return this.requests.filter(
      request =>
        request.status === this.activeTab
    );

  }


  // =========================================================
  // STATUS LABEL
  // =========================================================

  statusLabel(
    status: HistoryStatus | 'all'
  ): string {

    if (status === 'all') {

      return 'All';

    }


    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );

  }

}