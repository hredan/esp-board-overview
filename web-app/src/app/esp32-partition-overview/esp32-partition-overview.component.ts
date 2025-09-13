import { Component } from '@angular/core';
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

  selectedSchemeEntry: PartitionEntry[] = this.defaultSchemes[this.selectedScheme] || [];
  dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeEntry);

  displayedColumns: string[] = ['name', 'type','subtype', 'offset', 'size'];

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
        this.selectedScheme = Object.values(this.partitionsData[event].schemes)[0].build;
      }
      else {
        this.selectedScheme = selectedScheme.build;
      }
    }
    if (this.selectedScheme !== undefined) {
      this.selectedSchemeEntry = this.defaultSchemes[this.selectedScheme] || [];
      this.dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeEntry);
      console.log(this.selectedSchemeEntry);
    }
  }

  onSchemeChange(event: string) {
    console.log(event);
    let selectedScheme = this.partitionsData[this.selectedBoard].schemes?.[event];
    if (selectedScheme !== undefined) {
      this.selectedSchemeEntry = this.defaultSchemes[selectedScheme.build] || [];
    }
    else {
      this.selectedSchemeEntry = [];
    }
    this.dataSource = new MatTableDataSource<PartitionEntry>(this.selectedSchemeEntry);
    console.log(this.selectedSchemeEntry);
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

interface DefaultSchemes {
  [key: string]: PartitionEntry[];
}
