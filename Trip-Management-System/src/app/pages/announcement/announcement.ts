import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  Router,
  ActivatedRoute,
  RouterModule
} from '@angular/router';

import { HttpClient } from '@angular/common/http';


interface Trip {

  id: number;

  title: string;

  destination: string;

  duration: number;

  registrationOpens?: string;

  registrationCloses?: string;

}


interface ConfirmedApplicant {

  employeeName: string;

  employeeId: number | string;

  department?: string;

  submissionTimestamp?: string;

}


interface AllocationResult {

  tripId?: number;

  tripName?: string;

  method?: string;

  publishedAt?: string;

  confirmedApplicants?: ConfirmedApplicant[];

}


@Component({

  selector: 'app-announcement',

  standalone: true,

  imports: [
  CommonModule,
  RouterModule
],
  templateUrl: './announcement.html',

  styleUrl: './announcement.css'

})


export class Announcement implements OnInit {


  readonly apiUrl = 'http://localhost:8080/api';


  activeTrips: Trip[] = [];


  allocation: AllocationResult | null = null;


  confirmedApplicants: ConfirmedApplicant[] = [];


  loading = false;


  errorMessage = '';


  isListMode = true;


  userInitials = '';


  userDisplayName = '';


  userDisplayRole = '';


  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {}


  ngOnInit(): void {

    this.loadCurrentUser();


    const tripIdParam =
      this.route.snapshot.paramMap.get('tripId');


    if (tripIdParam) {

      this.isListMode = false;

      const tripId = Number(tripIdParam);


      if (
        !Number.isFinite(tripId) ||
        tripId <= 0
      ) {

        this.errorMessage =
          'Invalid trip ID.';

        this.loading = false;

        return;

      }


      this.loadAnnouncement(tripId);

      return;

    }


    this.isListMode = true;

    this.loadApprovedTrips();

  }


  // =========================================================
  // CURRENT USER
  // =========================================================

  private loadCurrentUser(): void {

    try {

      const raw =
        sessionStorage.getItem('currentUser') ??
        localStorage.getItem('currentUser');


      if (!raw) {

        this.setDefaultUser();

        return;

      }


      const user = JSON.parse(raw);


      this.userDisplayName =
        user?.fullName ??
        user?.name ??
        user?.username ??
        'User';


      const rawRole =
        user?.role ??
        user?.roleName ??
        user?.userRole ??
        '';


      this.userDisplayRole =
        this.normalizeRoleDisplay(rawRole);


      this.userInitials =
        this.getInitials(
          this.userDisplayName
        );

    }

    catch {

      this.setDefaultUser();

    }

  }


  private setDefaultUser(): void {

    this.userDisplayName = 'User';

    this.userDisplayRole = '';

    this.userInitials = 'U';

  }


  // =========================================================
  // ROLE
  // =========================================================

  get isHrManager(): boolean {

    const role =
      this.userDisplayRole
        .toLowerCase()
        .replace(/[_-]/g, ' ');


    return (

      role.includes('hr manager') ||

      role.includes('hr_manager') ||

      role.includes('manager authority')

    );

  }


  get isHrAdmin(): boolean {

    const role =
      this.userDisplayRole
        .toLowerCase()
        .replace(/[_-]/g, ' ');


    return (

      role === 'hr' ||

      role.includes('hr admin') ||

      role.includes('hr_admin') ||

      role === 'administration'

    );

  }


  private normalizeRoleDisplay(
    role: string
  ): string {

    const value =
      String(role ?? '').trim();


    if (!value) {

      return '';

    }


    const normalized =
      value
        .toUpperCase()
        .replace(/[_-]/g, ' ');


    if (
      normalized === 'HR MANAGER' ||
      normalized === 'MANAGER AUTHORITY'
    ) {

      return 'HR Manager';

    }


    if (
      normalized === 'HR ADMIN' ||
      normalized === 'HR'
    ) {

      return 'HR';

    }


    return value;

  }


  private getInitials(
    name: string
  ): string {

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (parts.length === 0) {

      return 'U';

    }


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }


  // =========================================================
  // LOAD APPROVED / ACTIVE TRIPS
  // =========================================================

  private loadApprovedTrips(): void {

    this.loading = true;

    this.errorMessage = '';


    this.http
      .get<any[]>(
        `${this.apiUrl}/trips/active`
      )

      .subscribe({

        next: (trips) => {

          this.activeTrips =
            (trips ?? []).map(
              trip => this.mapTrip(trip)
            );


          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to load approved trips:',
            error
          );


          this.activeTrips = [];

          this.loading = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load approved trips.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // MAP TRIP
  // =========================================================

  private mapTrip(
    trip: any
  ): Trip {

    return {

      id:
        Number(
          trip?.id ??
          trip?.tripId
        ),

      title:
        trip?.title ??
        'Trip',

      destination:
        trip?.destination ??
        'N/A',

      duration:
        Number(
          trip?.duration ??
          trip?.durationDays ??
          0
        ),

      registrationOpens:
        trip?.registrationOpens ??
        trip?.registrationOpen,

      registrationCloses:
        trip?.registrationCloses ??
        trip?.registrationClose

    };

  }


  // =========================================================
  // LOAD ANNOUNCEMENT DETAILS
  // =========================================================

  private loadAnnouncement(
    tripId: number
  ): void {

    this.loading = true;

    this.errorMessage = '';

    this.allocation = null;

    this.confirmedApplicants = [];


    this.http
      .get<any>(
        `${this.apiUrl}/hr/trips/${tripId}/allocation/result`
      )

      .subscribe({

        next: (response) => {

          console.log(
            'ANNOUNCEMENT RESULT:',
            response
          );


          this.allocation =
            response ?? null;


          this.confirmedApplicants =
            this.extractConfirmedApplicants(
              response
            );


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to load announcement:',
            error
          );


          this.loading = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load announcement details.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CONFIRMED APPLICANTS
  // =========================================================

  private extractConfirmedApplicants(
    response: any
  ): ConfirmedApplicant[] {

    const list =
      response?.confirmedApplicants ??
      response?.selectedApplicants ??
      response?.selectedEmployees ??
      response?.applicants ??
      [];


    if (!Array.isArray(list)) {

      return [];

    }


    return list.map(
      (item: any) => ({

        employeeName:
          item?.employeeName ??
          item?.fullName ??
          item?.employee?.fullName ??
          'Unknown Employee',


        employeeId:
          item?.employeeId ??
          item?.employeeNumber ??
          item?.employee?.employeeId ??
          item?.employee?.employeeNumber ??
          '-',


        department:
          item?.department ??
          item?.departmentName ??
          item?.employee?.department?.departmentName ??
          '-',


        submissionTimestamp:
          item?.submissionTimestamp ??
          item?.submittedAt ??
          item?.createdAt ??
          item?.selectedAt ??
          '-'

      })

    );

  }


  // =========================================================
  // ERROR MESSAGE
  // =========================================================

 private getErrorMessage(
  error: any,
  fallback: string
): string {

  const message: unknown =
    error?.error?.message ??
    error?.error?.error ??
    (
      typeof error?.error === 'string'
        ? error.error
        : null
    ) ??
    error?.message ??
    null;

  if (
    typeof message === 'string' &&
    message.trim().length > 0
  ) {
    return message;
  }

  return fallback;
}

}