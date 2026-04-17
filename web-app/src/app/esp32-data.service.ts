import { Injectable } from '@angular/core';

import esp32_partitions from '../../data/esp32_partitions.json';
import esp32_schemes from '../../data/esp32_partition_schemes.json';
import board_data from '../../data/esp32.json';
import { BoardInfo } from './board-overview/board-overview.component';

@Injectable({
  providedIn: 'root'
})
export class Esp32DataService {
  partitionsData: BoardPartitionsInfo = esp32_partitions as BoardPartitionsInfo;
  defaultSchemes: DefaultSchemes = esp32_schemes as DefaultSchemes;
  boardsData: BoardInfo[] = board_data as BoardInfo[];

  getBoardName(board: string): string {
    const boardInfo = this.boardsData.find(b => b.board === board);
    return boardInfo ? boardInfo.name : board;
  }

  getMemorySize(board: string): string {
    const boardInfo = this.boardsData.find(b => b.board === board);
    const flash_size_list = boardInfo ? boardInfo.flash_size : [];
    if (flash_size_list.length === 0) {
      return 'N/A';
    }
    else {
      return flash_size_list.join(',');
    }
  }

  getDefaultScheme(board: string): string {
    const schemes = Object.keys(this.partitionsData[board].schemes);
    const defaultScheme = this.partitionsData[board].default;
    if (schemes.length === 0) {
      return defaultScheme
    }
    else if (schemes.includes(defaultScheme)) {
      return defaultScheme;
    }
    else {
      return schemes[0];
    }
  }
}

interface BoardSchemeInfo {
  full_name: string;
  build: string;
}

type BoardPartitionScheme = Record<string, BoardSchemeInfo>;


interface BoardPartitions {
  default: string;
  schemes: BoardPartitionScheme;
}

type BoardPartitionsInfo = Record<string, BoardPartitions>;

export interface PartitionEntry {
  name: string;
  type: string;
  subtype: string;
  offset: string;
  size: string;
}

type DefaultSchemes = Record<string, PartitionEntry[]>;