import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrApprovalDetails } from './hr-approval-details';

describe('HrApprovalDetails', () => {
  let component: HrApprovalDetails;
  let fixture: ComponentFixture<HrApprovalDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrApprovalDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(HrApprovalDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});