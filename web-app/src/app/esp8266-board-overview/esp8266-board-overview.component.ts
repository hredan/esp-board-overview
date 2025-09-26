import { Component } from '@angular/core';
import { BoardOverviewComponent, BoardInfo } from '../board-overview/board-overview.component';
import { Esp8266DataService } from '../esp8266-data.service';

@Component({
  selector: 'app-esp8266-board-overview',
  imports: [BoardOverviewComponent],
  templateUrl: './esp8266-board-overview.component.html',
  styleUrl: './esp8266-board-overview.component.css'
})
export class Esp8266BoardOverviewComponent {
  dataServiceEsp8266 = new Esp8266DataService();
  boardsData: BoardInfo[] = this.dataServiceEsp8266.boardsData;
}
