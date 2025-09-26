import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { EspCoreOverviewComponent } from "./esp-core-overview/esp-core-overview.component";
import { Esp8266BoardOverviewComponent } from "./esp8266-board-overview/esp8266-board-overview.component";
import { Esp32BoardOverviewComponent } from "./esp32-board-overview/esp32-board-overview.component";
import { Esp32PartitionOverviewComponent } from "./esp32-partition-overview/esp32-partition-overview.component";

describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
      
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'ESP Board Overview' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ESP Board Overview');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('ESP Board Overview');
  });
  it('should initialize links and activeLink', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.links).toEqual(['Info', 'ESP8266', 'ESP32', 'ESP32-Partitions']);
    expect(app.activeLink).toEqual('Info');
  });
  it('should update activeLink and title on route activation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onActivate(new EspCoreOverviewComponent());
    expect(app.activeLink).toEqual('Info');
    expect(app.title).toEqual('ESP Board Overview');

    app.onActivate(new Esp8266BoardOverviewComponent());
    expect(app.activeLink).toEqual('ESP8266');
    expect(app.title).toEqual('ESP8266 Boards Arduino IDE');

    app.onActivate(new Esp32BoardOverviewComponent());
    expect(app.activeLink).toEqual('ESP32');
    expect(app.title).toEqual('ESP32 Boards Arduino IDE');

    app.onActivate(new Esp32PartitionOverviewComponent());
    expect(app.activeLink).toEqual('ESP32-Partitions');
    expect(app.title).toEqual('ESP32 Partitions Overview');
  });
});
