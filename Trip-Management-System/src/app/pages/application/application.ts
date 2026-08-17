import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface AdultCompanion {
  name: string;
  relation: string;
  nationalId: string;
}

interface ChildCompanion {
  name: string;
  dob: string;
  nationalId: string;
}

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './application.html',
  styleUrl: './application.css'   // ← add this
})
export class Application {

  // ---- Pricing variables (can be loaded from API later) ----
  readonly PRICE = {
    employee: 2800,
    adult: 3200,
    child: 1800,
    infant: 0,
    bus: 350,
    activity: 450
  };
  readonly MAX_COMPANIONS = 3;

  // ---- Form state (mirrors the original #departure, #adults, etc.) ----
  departure = '';
  adults = 0;
  children = 0;
  infants = 0;
  busSeat = false;
  extraActivity = false;
  notes = '';

  // ---- Dynamic companion detail rows (was innerHTML in #companionDetails) ----
  adultCompanions: AdultCompanion[] = [];
  childCompanions: ChildCompanion[] = [];

  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  // ---- Calculator (was recalculate()) ----
  get busPersons(): number {
    return this.busSeat ? 1 + this.adults + this.children : 0;
  }

  get busCost(): number {
    return this.busSeat ? this.busPersons * this.PRICE.bus : 0;
  }

  get activityCost(): number {
    return this.extraActivity ? this.PRICE.activity : 0;
  }

  get adultsCost(): number {
    return this.adults * this.PRICE.adult;
  }

  get childrenCost(): number {
    return this.children * this.PRICE.child;
  }

  get total(): number {
    return this.PRICE.employee + this.adultsCost + this.childrenCost + this.busCost + this.activityCost;
  }

  format(n: number): string {
    return n.toLocaleString('en-EG') + ' EGP';
  }

  // ---- Companion count changes (was onchange="recalculate(); updateCompanionFields()") ----
  onAdultsChange(): void {
    this.enforceCompanionLimit();
    this.syncAdultCompanions();
  }

  onChildrenChange(): void {
    this.enforceCompanionLimit();
    this.syncChildCompanions();
  }

  private enforceCompanionLimit(): void {
    const totalComp = this.adults + this.children;
    if (totalComp > this.MAX_COMPANIONS) {
      alert(`Maximum ${this.MAX_COMPANIONS} companions allowed (adults + children).`);
      this.adults = 0;
      this.children = 0;
      this.adultCompanions = [];
      this.childCompanions = [];
    }
  }

  private syncAdultCompanions(): void {
    const count = Math.min(this.adults, this.MAX_COMPANIONS);
    if (this.adultCompanions.length < count) {
      while (this.adultCompanions.length < count) {
        this.adultCompanions.push({ name: '', relation: '', nationalId: '' });
      }
    } else {
      this.adultCompanions.length = count;
    }
  }

  private syncChildCompanions(): void {
    const count = Math.min(this.children, this.MAX_COMPANIONS);
    if (this.childCompanions.length < count) {
      while (this.childCompanions.length < count) {
        this.childCompanions.push({ name: '', dob: '', nationalId: '' });
      }
    } else {
      this.childCompanions.length = count;
    }
  }

  // ---- Submit (was async handleSubmit(e)) ----
  onSubmit(): void {
    if (!this.departure) {
      alert('Please select a departure slot.');
      return;
    }

    const tripId = this.route.snapshot.queryParamMap.get('tripId') || '1';
    const batchId = this.route.snapshot.queryParamMap.get('batchId') || '1';
    const employeeId = '1';

    const payload = {
      transportType: this.busSeat ? 'BUS' : 'NONE',
      pickupPoint: 'Cairo',
      roomsRequested: 1,
      totalPrice: this.total,
      participants: [
        ...this.adultCompanions.map(c => ({
          type: 'ADULT',
          fullName: c.name,
          relation: c.relation,
          nationalId: c.nationalId
        })),
        ...this.childCompanions.map(c => ({
          type: 'CHILD',
          fullName: c.name,
          dateOfBirth: c.dob,
          nationalId: c.nationalId
        }))
      ],
      infants: this.infants,
      extraActivity: this.extraActivity,
      notes: this.notes
    };

    this.submitting = true;

    this.http
      .post(
        `http://localhost:8080/api/applications?tripId=${tripId}&batchId=${batchId}&employeeId=${employeeId}`,
        payload
      )
      .subscribe({
        next: () => {
          this.submitting = false;
          alert('Application submitted successfully!\nIt has been sent to your manager for approval.');
          this.router.navigate(['/myreq']);
        },
        error: () => {
          this.submitting = false;
          alert('Unable to submit application. Start the backend server and verify the database connection.');
        }
      });
  }
}