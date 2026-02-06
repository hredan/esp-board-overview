import { Component, OnInit, Inject } from '@angular/core';
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
export class Esp32PartitionOverviewComponent implements OnInit {
  private activatedRoute = Inject(ActivatedRoute);
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

  constructor(private _activatedRoute: ActivatedRoute, private router: Router) {
    this._activatedRoute.params.subscribe(params => {
      const boardNamesParam = params['boardId'];
      const schemesParam = params['schemeId'];
      // set board based on param
      if (boardNamesParam === undefined) {
        this.selectedBoard = this.boardNames[0];
      } else {
        if (boardNamesParam && this.boardNames.includes(boardNamesParam)) {
          this.selectedBoard = boardNamesParam;
        }
        else {
          this.selectedBoard = this.boardNames[0];
          this.router.navigate(['/page-not-found']);
        }
        // set schemes based on selected board
        this.onSchemeChange(schemesParam);
      }
    });
  }
  ngOnInit(){
    this.setTableData();
  }

  onBoardChange(board: string) {
    // schemes are undefined, use default
    if (Object.keys(this.partitionsData[board].schemes).length === 0) {
      this.schemes = [this.partitionsData[board].default];
      this.selectedScheme = this.partitionsData[board].default;
    }
    else {
      // schemes are defined, use default to select scheme
      const defaultScheme = this.partitionsData[board].default;
      this.schemes = Object.keys(this.partitionsData[board].schemes);
      const selectedScheme = this.partitionsData[board].schemes[defaultScheme];
      // if default scheme is not found, use first scheme
      if (selectedScheme === undefined) {
        this.selectedScheme = Object.keys(this.partitionsData[board].schemes)[0]
      }
      else {
        this.selectedScheme = defaultScheme;
      }
    }
    if (this.selectedScheme !== undefined) {
      const build_name = this.partitionsData[board].schemes?.[this.selectedScheme]?.build || undefined;
      if (build_name !== undefined) {
        this.selectedSchemeData = this.defaultSchemes[build_name];
      }
      else {
        const data = this.defaultSchemes[this.selectedScheme];
        if (data !== undefined) {
          this.selectedSchemeData = data;
        }
        else {
          this.selectedSchemeData = [];
        }

      }
      //this.dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeData);
      this.setTableData();
    }
  }

  onSchemeChange(scheme: string) {
    const selectedScheme = this.partitionsData[this.selectedBoard].schemes?.[scheme];
    if (selectedScheme !== undefined) {
      this.selectedSchemeData = this.defaultSchemes[selectedScheme.build] || [];
    }
    else {
      this.selectedSchemeData = [];
    }
    //this.dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeData);
    this.setTableData();
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