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
});
