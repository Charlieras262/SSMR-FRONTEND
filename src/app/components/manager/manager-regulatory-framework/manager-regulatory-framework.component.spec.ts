/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ManagerRegulatoryFrameworkComponent } from './manager-regulatory-framework.component';

describe('ManagerRegulatoryFrameworkComponent', () => {
  let component: ManagerRegulatoryFrameworkComponent;
  let fixture: ComponentFixture<ManagerRegulatoryFrameworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerRegulatoryFrameworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerRegulatoryFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
