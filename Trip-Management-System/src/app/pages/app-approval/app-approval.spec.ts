import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppApproval } from './app-approval';

describe('AppApproval', () => {
  let component: AppApproval;
  let fixture: ComponentFixture<AppApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(AppApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
