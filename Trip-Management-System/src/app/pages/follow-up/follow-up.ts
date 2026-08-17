import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  departureDate: string;   // ISO date string
  status: string;          // 'PENDING' | 'APPROVED' | 'REJECTED' | ...
  statusDisplay: string;
  submittedAt: string;     // ISO date-time string
  companionCount: number;
  totalAmount: number;
  timelineSteps: TimelineStep[];
}

interface CurrentUser {
  initials: string;
  role: string;
  fullName: string;
}

@Component({
  selector: 'app-follow-up',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './follow-up.html'
})
export class FollowUp implements OnInit {

  // ---- Was populated server-side via the Thymeleaf model (${request}, ${user}) ----
  request: FollowUpRequest | null = null;
  user: CurrentUser | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id') || '';

    this.http.get<FollowUpRequest>(`/api/requests/${requestId}`).subscribe({
      next: (data) => {
        this.request = data;
        // Was <title th:text="'Request Follow-up - ' + ${request.requestId}">
        this.titleService.setTitle(`Request Follow-up - ${data.requestId}`);
      }
    });

    this.http.get<CurrentUser>('/api/me').subscribe({
      next: (data) => (this.user = data)
    });
  }

  // ---- Was th:classappend on the status badge ----
  get statusBadgeClass(): string {
    if (!this.request) return '';
    if (this.request.status === 'APPROVED') return 'badge-approved';
    if (this.request.status === 'REJECTED') return 'badge-rejected';
    return 'badge-pending';
  }

  // ---- Was th:classappend on each timeline-item ----
  timelineItemClass(step: TimelineStep): string {
    if (step.completed) return 'done';
    if (step.current) return 'current';
    return '';
  }

  // ---- Was th:text="${step.completed ? '✓' : iterStat.count}" ----
  dotLabel(step: TimelineStep, index: number): string {
    return step.completed ? '✓' : String(index + 1);
  }

  // ---- Was onclick="return confirm('Are you sure you want to cancel this request?')" ----
  // guarding the "Cancel request" <form> submit.
  cancelRequest(): void {
    if (!this.request) return;

    const confirmed = confirm('Are you sure you want to cancel this request?');
    if (!confirmed) return;

    this.http.post(`/requests/${this.request.id}/cancel`, {}).subscribe({
      next: () => {
        if (this.request) {
          this.request.status = 'CANCELLED';
        }
      },
      error: () => alert('Unable to cancel the request. Please try again.')
    });
  }

  // ---- Was the "Send reminder" <form> submit ----
  sendReminder(): void {
    if (!this.request) return;

    this.http.post(`/requests/${this.request.id}/remind`, {}).subscribe({
      next: () => alert('Reminder sent.'),
      error: () => alert('Unable to send the reminder. Please try again.')
    });
  }
}