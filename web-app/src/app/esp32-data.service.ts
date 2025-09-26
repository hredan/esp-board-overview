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
}

interface BoardSchemeInfo {
  full_name: string;
  build: string;
}

type BoardPartitionScheme = Record<string, BoardSchemeInfo>;


interface BoardPartitions {
  default: string;
  schemes?: BoardPartitionScheme | undefined;
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