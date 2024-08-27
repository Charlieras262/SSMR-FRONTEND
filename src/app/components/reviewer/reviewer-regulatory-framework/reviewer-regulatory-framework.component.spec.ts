/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReviewerRegulatoryFrameworkComponent } from './reviewer-regulatory-framework.component';

describe('ReviewerRegulatoryFrameworkComponent', () => {
  let component: ReviewerRegulatoryFrameworkComponent;
  let fixture: ComponentFixture<ReviewerRegulatoryFrameworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewerRegulatoryFrameworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewerRegulatoryFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
