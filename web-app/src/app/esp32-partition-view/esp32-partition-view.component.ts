import { Component, effect, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PartitionEntry } from '../esp32-data.service';

@Component({
  selector: 'app-esp32-partition-view',
  imports: [MatTableModule],
  templateUrl: './esp32-partition-view.component.html',
  styleUrl: './esp32-partition-view.component.css'
})
export class Esp32PartitionViewComponent {
  schemeName = input<string | undefined>('');
  selectedSchemeData = input<PartitionEntry[]>([]);

  readonly displayedColumns: string[] = ['color', 'name', 'type', 'subtype', 'offset_dec', 'offset_hex', 'size_dec', 'size_hex', 'offset_size'];
  private readonly colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a', '#ffc107'];

  dataSource = new MatTableDataSource<PartitionTableEntry>([]);
  partitionGraph: PartitionGraphEntry[] = [];
  partitionGraphTotalSize = 0;
  viewBox = '0 0 0 0';

  constructor() {
    effect(() => {
      this.setTableData(this.selectedSchemeData());
    });
  }

  private setTableData(data: PartitionEntry[]) {
    if (data.length === 0) {
      this.dataSource = new MatTableDataSource<PartitionTableEntry>([]);
      this.partitionGraph = [];
      this.partitionGraphTotalSize = 0;
      this.viewBox = '0 0 0 0';
      return;
    }

    const newData: PartitionTableEntry[] = [];
    const partitions: PartitionGraphEntry[] = [];
    for (let colorIndex = 0; colorIndex < data.length; colorIndex += 1) {
      const entry = data[colorIndex];
      const offset_dec = Number(entry.offset);
      const size_dec = Number(entry.size);
      const color = this.colors[colorIndex % this.colors.length];

      newData.push({
        color,
        name: entry.name,
        type: entry.type,
        subtype: entry.subtype,
        offset_hex: entry.offset,
        offset_dec,
        size_hex: entry.size,
        size_dec,
        offset_size: offset_dec + size_dec
      });

      partitions.push({
        color,
        offset: Math.floor(offset_dec / 1000),
        size: Math.floor(size_dec / 1000)
      });
    }

    const lastEntry = partitions[partitions.length - 1];
    const totalSize = lastEntry.offset + lastEntry.size;
    this.viewBox = `0 0 ${totalSize} 100`;
    this.partitionGraphTotalSize = totalSize;
    this.partitionGraph = partitions;
    this.dataSource = new MatTableDataSource<PartitionTableEntry>(newData);
  }
}

interface PartitionGraphEntry {
  color: string;
  offset: number;
  size: number;
}

interface PartitionTableEntry {
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
