import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Esp32PartitionOverviewComponent } from './esp32-partition-overview.component';

describe('Esp32PartitionOverviewComponent', () => {
  let component: Esp32PartitionOverviewComponent;
  let fixture: ComponentFixture<Esp32PartitionOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp32PartitionOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Esp32PartitionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
