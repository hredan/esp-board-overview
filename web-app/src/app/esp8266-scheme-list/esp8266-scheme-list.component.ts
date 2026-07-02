import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Esp8266DataService, Esp8266PartitionEntry } from '../esp8266-data.service';
import { Esp8266PartitionViewComponent } from '../esp8266-partition-view/esp8266-partition-view.component';

interface SchemeMemoryEntry {
  name: string;
  isSpiffs: boolean;
  memorySizeMb: number | null;
}

@Component({
  selector: 'app-esp8266-scheme-list',
  imports: [CommonModule, MatTableModule, MatSortModule, MatFormFieldModule, MatSelectModule, MatOptionModule, Esp8266PartitionViewComponent],
  templateUrl: './esp8266-scheme-list.component.html',
  styleUrl: './esp8266-scheme-list.component.css'
})
export class Esp8266SchemeListComponent implements OnInit {
  private esp8266DataService = inject(Esp8266DataService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  displayedColumns: string[] = ['name', 'isSpiffs', 'memorySizeMb'];
  allEntries: SchemeMemoryEntry[] = [];
  sortedData: MatTableDataSource<SchemeMemoryEntry> = new MatTableDataSource<SchemeMemoryEntry>([]);
  memorySizeFilterValues: number[] = [];
  selectedMemorySizeFilter = 'all';
  selectedSpiffsFilter = 'all';
  selectedSchemeName = '';
  selectedSchemeData: Esp8266PartitionEntry[] = [];
  isOverlayOpen = false;

  ngOnInit() {
    this.allEntries = Object.keys(this.esp8266DataService.schemesData)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        isSpiffs: this.esp8266DataService.isSpiffsScheme(name),
        memorySizeMb: this.esp8266DataService.getMemorySizeOfSchemeById(name)
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
      const sizeMatch = this.selectedMemorySizeFilter === 'all'
        || entry.memorySizeMb === Number(this.selectedMemorySizeFilter);
      return spiffsMatch && sizeMatch;
    });
  }

  applySpiffsFilter(value: string) {
    this.selectedSpiffsFilter = value;
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
        case 'memorySizeMb':
          return compareNullableNumber(a.memorySizeMb, b.memorySizeMb, isAsc);
        default:
          return 0;
      }
    }));
  }

  onRowSelect(entry: SchemeMemoryEntry) {
    this.router.navigate(['/esp8266-schemes', entry.name], { queryParams: this.buildFilterQueryParams() });
  }

  onBackToPartitions() {
    this.router.navigate(['/esp8266-partitions']);
  }

  closeOverlay() {
    this.router.navigate(['/esp8266-schemes'], { queryParams: this.buildFilterQueryParams() });
  }

  private openOverlayForScheme(schemeId: string): boolean {
    const schemeData = this.esp8266DataService.getSchemeEntriesById(schemeId);
    if (!schemeData || schemeData.length === 0) {
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
      spiffs: this.selectedSpiffsFilter === 'all' ? null : this.selectedSpiffsFilter
    };
  }

  private applyFiltersFromQueryParams(queryParams: Params) {
    this.selectedSpiffsFilter = this.parseBooleanLikeFilter(queryParams['spiffs']);
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
