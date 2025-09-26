import { Injectable } from '@angular/core';
import board_data from '../../data/esp8266.json';
import { BoardInfo } from './board-overview/board-overview.component';

@Injectable({
  providedIn: 'root'
})
export class Esp8266DataService {
  boardsData: BoardInfo[] = board_data as BoardInfo[];
}
