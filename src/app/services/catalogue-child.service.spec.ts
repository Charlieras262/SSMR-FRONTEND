import { TestBed } from '@angular/core/testing';

import { CatalogueChildService } from './catalogue-child.service';

describe('CatalogueChildService', () => {
  let service: CatalogueChildService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogueChildService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
