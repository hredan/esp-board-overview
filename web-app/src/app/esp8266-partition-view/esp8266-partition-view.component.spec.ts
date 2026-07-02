import { TestBed } from '@angular/core/testing';
import { Esp8266PartitionViewComponent } from './esp8266-partition-view.component';

describe('Esp8266PartitionViewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp8266PartitionViewComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionViewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
