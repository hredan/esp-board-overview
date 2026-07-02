import { Injectable } from '@angular/core';
import board_data from '../../data/esp8266.json';
import esp8266_partitions from '../../data/esp8266_partitions.json';
import esp8266_partition_schemes from '../../data/esp8266_partition_schemes.json';
import { BoardInfo } from './board-overview/board-overview.component';

export interface Esp8266PartitionEntry {
  name: string;
  offset: string;
  size: string;
}

interface Esp8266SchemeInfo {
  full_name: string;
  flash_id: string;
}

interface Esp8266BoardPartitions {
  default: string;
  schemes: Record<string, Esp8266SchemeInfo>;
}

export type Esp8266PartitionsData = Record<string, Esp8266BoardPartitions>;
export type Esp8266SchemesData = Record<string, Esp8266PartitionEntry[]>;

@Injectable({
  providedIn: 'root'
})
export class Esp8266DataService {
  boardsData: BoardInfo[] = board_data as BoardInfo[];
  partitionsData: Esp8266PartitionsData = esp8266_partitions as Esp8266PartitionsData;
  schemesData: Esp8266SchemesData = esp8266_partition_schemes as Esp8266SchemesData;

  getBoardName(board: string): string {
    const boardInfo = this.boardsData.find(b => b.board === board);
    return boardInfo ? boardInfo.name : 'N/A';
  }

  getDefaultScheme(board: string): string {
    const boardPartitions = this.partitionsData[board];
    if (!boardPartitions) return '';
    const schemes = Object.keys(boardPartitions.schemes);
    const def = boardPartitions.default;
    return schemes.includes(def) ? def : (schemes[0] ?? def);
  }

  getSchemeEntries(board: string, schemeId: string): Esp8266PartitionEntry[] {
    const flashId = this.partitionsData[board]?.schemes?.[schemeId]?.flash_id;
    if (!flashId) return [];
    // strip .ld extension to get the key in partition_schemes
    const schemeKey = flashId.replace(/\.ld$/, '');
    return this.schemesData[schemeKey] ?? [];
  }

  getMemorySizeOfScheme(board: string, schemeId: string): number | null {
    const entries = this.getSchemeEntries(board, schemeId);
    return this.calculateMemorySize(entries);
  }

  getSchemeRoutes(): { schemeId: string }[] {
    return Object.keys(this.schemesData).map((schemeId) => ({ schemeId }));
  }

  getSchemeEntriesById(schemeId: string): Esp8266PartitionEntry[] {
    return this.schemesData[schemeId] ?? [];
  }

  getMemorySizeOfSchemeById(schemeId: string): number | null {
    return this.calculateMemorySize(this.getSchemeEntriesById(schemeId));
  }

  isSpiffsScheme(schemeId: string): boolean {
    const entries = this.getSchemeEntriesById(schemeId);
    if (!entries || entries.length === 0) {
      return false;
    }

    return entries.some((entry) => entry.name.trim().toLowerCase() === 'spiffs');
  }

  getPartitionRoutes(): { boardId: string; schemeId: string }[] {
    const routes: { boardId: string; schemeId: string }[] = [];
    for (const board of Object.keys(this.partitionsData)) {
      for (const scheme of Object.keys(this.partitionsData[board].schemes)) {
        routes.push({ boardId: board, schemeId: scheme });
      }
    }
    return routes;
  }

  private parsePartitionValue(value: string): number | null {
    const normalized = value.trim();
    const asNumber = Number(normalized);
    return Number.isNaN(asNumber) ? null : asNumber;
  }

  private calculateMemorySize(entries: Esp8266PartitionEntry[]): number | null {
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
}
