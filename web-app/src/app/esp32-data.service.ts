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
    return boardInfo ? boardInfo.name : "N/A";
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

  getPartitionRoutes() {
    // Implement route generation logic here
    const boards = Object.keys(this.partitionsData);
    const routes = [];
    for (const board of boards) {
      const schemes = Object.keys(this.partitionsData[board].schemes);
      if (schemes.length === 0) {
        routes.push({ boardId: board, schemeId: this.partitionsData[board].default });
        continue;
      }
      else {
        for (const scheme of schemes) {
          routes.push({ boardId: board, schemeId: scheme });
        }
      }
    }
    return routes;

  }

  getSchemeRoutes() {
    return Object.keys(this.defaultSchemes).map((schemeId) => ({ schemeId }));
  }

  getMemorySizeOfScheme(defaultScheme: string): number | null {
    const entries = this.defaultSchemes[defaultScheme];
    if (!entries || entries.length === 0) {
      return null;
    }

    const lastEntry = entries[entries.length - 1];
    const offset = this.parsePartitionValue(lastEntry.offset);
    const size = this.parsePartitionValue(lastEntry.size);

    if (offset === null || size === null) {
      return null;
    }

    return (offset + size) / (1024 * 1024);
  }

  private parsePartitionValue(value: string): number | null {
    const normalized = value.trim();
    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber)) {
      return asNumber;
    }

    const lower = normalized.toLowerCase();
    if (lower.endsWith('k')) {
      const kValue = Number(lower.slice(0, -1));
      return Number.isNaN(kValue) ? null : kValue * 1024;
    }

    if (lower.endsWith('m')) {
      const mValue = Number(lower.slice(0, -1));
      return Number.isNaN(mValue) ? null : mValue * 1024 * 1024;
    }

    return null;
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