import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditDocumentComponent } from './audit-document.component';

describe('AuditDocumentComponent', () => {
  let component: AuditDocumentComponent;
  let fixture: ComponentFixture<AuditDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
