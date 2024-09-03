import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentSupportingComponent } from './document-supporting.component';

describe('DocumentSupportingComponent', () => {
  let component: DocumentSupportingComponent;
  let fixture: ComponentFixture<DocumentSupportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentSupportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentSupportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
