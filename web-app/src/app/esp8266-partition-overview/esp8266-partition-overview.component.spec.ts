import { TestBed } from '@angular/core/testing';
import { Esp8266PartitionOverviewComponent } from './esp8266-partition-overview.component';

describe('Esp8266PartitionOverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp8266PartitionOverviewComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
