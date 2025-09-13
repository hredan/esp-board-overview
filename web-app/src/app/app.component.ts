import { Component } from '@angular/core';
import { RouterOutlet, RouterLink} from '@angular/router';
//import { ChildrenOutletContexts, ActivatedRoute } from '@angular/router';
// import { AppRoutingModule } from './app.routes';
import { MatTabsModule } from '@angular/material/tabs';
import { EspCoreOverviewComponent } from "./esp-core-overview/esp-core-overview.component";
import { Esp8266BoardOverviewComponent } from "./esp8266-board-overview/esp8266-board-overview.component";
import { Esp32BoardOverviewComponent } from "./esp32-board-overview/esp32-board-overview.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatTabsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'ESP Board Overview';
  links = ['Info', 'ESP8266', 'ESP32', "ESP32-Partitions"];
  activeLink = this.links[0];

  onActivate(event: object) {
    // This method can be used to handle any actions when a route is activated
    //console.log('Activated route:', event);
    if (event instanceof EspCoreOverviewComponent) {
      this.activeLink = 'Info';
      this.title = 'ESP Board Overview';
    } else if (event instanceof Esp8266BoardOverviewComponent) {
      this.activeLink = 'ESP8266';
      this.title = 'ESP8266 Boards Arduino IDE';
    }
    else if (event instanceof Esp32BoardOverviewComponent) {
      this.activeLink = 'ESP32';
      this.title = 'ESP32 Boards Arduino IDE';
    }
  }
}
