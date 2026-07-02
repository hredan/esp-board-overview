import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Esp8266PartitionOverviewComponent } from './esp8266-partition-overview.component';
import { Esp8266DataService } from '../esp8266-data.service';

const partitionData = {
  d1: {
    default: '4m1m',
    schemes: {
      '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' },
      '4m2m': { full_name: '4M (2M FS)', flash_id: 'eagle.flash.4m2m.ld' }
    }
  },
  nodemcu: {
    default: 'nodedef',
    schemes: {
      nodedef: { full_name: 'Node Default', flash_id: 'eagle.flash.nodedef.ld' }
    }
  }
};

const schemeEntries = {
  'd1-4m1m': [{ name: 'boot', offset: '0x1000', size: '0x2000' }],
  'd1-4m2m': [{ name: 'app', offset: '0x3000', size: '0x4000' }],
  'nodemcu-nodedef': [{ name: 'node', offset: '0x5000', size: '0x1000' }]
};

describe('Esp8266PartitionOverviewComponent', () => {
  let params$: Subject<Params>;
  let navigateMock: jest.Mock;

  const mockDataService = {
    partitionsData: partitionData,
    getDefaultScheme: jest.fn((board: string) => partitionData[board as keyof typeof partitionData]?.default ?? ''),
    getSchemeEntries: jest.fn((board: string, scheme: string) => {
      const key = `${board}-${scheme}` as keyof typeof schemeEntries;
      return schemeEntries[key] ?? [];
    }),
    getMemorySizeOfScheme: jest.fn(() => 4),
    getBoardName: jest.fn((board: string) => board.toUpperCase())
  };

  beforeEach(async () => {
    params$ = new Subject<Params>();
    navigateMock = jest.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [Esp8266PartitionOverviewComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: params$.asObservable()
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateMock
          }
        },
        {
          provide: Esp8266DataService,
          useValue: mockDataService
        }
      ]
    }).compileComponents();

    jest.clearAllMocks();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should navigate to first board default when no route board is provided', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;

    params$.next({});
    fixture.detectChanges();

    expect(component.selectedBoard).toBe('d1');
    expect(component.selectedScheme).toBe('4m1m');
    expect(component.selectedSchemeData).toEqual([{ name: 'boot', offset: '0x1000', size: '0x2000' }]);
  });

  it('should use route board and default scheme when schemeId is missing', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;

    params$.next({ boardId: 'nodemcu' });
    fixture.detectChanges();

    expect(component.selectedBoard).toBe('nodemcu');
    expect(component.selectedScheme).toBe('nodedef');
    expect(component.selectedSchemeName).toBe('Node Default');
  });

  it('should use explicit route schemeId when provided', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;

    params$.next({ boardId: 'd1', schemeId: '4m2m' });
    fixture.detectChanges();

    expect(component.selectedBoard).toBe('d1');
    expect(component.selectedScheme).toBe('4m2m');
    expect(component.selectedSchemeName).toBe('4M (2M FS)');
    expect(component.selectedSchemeData).toEqual([{ name: 'app', offset: '0x3000', size: '0x4000' }]);
  });

  it('should navigate to page-not-found for invalid board route param', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);

    params$.next({ boardId: 'invalid', schemeId: 'x' });
    fixture.detectChanges();

    expect(navigateMock).toHaveBeenCalledWith(['/page-not-found']);
  });

  it('updatePage should fallback to first available scheme for unknown scheme id', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;

    component.updatePage('d1', 'unknown');

    expect(component.selectedBoard).toBe('d1');
    expect(component.selectedScheme).toBe('4m1m');
    expect(component.selectedSchemeData).toEqual([{ name: 'boot', offset: '0x1000', size: '0x2000' }]);
  });

  it('updatePage should fallback to empty scheme and empty scheme name for unknown board', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;

    component.updatePage('unknown-board', 'unknown-scheme');

    expect(component.selectedScheme).toBe('');
    expect(component.selectedSchemeData).toEqual([]);
    expect(component.selectedSchemeName).toBe('');
  });

  it('onBoardChange and onSchemeChange should navigate to expected routes', () => {
    const fixture = TestBed.createComponent(Esp8266PartitionOverviewComponent);
    const component = fixture.componentInstance;

    component.onBoardChange('nodemcu');
    expect(navigateMock).toHaveBeenCalledWith(['/esp8266-partitions/nodemcu/nodedef']);

    component.selectedBoard = 'd1';
    component.onSchemeChange('4m2m');
    expect(navigateMock).toHaveBeenCalledWith(['/esp8266-partitions/d1/4m2m']);
  });
});
