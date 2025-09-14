import { Component, OnInit } from '@angular/core';
import esp32_partitions from '../../../data/esp32_partitions.json';
import esp32_schemes from '../../../data/esp32_partition_schemes.json';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-esp32-partition-overview',
  imports: [MatSelectModule, MatFormFieldModule, MatOptionModule, MatTableModule, MatTableModule],
  templateUrl: './esp32-partition-overview.component.html',
  styleUrl: './esp32-partition-overview.component.css'
})
export class Esp32PartitionOverviewComponent {
  partitionsData: BoardPartitionsInfo = esp32_partitions as BoardPartitionsInfo;
  defaultSchemes: DefaultSchemes = esp32_schemes as DefaultSchemes;
  boardNames = Object.keys(this.partitionsData);
  selectedBoard: string = this.boardNames[0];
  defaultScheme: string = this.partitionsData[this.selectedBoard].default;

  schemes: string[] = Object.keys(this.partitionsData[this.selectedBoard].schemes || {});
  selectedScheme: string = this.defaultScheme;

  selectedSchemeData: PartitionEntry[] = this.defaultSchemes[this.selectedScheme] || [];
  dataSource = new MatTableDataSource<PartitionEntryExtended>([]);

  displayedColumns: string[] = ['name', 'type','subtype', 'offset_dec', 'offset_hex', 'size_dec', 'size_hex', 'offset_size'];

  ngOnInit(){
    this.setTableData();
  }

  onBoardChange(event: string) {
    console.log(event);
    // schemes are undefined, use default
    if (this.partitionsData[event].schemes === undefined) {
      this.schemes = [this.partitionsData[event].default];
      this.selectedScheme = this.partitionsData[event].default;
    }
    else {
      // schemes are defined, use default to select scheme
      let defaultScheme = this.partitionsData[event].default;
      this.schemes = Object.keys(this.partitionsData[event].schemes);
      let selectedScheme = this.partitionsData[event].schemes[defaultScheme];
      // if default scheme is not found, use first scheme
      if (selectedScheme === undefined) {
        this.selectedScheme = Object.keys(this.partitionsData[event].schemes)[0]
      }
      else {
        this.selectedScheme = defaultScheme;
      }
    }
    if (this.selectedScheme !== undefined) {
      let build_name = this.partitionsData[event].schemes?.[this.selectedScheme]?.build || undefined;
      if (build_name !== undefined) {
        this.selectedSchemeData = this.defaultSchemes[build_name];
      }
      else {
        this.selectedSchemeData = [];
      }
      //this.dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeData);
      this.setTableData();
      console.log(this.selectedSchemeData);
    }
  }

  onSchemeChange(event: string) {
    console.log(event);
    let selectedScheme = this.partitionsData[this.selectedBoard].schemes?.[event];
    if (selectedScheme !== undefined) {
      this.selectedSchemeData = this.defaultSchemes[selectedScheme.build] || [];
    }
    else {
      this.selectedSchemeData = [];
    }
    //this.dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeData);
    this.setTableData();
    console.log(this.selectedSchemeData);
  }

  setTableData(){
    let data = this.selectedSchemeData;
    let newData: PartitionEntryExtended[] = [];
    for (let entry of data) {
      const offset_dec: number = Number(entry.offset);
      const size_dec: number = Number(entry.size);
      newData.push({
        name: entry.name,
        type: entry.type,
        subtype: entry.subtype,
        offset_hex: entry.offset,
        offset_dec: offset_dec,
        size_hex: entry.size,
        size_dec: size_dec,
        offset_size: offset_dec + size_dec
      });
    }
    this.dataSource = new MatTableDataSource<PartitionEntryExtended>(newData)
  }
}

interface BoardSchemeInfo {
  full_name: string;
  build: string;
}

interface BoardPartitionScheme {
  [key: string]: BoardSchemeInfo;
}

interface BoardPartitions {
  default: string;
  schemes?: BoardPartitionScheme | undefined;
}

interface BoardPartitionsInfo {
  [key: string]: BoardPartitions;
}

interface PartitionEntry {
  name: string;
  type: string;
  subtype: string;
  offset: string;
  size: string;
}

interface PartitionEntryExtended {
  name: string;
  type: string;
  subtype: string;
  offset_hex: string;
  offset_dec: number;
  size_hex: string;
  size_dec: number;
  offset_size: number;
}


interface DefaultSchemes {
  [key: string]: PartitionEntry[];
}
