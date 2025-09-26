import { TestBed } from '@angular/core/testing';

import { Esp32DataService } from './esp32-data.service';

describe('Esp32DataService', () => {
  let service: Esp32DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Esp32DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
