import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyReviewComponent } from './company-review.component';

describe('CompanyReviewComponent', () => {
  let component: CompanyReviewComponent;
  let fixture: ComponentFixture<CompanyReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
