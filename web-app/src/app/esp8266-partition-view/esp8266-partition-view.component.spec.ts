import { TestBed } from '@angular/core/testing';
import { Esp8266PartitionViewComponent } from './esp8266-partition-view.component';
import { Esp8266PartitionEntry } from '../esp8266-data.service';

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

  it('should reset table and graph when selected scheme data is empty', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionViewComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('selectedSchemeData', []);
    fixture.detectChanges();

    expect(component.dataSource.data).toEqual([]);
    expect(component.partitionGraph).toEqual([]);
    expect(component.partitionGraphTotalSize).toBe(0);
    expect(component.viewBox).toBe('0 0 0 0');
  });

  it('should build table and partition graph from selected scheme data', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionViewComponent);
    const component = fixture.componentInstance;
    const selectedSchemeData: Esp8266PartitionEntry[] = [
      { name: 'boot', offset: '0x1000', size: '0x2000' },
      { name: 'app', offset: '0x3000', size: '0x4000' }
    ];

    fixture.componentRef.setInput('selectedSchemeData', selectedSchemeData);
    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data[0]).toEqual({
      color: '#4caf50',
      name: 'boot',
      offset_hex: '0x1000',
      offset_dec: 4096,
      size_hex: '0x2000',
      size_dec: 8192,
      offset_size: 12288
    });
    expect(component.partitionGraph).toEqual([
      { color: '#4caf50', offset: 4, size: 8 },
      { color: '#2196f3', offset: 12, size: 16 }
    ]);
    expect(component.partitionGraphTotalSize).toBe(28);
    expect(component.viewBox).toBe('0 0 28 100');
  });
});
