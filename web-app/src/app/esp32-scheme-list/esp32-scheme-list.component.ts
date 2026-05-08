import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Esp32DataService, PartitionEntry } from '../esp32-data.service';
import { Esp32PartitionViewComponent } from '../esp32-partition-view/esp32-partition-view.component';

interface SchemeMemoryEntry {
  name: string;
  isSpiffs: boolean;
  isOta: boolean;
  isCoredump: boolean;
  memorySizeMb: number | null;
}

@Component({
  selector: 'app-esp32-scheme-list',
  imports: [CommonModule, MatTableModule, MatSortModule, MatFormFieldModule, MatSelectModule, MatOptionModule, Esp32PartitionViewComponent],
  templateUrl: './esp32-scheme-list.component.html',
  styleUrl: './esp32-scheme-list.component.css'
})
export class Esp32SchemeListComponent implements OnInit {
  private esp32DataService = inject(Esp32DataService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  displayedColumns: string[] = ['name', 'isSpiffs', 'isOta', 'isCoredump', 'memorySizeMb'];
  allEntries: SchemeMemoryEntry[] = [];
  sortedData: MatTableDataSource<SchemeMemoryEntry> = new MatTableDataSource<SchemeMemoryEntry>([]);
  memorySizeFilterValues: number[] = [];
  selectedMemorySizeFilter = 'all';
  selectedSpiffsFilter = 'all';
  selectedOtaFilter = 'all';
  selectedCoredumpFilter = 'all';
  selectedSchemeName = '';
  selectedSchemeData: PartitionEntry[] = [];
  isOverlayOpen = false;

  ngOnInit() {
    this.allEntries = Object.keys(this.esp32DataService.defaultSchemes)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        isSpiffs: this.esp32DataService.isSpiffsScheme(name),
        isOta: this.esp32DataService.isOtaScheme(name),
        isCoredump: this.esp32DataService.isCoredumpScheme(name),
        memorySizeMb: this.esp32DataService.getMemorySizeOfScheme(name)
      }));

    this.memorySizeFilterValues = Array.from(
      new Set(this.allEntries
        .map((entry) => entry.memorySizeMb)
        .filter((size): size is number => size !== null))
    ).sort((a, b) => a - b);

    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.applyFiltersFromQueryParams(queryParams);
    });

    this.activatedRoute.params.subscribe((params) => {
      const schemeId = params['schemeId'];

      if (!schemeId) {
        this.closeOverlayState();
        return;
      }

      const didOpen = this.openOverlayForScheme(schemeId);
      if (!didOpen) {
        this.router.navigate(['/page-not-found']);
      }
    });
  }

  private getFilteredEntries(): SchemeMemoryEntry[] {
    return this.allEntries.filter((entry) => {
      const spiffsMatch = this.selectedSpiffsFilter === 'all'
        || (this.selectedSpiffsFilter === 'yes' && entry.isSpiffs)
        || (this.selectedSpiffsFilter === 'no' && !entry.isSpiffs);
      const otaMatch = this.selectedOtaFilter === 'all'
        || (this.selectedOtaFilter === 'yes' && entry.isOta)
        || (this.selectedOtaFilter === 'no' && !entry.isOta);
      const coredumpMatch = this.selectedCoredumpFilter === 'all'
        || (this.selectedCoredumpFilter === 'yes' && entry.isCoredump)
        || (this.selectedCoredumpFilter === 'no' && !entry.isCoredump);
      const sizeMatch = this.selectedMemorySizeFilter === 'all'
        || entry.memorySizeMb === Number(this.selectedMemorySizeFilter);
      return spiffsMatch && otaMatch && coredumpMatch && sizeMatch;
    });
  }

  applySpiffsFilter(value: string) {
    this.selectedSpiffsFilter = value;
    this.updateFilterQueryParams();
  }

  applyOtaFilter(value: string) {
    this.selectedOtaFilter = value;
    this.updateFilterQueryParams();
  }

  applyCoredumpFilter(value: string) {
    this.selectedCoredumpFilter = value;
    this.updateFilterQueryParams();
  }

  applyMemorySizeFilter(value: string) {
    this.selectedMemorySizeFilter = value;
    this.updateFilterQueryParams();
  }

  sortData(sort: Sort) {
    const data = this.sortedData.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = new MatTableDataSource<SchemeMemoryEntry>(data.sort((a, b) => a.name.localeCompare(b.name)));
      return;
    }

    const isAsc = sort.direction === 'asc';
    this.sortedData = new MatTableDataSource<SchemeMemoryEntry>(data.sort((a, b) => {
      switch (sort.active) {
        case 'name':
          return compareText(a.name, b.name, isAsc);
        case 'isSpiffs':
          return compareBoolean(a.isSpiffs, b.isSpiffs, isAsc);
        case 'isOta':
          return compareBoolean(a.isOta, b.isOta, isAsc);
        case 'isCoredump':
          return compareBoolean(a.isCoredump, b.isCoredump, isAsc);
        case 'memorySizeMb':
          return compareNullableNumber(a.memorySizeMb, b.memorySizeMb, isAsc);
        default:
          return 0;
      }
    }));
  }

  onRowSelect(entry: SchemeMemoryEntry) {
    this.router.navigate(['/esp32-schemes', entry.name], { queryParams: this.buildFilterQueryParams() });
  }

  onBackToPartitions() {
    this.router.navigate(['/esp32-partitions']);
  }

  closeOverlay() {
    this.router.navigate(['/esp32-schemes'], { queryParams: this.buildFilterQueryParams() });
  }

  private openOverlayForScheme(schemeId: string): boolean {
    const schemeData = this.esp32DataService.defaultSchemes[schemeId];
    if (!schemeData) {
      return false;
    }

    this.selectedSchemeName = schemeId;
    this.selectedSchemeData = schemeData;
    this.isOverlayOpen = true;
    return true;
  }

  private closeOverlayState() {
    this.isOverlayOpen = false;
    this.selectedSchemeName = '';
    this.selectedSchemeData = [];
  }

  private updateFilterQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.buildFilterQueryParams(),
      queryParamsHandling: 'merge'
    });
  }

  private buildFilterQueryParams(): Params {
    return {
      memory: this.selectedMemorySizeFilter === 'all' ? null : this.selectedMemorySizeFilter,
      spiffs: this.selectedSpiffsFilter === 'all' ? null : this.selectedSpiffsFilter,
      ota: this.selectedOtaFilter === 'all' ? null : this.selectedOtaFilter,
      coredump: this.selectedCoredumpFilter === 'all' ? null : this.selectedCoredumpFilter
    };
  }

  private applyFiltersFromQueryParams(queryParams: Params) {
    this.selectedSpiffsFilter = this.parseBooleanLikeFilter(queryParams['spiffs']);
    this.selectedOtaFilter = this.parseBooleanLikeFilter(queryParams['ota']);
    this.selectedCoredumpFilter = this.parseBooleanLikeFilter(queryParams['coredump']);
    this.selectedMemorySizeFilter = this.parseMemoryFilter(queryParams['memory']);
    this.sortedData = new MatTableDataSource<SchemeMemoryEntry>(this.getFilteredEntries());
  }

  private parseBooleanLikeFilter(value: unknown): 'all' | 'yes' | 'no' {
    if (value === 'yes' || value === 'no' || value === 'all') {
      return value;
    }
    return 'all';
  }

  private parseMemoryFilter(value: unknown): string {
    if (typeof value !== 'string' || value === 'all') {
      return 'all';
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || !this.memorySizeFilterValues.includes(parsed)) {
      return 'all';
    }

    return value;
  }
}

function compareText(a: string, b: string, isAsc: boolean): number {
  return a.localeCompare(b) * (isAsc ? 1 : -1);
}

function compareNullableNumber(a: number | null, b: number | null, isAsc: boolean): number {
  if (a === null && b === null) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}

function compareBoolean(a: boolean, b: boolean, isAsc: boolean): number {
  const aValue = a ? 1 : 0;
  const bValue = b ? 1 : 0;
  return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (isAsc ? 1 : -1);
}
