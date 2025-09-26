import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { Esp32BoardOverviewComponent } from './esp32-board-overview.component';
import { BoardOverviewComponent } from '../board-overview/board-overview.component';
import { By } from '@angular/platform-browser';

describe('Esp32BoardOverviewComponent', () => {
  let component: Esp32BoardOverviewComponent;
  let fixture: ComponentFixture<Esp32BoardOverviewComponent>;
  let boardOverview: BoardOverviewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Esp32BoardOverviewComponent, MockComponent(BoardOverviewComponent)],
      imports: [Esp32BoardOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Esp32BoardOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const boardOverviewComponent = fixture.debugElement.query(By.directive(BoardOverviewComponent));
    boardOverview = boardOverviewComponent.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rendered board overview component', () => {
    expect(boardOverview).toBeTruthy();
  });

  it('should set the board type to ESP32', () => {
    expect(boardOverview.coreName).toEqual('esp32');
  });
});
