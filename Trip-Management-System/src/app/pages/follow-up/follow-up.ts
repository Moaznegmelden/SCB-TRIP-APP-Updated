import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute ,  } from '@angular/router';
import { Header } from '../../header/header';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

interface TimelineStep {
  title: string;
  metaDescription: string;
  completed: boolean;
  current: boolean;
}

interface FollowUpRequest {
  id: string;
  requestId: string;
  tripTitle: string;
  destination: string;
  departureDate: string;
  status: string;
  statusDisplay: string;
 submittedAt: string | null;
  companionCount: number;
  totalAmount: number;
  timelineSteps: TimelineStep[];
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
  submittedAt?: string | null;
  statusName?: string;
  totalPrice?: number;
  transportType?: string;
  tripId?: number;
  tripTitle?: string;
}



@Component({
  selector: 'app-follow-up',
  standalone: true,
 imports: [
  CommonModule,
  RouterLink,
  Header
],
  templateUrl: './follow-up.html',
  styleUrl: './follow-up.css'
})

export class FollowUp implements OnInit {

  // =========================
  // PAGE STATE
  // =========================

  request: FollowUpRequest | null = null;

  loading = true;

  loadError = false;

 

  // =========================
  // API
  // =========================

 private readonly API_URL = 'http://localhost:8081/api/applications/my';


  // =========================
  // CONSTRUCTOR
  // =========================

 constructor(
  private route: ActivatedRoute,
  private http: HttpClient,
  private titleService: Title,
  private cdr: ChangeDetectorRef
) {}

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    const applicationId =
      Number(this.route.snapshot.paramMap.get('id'));

    console.log(
      'FOLLOW-UP APPLICATION ID:',
      applicationId
    );

    if (!applicationId) {

      this.loading = false;
      this.loadError = true;

      return;
    }

    this.loadRequest(applicationId);
  }


  // =========================
  // LOAD REQUEST
  // =========================

  private loadRequest(applicationId: number): void {

    // Reset state before loading
    this.loading = true;
    this.loadError = false;
    this.request = null;


    this.http
      .get<ApplicationApi[]>(this.API_URL)
      .subscribe({

        next: (applications) => {

          console.log(
            'FOLLOW-UP APPLICATIONS:',
            applications
          );


          // Find the application that matches
          // the ID from /follow-up/:id
          const application =
            applications.find(
              app =>
                Number(app.applicationId) === applicationId
            );


          console.log(
            'FOLLOW-UP APPLICATION:',
            application
          );


          // Application not found
          if (!application) {

            this.loading = false;
            this.loadError = true;
            this.request = null;
            this.cdr.detectChanges();

            return;
          }


          // =========================
          // STATUS
          // =========================

          const rawStatus =
            (application.statusName || 'PENDING')
              .toUpperCase();


          let status = 'PENDING';
          let statusDisplay = 'Pending';


          if (rawStatus.includes('REJECT')) {

            status = 'REJECTED';
            statusDisplay = 'Rejected';

          }
          else if (rawStatus.includes('APPROV')) {

            status = 'APPROVED';
            statusDisplay = 'Approved';

          }
          else {

            status = 'PENDING';
            statusDisplay = 'Pending';

          }


          // =========================
          // MAP API DATA
          // =========================

          const mappedRequest: FollowUpRequest = {

            id:
              String(application.applicationId),

            requestId:
              `REQ-${application.applicationId}`,

            tripTitle:
              application.tripTitle || 'Trip',

            destination:
              application.destination || 'N/A',

            // The current API response does not contain
            // a departure date.
            departureDate:
              '',

            status,

            statusDisplay,

            // The current API response does not contain
            // submittedAt.
            submittedAt: application.submittedAt ?? null,

            companionCount:
              application.participants?.length ?? 0,

            totalAmount:
              application.totalPrice ?? 0,

            timelineSteps:
              this.buildTimeline(rawStatus, status)
          };


          console.log(
            'FOLLOW-UP MAPPED:',
            mappedRequest
          );


          // =========================
          // SET REQUEST
          // =========================

          this.request = mappedRequest;

          this.loadError = false;

          // VERY IMPORTANT:
          // Stop the loading screen
          this.loading = false;


          // Browser title
          this.titleService.setTitle(
            `Request Follow-up - ${mappedRequest.requestId}`
          );
          // Force Angular to update the page
          this.cdr.detectChanges();
        },


        // =========================
        // API ERROR
        // =========================

        error: (error) => {

          console.error(
            'FOLLOW-UP API ERROR:',
            error
          );

          this.request = null;

          this.loading = false;

          this.loadError = true;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================
  // TIMELINE
  // =========================

  private buildTimeline(
    rawStatus: string,
    status: string
  ): TimelineStep[] {

    const isManagerReviewed =
      rawStatus.includes('MANAGER') ||
      status === 'REJECTED' ||
      status === 'APPROVED';


    const isApproved =
      status === 'APPROVED';


    const isRejected =
      status === 'REJECTED';


    return [

      {
        title: 'Request Submitted',

        metaDescription:
          'Your request has been submitted.',

        completed: true,

        current: false
      },


      {
        title: 'Manager Review',

        metaDescription:
          isRejected
            ? 'Reviewed by manager.'
            : isApproved
              ? 'Approved by manager.'
              : 'Waiting for manager review.',

        completed:
          isManagerReviewed,

        current:
          rawStatus === 'PENDING_MANAGER'
      },


      {
        title: 'HR Approval',

        metaDescription:
          isApproved
            ? 'Approved by HR.'
            : isRejected
              ? 'Request was rejected.'
              : 'Waiting for HR approval.',

        completed:
          isApproved,

        current:
          false
      }

    ];
  }


  // =========================
  // STATUS BADGE
  // =========================

  get statusBadgeClass(): string {

    if (!this.request) {
      return '';
    }


    if (this.request.status === 'APPROVED') {

      return 'badge-approved';

    }


    if (this.request.status === 'REJECTED') {

      return 'badge-rejected';

    }


    return 'badge-pending';
  }


  // =========================
  // TIMELINE ITEM CLASS
  // =========================

  timelineItemClass(
    step: TimelineStep
  ): string {

    if (step.completed) {

      return 'done';

    }


    if (step.current) {

      return 'current';

    }


    return '';
  }


  // =========================
  // TIMELINE DOT
  // =========================

  dotLabel(
    step: TimelineStep,
    index: number
  ): string {

    return step.completed
      ? '✓'
      : String(index + 1);
  }


  // =========================
  // CANCEL REQUEST
  // =========================

  cancelRequest(): void {

    if (!this.request) {
      return;
    }


    const confirmed =
      confirm(
        'Are you sure you want to cancel this request?'
      );


    if (!confirmed) {
      return;
    }


    this.http
      .post(
        `/requests/${this.request.id}/cancel`,
        {}
      )
      .subscribe({

        next: () => {

          if (this.request) {

            this.request.status =
              'CANCELLED';

            this.request.statusDisplay =
              'Cancelled';

          }

        },


        error: () => {

          alert(
            'Unable to cancel the request. Please try again.'
          );

        }

      });
  }


  // =========================
  // SEND REMINDER
  // =========================

  sendReminder(): void {

    if (!this.request) {
      return;
    }


    this.http
      .post(
        `/requests/${this.request.id}/remind`,
        {}
      )
      .subscribe({

        next: () => {

          alert(
            'Reminder sent.'
          );

        },


        error: () => {

          alert(
            'Unable to send the reminder. Please try again.'
          );

        }

      });
  }

}