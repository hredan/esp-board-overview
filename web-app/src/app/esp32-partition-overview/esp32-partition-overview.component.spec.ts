import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Esp32PartitionOverviewComponent } from './esp32-partition-overview.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('Esp32PartitionOverviewComponent', () => {
  let component: Esp32PartitionOverviewComponent;
  let fixture: ComponentFixture<Esp32PartitionOverviewComponent>;
  let router: Router;
  
  // is disabled for the test to allow emitting new params values, empty list of params and only one of the params
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  const paramsSubject = new BehaviorSubject<{[key: string]: string;}>({ boardId: 'esp32c2', schemeId: 'minimal' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp32PartitionOverviewComponent, RouterModule.forRoot([])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Esp32PartitionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use first board and scheme if params are empty', () => {
    const newParams = {};
    paramsSubject.next(newParams);
    fixture.detectChanges();
    expect(component.selectedBoard).toEqual('esp32c2');
    expect(component.selectedScheme).toEqual('minimal');
  });

  it('should use board and default scheme if params are provided but scheme is undefined', () => {
    const newParams = {boardId: 'um_tinys3'};
    paramsSubject.next(newParams);
    fixture.detectChanges();
    expect(component.selectedBoard).toEqual('um_tinys3');
    expect(component.selectedScheme).toEqual('default_8MB');
  });

  it('onBoardChange if default scheme is not found', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onBoardChange('um_bling');
    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions/um_bling/default_8MB']);
  });

  it('onBoardChange if default scheme is found', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onBoardChange('esp32c2');
    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions/esp32c2/minimal']);
  });

  it('onBoardChange if schemes are undefined', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onBoardChange('S_ODI_Ultra');
    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions/S_ODI_Ultra/default']);
  });

  it('onSchemeChange if scheme is found', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.selectedBoard = 'esp32c2';
    component.onSchemeChange('minimal');
    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions/esp32c2/minimal']);
  });

  it('should navigate to page not found for unknown board', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const newParams = {boardId: 'unknown_board'};
    paramsSubject.next(newParams);
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/page-not-found']);
  });
});
