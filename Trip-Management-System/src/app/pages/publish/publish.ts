import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Departure {
  id: number;
  startDate: string;
  endDate: string;
  capacity: number;
  busSeats: number;
}

interface HrUser {
  name: string;
  role: string;
  initials: string;
  subtitle: string;
  avatarColor?: string;
}

type ReasonType = 'return' | 'reject' | null;

@Component({
  selector: 'app-publish-trip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish.html',
  styleUrl: './publish.css'
})
export class Publish {

  // =========================================================
  // CURRENT HR USER
  // =========================================================

  users: HrUser[] = [
    {
      name: 'HR User',
      role: 'Maker Authority',
      initials: 'HU',
      subtitle: 'Trip Administrator'
    },
    {
      name: 'HR Manager',
      role: 'Approver Authority',
      initials: 'HM',
      subtitle: 'Approver',
      avatarColor: '#059669'
    }
  ];

  currentUser: HrUser = this.users[0];

  userMenuOpen = false;


  // =========================================================
  // TRIP INFORMATION
  // =========================================================

  tripTitle = 'Steigenberger El Gouna';

  destination = 'El Gouna';

  duration = '5 days / 4 nights';

  registrationOpens = '2026-07-20T09:00';

  registrationCloses = '2026-07-27T16:00';


  // =========================================================
  // DEPARTURES
  // =========================================================

  departures: Departure[] = [
    {
      id: 1,
      startDate: '2026-07-26',
      endDate: '2026-07-30',
      capacity: 100,
      busSeats: 50
    }
  ];

  private nextDepartureId = 2;


  addDeparture(): void {
    this.departures.push({
      id: this.nextDepartureId++,
      startDate: '',
      endDate: '',
      capacity: 1,
      busSeats: 0
    });
  }


  removeDeparture(index: number): void {
    if (this.departures.length <= 1) {
      return;
    }

    this.departures.splice(index, 1);
  }


  // =========================================================
  // USER MENU
  // =========================================================

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }


  switchUser(user: HrUser): void {
    this.currentUser = user;
    this.userMenuOpen = false;
  }


  logout(): void {
    alert('Logging out...');
  }


  // =========================================================
  // RETURN / REJECT REASON PANEL
  // =========================================================

  activeReason: ReasonType = null;

  returnReason = '';

  rejectReason = '';


  toggleReason(type: ReasonType): void {
    /*
     * Clicking the same button again closes the panel.
     * Clicking the other action switches to that panel.
     */
    if (this.activeReason === type) {
      this.activeReason = null;
    } else {
      this.activeReason = type;
    }
  }


  submitReason(action: 'Return' | 'Rejection'): void {

    const reason =
      action === 'Return'
        ? this.returnReason.trim()
        : this.rejectReason.trim();

    if (!reason) {
      alert(
        action === 'Return'
          ? 'Please provide a reason for returning the trip.'
          : 'Please provide a reason for rejecting the trip.'
      );

      return;
    }

    /*
     * For now this is frontend-only.
     * Later this method will call the .NET API.
     */
    console.log(`${action} reason:`, reason);

    alert(`${action} submitted successfully.`);

    if (action === 'Return') {
      this.returnReason = '';
    } else {
      this.rejectReason = '';
    }

    this.activeReason = null;
  }


  // =========================================================
  // SAVE DRAFT
  // =========================================================

  saveDraft(): void {

    const draft = {
      tripTitle: this.tripTitle,
      destination: this.destination,
      duration: this.duration,
      registrationOpens: this.registrationOpens,
      registrationCloses: this.registrationCloses,
      departures: this.departures
    };

    /*
     * Temporary frontend behavior.
     * Later this will call the .NET backend.
     */
    console.log('Trip draft:', draft);

    alert('Draft saved successfully.');
  }


  // =========================================================
  // PUBLISH
  // =========================================================

  publish(): void {

    /*
     * Basic frontend validation.
     * Backend validation will be added later.
     */

    if (!this.tripTitle.trim()) {
      alert('Please enter a trip title.');
      return;
    }

    if (!this.destination.trim()) {
      alert('Please enter a destination.');
      return;
    }

    if (!this.duration.trim()) {
      alert('Please enter the trip duration.');
      return;
    }

    if (!this.registrationOpens) {
      alert('Please select when registration opens.');
      return;
    }

    if (!this.registrationCloses) {
      alert('Please select when registration closes.');
      return;
    }

    if (this.departures.length === 0) {
      alert('Please add at least one departure.');
      return;
    }

    console.log('Publishing trip:', {
      tripTitle: this.tripTitle,
      destination: this.destination,
      duration: this.duration,
      registrationOpens: this.registrationOpens,
      registrationCloses: this.registrationCloses,
      departures: this.departures
    });

    /*
     * Temporary frontend behavior.
     * Later this will call the .NET API.
     */
    alert('Trip submitted for publication.');
  }


  // =========================================================
  // CLOSE USER MENU WHEN CLICKING OUTSIDE
  // =========================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;

    if (
      this.userMenuOpen &&
      !target.closest('.user-dropdown-container')
    ) {
      this.userMenuOpen = false;
    }
  }
}