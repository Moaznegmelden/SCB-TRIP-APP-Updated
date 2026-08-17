import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrApproval } from './hr-approval';

describe('HrApproval', () => {
  let component: HrApproval;
  let fixture: ComponentFixture<HrApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(HrApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
