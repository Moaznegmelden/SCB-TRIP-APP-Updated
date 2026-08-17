import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerHistory } from './manager-history';

describe('ManagerHistory', () => {
  let component: ManagerHistory;
  let fixture: ComponentFixture<ManagerHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
