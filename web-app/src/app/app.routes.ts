import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component'
import { EspCoreOverviewComponent } from './esp-core-overview/esp-core-overview.component';
import { Esp8266BoardOverviewComponent } from './esp8266-board-overview/esp8266-board-overview.component';
import { Esp32BoardOverviewComponent } from './esp32-board-overview/esp32-board-overview.component';
import { Esp32PartitionOverviewComponent } from './esp32-partition-overview/esp32-partition-overview.component';

export const routes: Routes = [
    { 
        path: '',
        component: EspCoreOverviewComponent,
        title: 'ESP Board Overview'
    },
    {
        path: 'esp8266',
        component: Esp8266BoardOverviewComponent,
        title: 'ESP8266 Board Overview'
    },
    {
        path: 'esp32',
        component: Esp32BoardOverviewComponent,
        title: 'ESP32 Board Overview'
    },
    {
        path: 'esp32-partitions',
        component: Esp32PartitionOverviewComponent,
        title: 'ESP32 Partitions Overview'
    },
    {
        path: '**',
        component: PageNotFoundComponent
    },
];