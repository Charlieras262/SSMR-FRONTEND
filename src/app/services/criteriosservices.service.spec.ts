import { TestBed } from '@angular/core/testing';

import { CRITERIOSSERVICESService } from './criteriosservices.service';

describe('CRITERIOSSERVICESService', () => {
  let service: CRITERIOSSERVICESService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CRITERIOSSERVICESService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
