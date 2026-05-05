import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Esp32DataService, PartitionEntry } from '../esp32-data.service';
import { Esp32PartitionViewComponent } from '../esp32-partition-view/esp32-partition-view.component';

interface SchemeMemoryEntry {
  name: string;
  isSpiffs: boolean;
  memorySizeMb: number | null;
}

@Component({
  selector: 'app-esp32-scheme-list',
  imports: [CommonModule, MatTableModule, MatSortModule, MatFormFieldModule, MatSelectModule, MatOptionModule, Esp32PartitionViewComponent, RouterLink],
  templateUrl: './esp32-scheme-list.component.html',
  styleUrl: './esp32-scheme-list.component.css'
})
export class Esp32SchemeListComponent implements OnInit {
  private esp32DataService = inject(Esp32DataService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  displayedColumns: string[] = ['name', 'isSpiffs', 'memorySizeMb'];
  allEntries: SchemeMemoryEntry[] = [];
  sortedData: MatTableDataSource<SchemeMemoryEntry> = new MatTableDataSource<SchemeMemoryEntry>([]);
  memorySizeFilterValues: number[] = [];
  selectedMemorySizeFilter = 'all';
  selectedSpiffsFilter = 'all';
  selectedSchemeName = '';
  selectedSchemeData: PartitionEntry[] = [];
  isOverlayOpen = false;

  ngOnInit() {
    this.allEntries = Object.keys(this.esp32DataService.defaultSchemes)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        isSpiffs: this.esp32DataService.isSpiffsScheme(name),
        memorySizeMb: this.esp32DataService.getMemorySizeOfScheme(name)
      }));

    this.memorySizeFilterValues = Array.from(
      new Set(this.allEntries
        .map((entry) => entry.memorySizeMb)
        .filter((size): size is number => size !== null))
    ).sort((a, b) => a - b);

    this.sortedData = new MatTableDataSource<SchemeMemoryEntry>(this.allEntries);

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
    this.sortedData = new MatTableDataSource<SchemeMemoryEntry>(this.getFilteredEntries());
  }

  applyMemorySizeFilter(value: string) {
    this.selectedMemorySizeFilter = value;
    this.sortedData = new MatTableDataSource<SchemeMemoryEntry>(this.getFilteredEntries());
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
        case 'memorySizeMb':
          return compareNullableNumber(a.memorySizeMb, b.memorySizeMb, isAsc);
        default:
          return 0;
      }
    }));
  }

  onRowSelect(entry: SchemeMemoryEntry) {
    this.router.navigate(['/esp32-schemes', entry.name]);
  }

  closeOverlay() {
    this.router.navigate(['/esp32-schemes']);
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
