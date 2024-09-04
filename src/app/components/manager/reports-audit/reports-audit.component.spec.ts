import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsAuditComponent } from './reports-audit.component';

describe('ReportsAuditComponent', () => {
  let component: ReportsAuditComponent;
  let fixture: ComponentFixture<ReportsAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsAuditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
