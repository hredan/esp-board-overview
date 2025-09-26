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

  it('onBoardChange if default scheme is not found', () => {
    component.onBoardChange('um_bling');
    expect(component.selectedScheme).toEqual('default_8MB');
  });

  it('onBoardChange if default scheme is found', () => {
    component.onBoardChange('esp32c2');
    expect(component.selectedScheme).toEqual('minimal');
  });

  it('onBoardChange if schemes are undefined', () => {
    component.onBoardChange('S_ODI_Ultra');
    expect(component.selectedScheme).toEqual('default');
  });

  it('onSchemeChange if scheme is found', () => {
    component.selectedBoard = 'esp32c2';
    component.onSchemeChange('minimal');
    expect(component.selectedSchemeData).toEqual(component.defaultSchemes['minimal']);
  });

  it('onSchemeChange if scheme is not found', () => {
    component.selectedBoard = 'esp32c2';
    component.onSchemeChange('non_existing_scheme');
    expect(component.selectedSchemeData).toEqual([]);
  });
});
