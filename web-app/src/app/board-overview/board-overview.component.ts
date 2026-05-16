import { Component, inject, input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Sort, MatSortModule} from '@angular/material/sort';
import coreList_input from '../../../data/core_list.json';
import esp32_mcu_bootloader_addr_input from '../../../data/esp32_mcu_bootloader_addr.json';

import { Esp32DataService } from '../esp32-data.service';

@Component({
  selector: 'app-board-overview',
  imports: [MatTableModule, MatInputModule, MatFormFieldModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, RouterLink],
  templateUrl: './board-overview.component.html',
  styleUrl: './board-overview.component.css'
})

export class BoardOverviewComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  checked = false;
  coreName = input.required<string>();
  dataSource = input.required<BoardInfo[]>();
  //dataSource: BoardInfo[] = [];
  esp32DataService: Esp32DataService = new Esp32DataService();
  partitionsData = this.esp32DataService.partitionsData;
  boardNamesPartitions: string[] = Object.keys(this.partitionsData);
  totalBoardCount = 0;
  filteredBoardCount = 0;
  displayedColumns: string[] = ['name', 'board','variant', 'led', 'mcu', 'flash_size'];
  sortedData: MatTableDataSource<BoardInfo> = new MatTableDataSource<BoardInfo>([]);
  filterValue = '';
  coreList: Core[] = (coreList_input as Core[]);
  esp32McuBootloaderAddr: Record<string, string> = esp32_mcu_bootloader_addr_input as Record<string, string>;
  coreVersion = '';
  isMcuOverlayOpen = false;
  mcuSummary: McuSummaryEntry[] = [];

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.applyFiltersFromQueryParams(queryParams);
    });

    this.totalBoardCount = this.dataSource().length;
    this.filteredBoardCount = this.dataSource().length;
    this.sortedData = new MatTableDataSource<BoardInfo>(this.dataSource());
    this.coreList.forEach((core) => {
      if (core.core_name === this.coreName()) {
        this.coreVersion = core.installed_version;
      }
    });

    this.updateTable();
  }

  is_generate_partition_link(boardName: string): boolean {
    if (this.boardNamesPartitions.includes(boardName) && this.coreName() === 'esp32') {
      return true;
    }
    return false;
  }

  get_partition_route(boardName: string): string {
    return `/esp32-partitions/${boardName}/${this.esp32DataService.getDefaultScheme(boardName)}`;
  }

  get_flash_size_element(flash_sizes: string[]): string {
    if (flash_sizes.length === 0) {
      return 'N/A';
    }
    else {
      return flash_sizes.join(',');
    }
  }

  get_pins_arduino_link(variant: string): string {
    let pins_arduino_url = '';
    if (this.coreName() === 'esp8266') {
      pins_arduino_url = `https://github.com/esp8266/Arduino/blob/${this.coreVersion}/variants/${variant}/pins_arduino.h`;
    }
    else if (this.coreName() === 'esp32') {
      pins_arduino_url = `https://github.com/espressif/arduino-esp32/blob/${this.coreVersion}/variants/${variant}/pins_arduino.h`;
    }
    return pins_arduino_url;
  }
  updateTable() {
    if (this.checked) {
      const ignoreNA: BoardInfo[] = [];
      this.dataSource().forEach((boardInfo) => {
        if (boardInfo.led_builtin !== 'N/A') {
          ignoreNA.push(boardInfo);
        }
      });
      this.sortedData = new MatTableDataSource<BoardInfo>(ignoreNA);
    }
    else {
      this.sortedData = new MatTableDataSource<BoardInfo>(this.dataSource());
    }
    
    this.sortedData.filter = this.filterValue.trim().toLowerCase();
    this.filteredBoardCount = this.sortedData.filteredData.length;
    this.updateMcuSummary(this.sortedData.filteredData);
  }

  applyIgnoreNA(event: MatCheckboxChange) {
    this.checked = event.checked;
    this.updateTable();
    this.updateFilterQueryParams();
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.updateTable();
    this.updateFilterQueryParams();
  }

  sortData(sort: Sort) {
    let data : BoardInfo[] = [];
    if (this.filterValue != '') {
      data = this.sortedData.filteredData.slice();
    }
    else {
      data = this.sortedData.data.slice();
    }

    this.sortedData = new MatTableDataSource<BoardInfo>(data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'board':
          return compare(a.board, b.board, isAsc);
        case 'variant':
          return compare(a.variant, b.variant, isAsc);
        case 'mcu':
          return compare(a.mcu, b.mcu, isAsc);
        case 'led':
          return compareLed(a.led_builtin, b.led_builtin, isAsc);
        case 'flash_size':
          return compareFlashSize(a.flash_size, b.flash_size, isAsc);
        default:
          return 0;
      }
    }));

    this.updateMcuSummary(this.sortedData.data);
  }

  private updateFilterQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.buildFilterQueryParams(),
      queryParamsHandling: 'merge'
    });
  }

  openMcuOverview() {
    this.isMcuOverlayOpen = true;
    this.updateFilterQueryParams();
  }

  closeMcuOverview() {
    this.isMcuOverlayOpen = false;
    this.updateFilterQueryParams();
  }

  private buildFilterQueryParams(): Params {
    return {
      filter: this.filterValue.trim() === '' ? null : this.filterValue.trim(),
      ignoreNaLed: this.checked ? 'true' : null,
      mcuOverview: this.isMcuOverlayOpen ? 'true' : null
    };
  }

  private applyFiltersFromQueryParams(queryParams: Params) {
    this.filterValue = this.parseFilterValue(queryParams['filter']);
    this.checked = this.parseBooleanQueryParam(queryParams['ignoreNaLed']);
    this.isMcuOverlayOpen = this.parseBooleanQueryParam(queryParams['mcuOverview']);
    this.updateTable();
  }

  private parseFilterValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private parseBooleanQueryParam(value: unknown): boolean {
    return value === 'true';
  }

  private updateMcuSummary(entries: BoardInfo[]) {
    const mcuCounts = new Map<string, number>();
    for (const entry of entries) {
      const mcu = entry.mcu?.trim() || 'N/A';
      if (mcu.toUpperCase() === 'N/A') {
        continue;
      }
      mcuCounts.set(mcu, (mcuCounts.get(mcu) || 0) + 1);
    }

    this.mcuSummary = Array.from(mcuCounts.entries())
      .map(([mcu, count]) => ({
        mcu,
        bootloader_addr: this.esp32McuBootloaderAddr[mcu] ?? 'N/A',
        count
      }))
      .sort((a, b) => a.mcu.localeCompare(b.mcu));
  }
}

export interface BoardInfo {
  name: string;
  board: string;
  variant: string;
  led_builtin: string;
  mcu: string;
  flash_size: string[];
}

export interface Core {
  core: string;
  installed_version: string;
  latest_version: string;
  core_name: string;
}

interface McuSummaryEntry {
  mcu: string;
  bootloader_addr: string;
  count: number;
}

function compare(a: string, b: string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function compareLed(a: string, b: string, isAsc: boolean) {
  if (a === 'N/A')
  {
    a = '1000';
  }

  if (b === 'N/A')
  {
    b = '1000';
  }

  const aNum = parseInt(a as string);
  const bNum = parseInt(b as string);

  return (aNum < bNum ? -1 : 1) * (isAsc ? 1 : -1);
}

function get_flash_size_value(list_flash_sizes: string[], isAsc: boolean) {
  if (list_flash_sizes.length === 0) {
    return 0;
  }
  let flash_size = list_flash_sizes[0];
  if (list_flash_sizes.length > 1) {
    if (isAsc){
      flash_size = list_flash_sizes[0];
    }
    else{
      flash_size = list_flash_sizes[list_flash_sizes.length - 1];
    }
  }
  if (flash_size === '512KB') {
    return 0;
  }
  else
  {
    let num = parseInt(flash_size.slice(0, -2));
    if (Number.isNaN(num)) {
      num = 0;
    }
    return num;
  }
}

function compareFlashSize(a: string[], b: string[], isAsc: boolean) {
  const aNum = get_flash_size_value(a, isAsc);
  const bNum = get_flash_size_value(b, isAsc);
  return (aNum < bNum ? -1 : 1) * (isAsc ? 1 : -1);
}