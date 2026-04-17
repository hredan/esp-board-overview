import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Esp32PartitionOverviewComponent } from './esp32-partition-overview.component';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 

describe('Esp32PartitionOverviewComponent', () => {
  let component: Esp32PartitionOverviewComponent;
  let fixture: ComponentFixture<Esp32PartitionOverviewComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp32PartitionOverviewComponent, RouterModule.forRoot([])
      ],
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

  it('onBoardChange if default scheme is not found', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onBoardChange('um_bling');
    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions/um_bling/default_8MB']);
  });

  it('onBoardChange if default scheme is found', () => {
    component.onBoardChange('esp32c2');
    expect(component.selectedScheme).toEqual('minimal');
  });

  it('onBoardChange if schemes are undefined', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onBoardChange('S_ODI_Ultra');
    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions/S_ODI_Ultra/default']);
  });

  it('onSchemeChange if scheme is found', () => {
    component.selectedBoard = 'esp32c2';
    component.onSchemeChange('minimal');
    expect(component.selectedSchemeData).toEqual(component.defaultSchemes['minimal']);
  });
});
