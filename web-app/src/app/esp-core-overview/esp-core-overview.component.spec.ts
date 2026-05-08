import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EspCoreOverviewComponent } from './esp-core-overview.component';

describe('EspCoreOverviewComponent', () => {
  let component: EspCoreOverviewComponent;
  let fixture: ComponentFixture<EspCoreOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspCoreOverviewComponent, RouterModule.forRoot([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspCoreOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log an error when core list format is invalid', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    component.coreList = [
      {
        core_name: 'esp32',
        core: 'espressif:esp32',
        installed_version: '3.3.8',
        latest_version: '3.3.8',
        link: ''
      }
    ];

    component.ngOnInit();

    expect(logSpy).toHaveBeenCalledWith('Error: core_list.json is not in the correct format');
    logSpy.mockRestore();
  });
});
