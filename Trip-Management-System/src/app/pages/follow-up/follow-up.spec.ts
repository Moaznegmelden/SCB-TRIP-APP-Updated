import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUp } from './follow-up';

describe('FollowUp', () => {
  let component: FollowUp;
  let fixture: ComponentFixture<FollowUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUp],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
