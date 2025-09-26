import { Component } from '@angular/core';
import { BoardOverviewComponent, BoardInfo } from '../board-overview/board-overview.component';
import { Esp32DataService } from '../esp32-data.service';
@Component({
  selector: 'app-esp32-board-overview',
  imports: [BoardOverviewComponent],
  templateUrl: './esp32-board-overview.component.html',
  styleUrl: './esp32-board-overview.component.css'
})
export class Esp32BoardOverviewComponent {
  esp32DataService = new Esp32DataService();
  boardsData: BoardInfo[] = this.esp32DataService.boardsData;
}
