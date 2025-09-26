import { TestBed } from '@angular/core/testing';

import { Esp8266DataService } from './esp8266-data.service';

describe('Esp8266DataService', () => {
  let service: Esp8266DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Esp8266DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
