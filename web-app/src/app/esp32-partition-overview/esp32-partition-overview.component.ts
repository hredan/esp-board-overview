import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

import { Esp32DataService, PartitionEntry } from '../esp32-data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-esp32-partition-overview',
  imports: [MatSelectModule, MatFormFieldModule, MatOptionModule, MatTableModule, MatTableModule],
  templateUrl: './esp32-partition-overview.component.html',
  styleUrl: './esp32-partition-overview.component.css'
})
export class Esp32PartitionOverviewComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  esp32DataService: Esp32DataService = new Esp32DataService();
  partitionsData = this.esp32DataService.partitionsData;
  defaultSchemes = this.esp32DataService.defaultSchemes;
  boardNames: string[] = Object.keys(this.partitionsData);
  selectedBoard: string = this.boardNames[0];
  defaultScheme: string = this.partitionsData[this.selectedBoard].default;

  schemes: string[] = Object.keys(this.partitionsData[this.selectedBoard].schemes || {});
  selectedScheme: string = this.defaultScheme;

  selectedSchemeData: PartitionEntry[] = this.defaultSchemes[this.selectedScheme] || [];
  dataSource = new MatTableDataSource<PartitionEntryExtended>([]);

  partitionGraph: Partition[] = [];
  partitionGraphTotalSize = 0;
  viewBox = '0 0 0 0';

  displayedColumns: string[] = ['color','name', 'type','subtype', 'offset_dec', 'offset_hex', 'size_dec', 'size_hex', 'offset_size'];

  fillColor = 'rgb(255, 0, 0)';

  innerWidth: number | undefined;

  constructor() {
    this._activatedRoute.params.subscribe(params => {
      const boardNamesParam = params['boardId'];
      const schemesParam = params['schemeId'];
      console.log('Received boarId:', boardNamesParam, 'Received schemeId:', schemesParam);
      // set board based on param
      if (boardNamesParam === undefined) {
        const board = this.boardNames[0];
        const selectedScheme = this.partitionsData[board].default;
        this.updatePage(board, selectedScheme);
      } else {
        if (boardNamesParam && this.boardNames.includes(boardNamesParam) && schemesParam === undefined) {
          const board = boardNamesParam;
          const selectedScheme = this.partitionsData[board].default;
          this.updatePage(board, selectedScheme);
        }
        else if (boardNamesParam && this.boardNames.includes(boardNamesParam) && schemesParam) 
          {
            const board = boardNamesParam;
            const selectedScheme = schemesParam;
            this.updatePage(board, selectedScheme);
          } else {
          this.selectedBoard = this.boardNames[0];
          this.router.navigate(['/page-not-found']);
        }
      }
    });
  }

  onBoardChange(board: string) {
    // schemes are undefined, use default
    console.log('onBoardChange', board);
    this.router.navigate([`/esp32-partitions/${board}/${this.esp32DataService.getDefaultScheme(board)}`]);
  }

  updatePage(board: string, scheme?: string) {
    console.log('updatePage', board, scheme);
    if (scheme) {
      this.selectedScheme = scheme;
      this.selectedBoard = board;
      this.schemes = Object.keys(this.partitionsData[board].schemes || {});
      if (!this.schemes.includes(scheme)) {
        this.selectedScheme = this.partitionsData[board].default;
      }
      const scheme_build = this.partitionsData[board].schemes?.[this.selectedScheme]?.build;
      if (scheme_build) {
        this.selectedSchemeData = this.defaultSchemes[scheme_build];
      } else {
        this.selectedSchemeData = [];
      }
    }
    this.setTableData();
  }

  onSchemeChange(scheme: string) {
    console.log('onSchemeChange', scheme);
    this.router.navigate([`/esp32-partitions/${this.selectedBoard}/${scheme}`]);
  }

  setTableData(){
    const data = this.selectedSchemeData;
    if (data !== undefined && data.length !== 0) {
      const newData: PartitionEntryExtended[] = [];
      const partitions: Partition[] = [];
      let collorIndex = 0;
      const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a', '#ffc107'];
      for (const entry of data) {
        const offset_dec = Number(entry.offset);
        const size_dec = Number(entry.size);
        newData.push({
          color: colors[collorIndex],
          name: entry.name,
          type: entry.type,
          subtype: entry.subtype,
          offset_hex: entry.offset,
          offset_dec: offset_dec,
          size_hex: entry.size,
          size_dec: size_dec,
          offset_size: offset_dec + size_dec
        });
        partitions.push({
          color: colors[collorIndex],
          offset: Math.floor(offset_dec/1000),
          size: Math.floor(size_dec/1000)
        });
        collorIndex += 1;
      }
      
      const lastEntry = partitions[partitions.length - 1];
      const totalSize = lastEntry.offset + lastEntry.size;
      this.viewBox = `0 0 ${totalSize} 100`;
      this.partitionGraphTotalSize = totalSize;
      this.partitionGraph = partitions;
      this.dataSource = new MatTableDataSource<PartitionEntryExtended>(newData)
    }
  }
}

interface PartitionEntryExtended {
  color: string;
  name: string;
  type: string;
  subtype: string;
  offset_hex: string;
  offset_dec: number;
  size_hex: string;
  size_dec: number;
  offset_size: number;
}
interface Partition{
  color: string;
  offset: number;
  size: number;
}