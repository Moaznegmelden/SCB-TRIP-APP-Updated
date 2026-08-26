import {Component,OnInit,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../header/header';
import { finalize } from 'rxjs/operators';


type HistoryStatus =
  'selected'
  | 'waitlist'
  | 'not_selected'
  | 'rejected'
  | string;

interface ApplicationApi {
  applicationId: number;
  tripTitle?: string;
  destination?: string;
  batchId?: number;
  statusName?: string;
  participants?: unknown[];
  roomsRequested?: number;
  totalPrice?: number;
  selectionMethod?: string;
  selectedAt?: string | null;
}

interface HistoryRow {
  applicationId: number;
  requestId: string;
  tripTitle: string;
  destination: string;
  batchId: string;
  roomsRequested: number;
  companions: number;
  totalPrice: number;
  selectionMethod: string;
  selectedAt: string;
  status: HistoryStatus;
  statusDisplay: string;
}

@Component({
  selector: 'app-history',
  standalone: true,

  imports: [
    CommonModule,
    Header
  ],

  templateUrl: './history.html'
})
export class History implements OnInit {

  // =========================================================
  // API
  // =========================================================

  private readonly API_URL =
    '/api/applications/my/history';


  // =========================================================
  // PAGE STATE
  // =========================================================

  history: HistoryRow[] = [];

  loading = true;

  loadError = false;


  // =========================================================
  // STATS
  // =========================================================

  statSelected = 0;

  statWaitlist = 0;

  statNotSelected = 0;

  statTotal = 0;

  statRejected = 0;


  // =========================================================
  // FILTER
  // =========================================================

  activeTab:
  'all'
  | 'selected'
  | 'waitlist'
  | 'not_selected'
  | 'rejected'
  = 'all';

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

    this.loadHistory();

  }


  // =========================================================
  // LOAD MY HISTORY
  // =========================================================

 loadHistory(): void {

  this.loading = true;
  this.loadError = false;

  this.http
    .get<ApplicationApi[]>(this.API_URL)
    .pipe(
      finalize(() => {

        this.loading = false;

        console.log(
          '🔥 MY HISTORY LOADING FINISHED:',
          this.loading
        );

        // Force Angular to update the UI
        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (applications: ApplicationApi[]) => {

        console.log(
          '🔥 MY HISTORY API:',
          applications
        );

        this.history =
          applications.map(
            (app: ApplicationApi) =>
              this.mapApplication(app)
          );

        this.updateStatistics();

        console.log(
          '🔥 MY HISTORY MAPPED:',
          this.history
        );

      },

      error: (error: any) => {

        console.error(
          '🔥 MY HISTORY ERROR:',
          error
        );

        this.history = [];

        this.loadError = true;

      }

    });

}


  // =========================================================
  // MAP APPLICATION
  // =========================================================

  private mapApplication(
    app: ApplicationApi
  ): HistoryRow {

    const status =
      this.mapStatus(
        app.statusName
      );


    return {

      applicationId:
        app.applicationId,

      requestId:
        `REQ-${app.applicationId}`,

      tripTitle:
        app.tripTitle ??
        'Trip',

      destination:
        app.destination ??
        'N/A',

      batchId:
        String(
          app.batchId ??
          'N/A'
        ),

      roomsRequested:
        app.roomsRequested ??
        0,

      companions:
        app.participants?.length ??
        0,

      totalPrice:
        app.totalPrice ??
        0,

      selectionMethod:
        app.selectionMethod ??
        'N/A',

      selectedAt:
        this.formatDate(
          app.selectedAt
        ),

      status,

      statusDisplay:
        this.statusLabel(status)

    };

  }


  // =========================================================
  // STATUS MAPPING
  // =========================================================

  private mapStatus(
  statusName?: string
): HistoryStatus {

  const status =
    (
      statusName ??
      ''
    )
      .toUpperCase()
      .trim();


  if (
    status.includes('REJECTED_BY_MANAGER') ||
    status.includes('REJECTED BY MANAGER')
  ) {

    return 'rejected';

  }


  if (
    status.includes('SELECTED') &&
    !status.includes('NOT')
  ) {

    return 'selected';

  }


  if (
    status.includes('WAITLIST')
  ) {

    return 'waitlist';

  }


  if (
    status.includes('NOT_SELECTED') ||
    status.includes('NOT SELECTED')
  ) {

    return 'not_selected';

  }


  return statusName
    ? statusName.toLowerCase()
    : 'not_selected';

}


  // =========================================================
  // DATE
  // =========================================================

  private formatDate(
    value?: string | null
  ): string {

    if (!value) {
      return 'N/A';
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return 'N/A';

    }


    return date.toLocaleDateString(
      'en-GB'
    );

  }


  // =========================================================
  // STATUS LABEL
  // =========================================================

  statusLabel(
  status: HistoryStatus
): string {

  switch (status) {

    case 'selected':
      return 'Selected';

    case 'waitlist':
      return 'Waitlist';

    case 'not_selected':
      return 'Not Selected';

    case 'rejected':
      return 'Rejected';

    default:

      return status
        .replace(/_/g, ' ')
        .replace(
          /\b\w/g,
          char => char.toUpperCase()
        );

  }

}


  // =========================================================
  // STATISTICS
  // =========================================================

  private updateStatistics(): void {

  this.statTotal =
    this.history.length;


  this.statSelected =
    this.history.filter(
      item =>
        item.status === 'selected'
    ).length;


  this.statWaitlist =
    this.history.filter(
      item =>
        item.status === 'waitlist'
    ).length;


  this.statNotSelected =
    this.history.filter(
      item =>
        item.status === 'not_selected'
    ).length;


  this.statRejected =
    this.history.filter(
      item =>
        item.status === 'rejected'
    ).length;

}


  // =========================================================
  // TABS
  // =========================================================

  switchTab(
  tab:
    | 'all'
    | 'selected'
    | 'waitlist'
    | 'not_selected'
    | 'rejected'
): void {

  this.activeTab = tab;

}


  // =========================================================
  // FILTERED HISTORY
  // =========================================================

  get filteredHistory(): HistoryRow[] {

    if (
      this.activeTab === 'all'
    ) {

      return this.history;

    }


    return this.history.filter(
      item =>
        item.status === this.activeTab
    );

  }

}