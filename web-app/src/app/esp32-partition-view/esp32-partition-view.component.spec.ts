import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartitionEntry } from '../esp32-data.service';

import { Esp32PartitionViewComponent } from './esp32-partition-view.component';

describe('Esp32PartitionViewComponent', () => {
  let component: Esp32PartitionViewComponent;
  let fixture: ComponentFixture<Esp32PartitionViewComponent>;

  function createComponent(selectedSchemeData: PartitionEntry[]) {
    fixture = TestBed.createComponent(Esp32PartitionViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('schemeName', 'Minimal SPIFFS');
    fixture.componentRef.setInput('selectedSchemeData', selectedSchemeData);

    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp32PartitionViewComponent]
    }).compileComponents();
  });

  it('should create', () => {
    createComponent([{ name: 'nvs', type: 'data', subtype: 'nvs', offset: '0x9000', size: '0x5000' }]);
    expect(component).toBeTruthy();
  });

  it('should render partition graph and table headings for valid data', () => {
    createComponent([{ name: 'nvs', type: 'data', subtype: 'nvs', offset: '0x9000', size: '0x5000' }]);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Partition Graph - Minimal SPIFFS');
    expect(text).toContain('Partition Table - Minimal SPIFFS');
    expect(text).toContain('nvs');
  });

  it('should render error message when no data is available', () => {
    createComponent([]);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Error, no data available');
  });
});
