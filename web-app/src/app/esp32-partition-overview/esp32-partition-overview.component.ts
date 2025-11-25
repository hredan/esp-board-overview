import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

import { Esp32DataService, PartitionEntry } from '../esp32-data.service';

@Component({
  selector: 'app-esp32-partition-overview',
  imports: [MatSelectModule, MatFormFieldModule, MatOptionModule, MatTableModule, MatTableModule],
  templateUrl: './esp32-partition-overview.component.html',
  styleUrl: './esp32-partition-overview.component.css'
})
export class Esp32PartitionOverviewComponent implements OnInit {
  esp32DataService: Esp32DataService = new Esp32DataService();
  partitionsData = this.esp32DataService.partitionsData;
  defaultSchemes = this.esp32DataService.defaultSchemes;
  boardNames = Object.keys(this.partitionsData);
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

  ngOnInit(){
    this.setTableData();
  }

  onBoardChange(event: string) {
    // schemes are undefined, use default
    if (Object.keys(this.partitionsData[event].schemes).length === 0) {
      this.schemes = [this.partitionsData[event].default];
      this.selectedScheme = this.partitionsData[event].default;
    }
    else {
      // schemes are defined, use default to select scheme
      const defaultScheme = this.partitionsData[event].default;
      this.schemes = Object.keys(this.partitionsData[event].schemes);
      const selectedScheme = this.partitionsData[event].schemes[defaultScheme];
      // if default scheme is not found, use first scheme
      if (selectedScheme === undefined) {
        this.selectedScheme = Object.keys(this.partitionsData[event].schemes)[0]
      }
      else {
        this.selectedScheme = defaultScheme;
      }
    }
    if (this.selectedScheme !== undefined) {
      const build_name = this.partitionsData[event].schemes?.[this.selectedScheme]?.build || undefined;
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

  onSchemeChange(event: string) {
    const selectedScheme = this.partitionsData[this.selectedBoard].schemes?.[event];
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