import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type AllocationStrategy = 'lottery' | 'fcfs';
type AllocationStatus = 'confirmed' | 'waitlist';

interface Applicant {
  appId: string;
  name: string;
  department: string;
  timestamp: string;
  eligible: boolean;
  allocationStatus: AllocationStatus;
}

@Component({
  selector: 'app-trip-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection.html'
  // No styleUrls — same single shared global stylesheet as the other pages.
})
export class Selection  {

  // ---- 1. Allocation Logic (was selectCard()) ----
  // Original manipulated classList/checked on raw DOM elements found via
  // querySelectorAll. Ported to a single bound value + click handler;
  // the template drives .active and [checked] off this instead.
  selectedStrategy: AllocationStrategy = 'lottery'; // first card had the static "checked" attribute

  selectStrategy(strategy: AllocationStrategy): void {
    this.selectedStrategy = strategy;
  }

  // ---- 2. Applicants table ----
  // NOTE: the original <script> had NO logic at all for this table — the
  // 6 rows, the "(6 Applicants)" heading text, and the "3 Confirmed / 3
  // Waitlisted" quota badge were all hardcoded static HTML/text with
  // nothing computing or syncing them. I've modeled the rows as data here
  // (cleaner Angular, matches the precedent from publish.html) and derived
  // the counts from that data via getters below, rather than leaving them
  // as separate hardcoded strings that could drift out of sync. If you'd
  // rather keep them as literal hardcoded text exactly as the original
  // had them, say so and I'll revert applicantCount/confirmedCount/
  // waitlistCount to plain hardcoded values instead.
  applicants: Applicant[] = [
    { appId: '#APP-101', name: 'Mariam Adel', department: 'Digital Banking', timestamp: '20/07/2026 09:02:14', eligible: true, allocationStatus: 'confirmed' },
    { appId: '#APP-102', name: 'Ahmed Hassan', department: 'Branch Operations', timestamp: '20/07/2026 09:05:30', eligible: true, allocationStatus: 'confirmed' },
    { appId: '#APP-103', name: 'Noha Khaled', department: 'HR Operations', timestamp: '20/07/2026 09:12:45', eligible: true, allocationStatus: 'confirmed' },
    { appId: '#APP-104', name: 'Omar Farouk', department: 'Risk & Compliance', timestamp: '20/07/2026 09:30:10', eligible: true, allocationStatus: 'waitlist' },
    { appId: '#APP-105', name: 'Salma Ibrahim', department: 'Retail Banking', timestamp: '20/07/2026 10:15:22', eligible: true, allocationStatus: 'waitlist' },
    { appId: '#APP-106', name: 'Tarek Mahmoud', department: 'IT Infrastructure', timestamp: '20/07/2026 11:40:05', eligible: true, allocationStatus: 'waitlist' }
  ];

  get applicantCount(): number {
    return this.applicants.length;
  }

  get confirmedCount(): number {
    return this.applicants.filter(a => a.allocationStatus === 'confirmed').length;
  }

  get waitlistCount(): number {
    return this.applicants.filter(a => a.allocationStatus === 'waitlist').length;
  }
}