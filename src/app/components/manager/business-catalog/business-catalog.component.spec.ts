import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCatalogComponent } from './business-catalog.component';

describe('BusinessCatalogComponent', () => {
  let component: BusinessCatalogComponent;
  let fixture: ComponentFixture<BusinessCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
