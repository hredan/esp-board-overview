import { Component, effect, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Esp8266PartitionEntry } from '../esp8266-data.service';

interface PartitionGraphEntry {
  color: string;
  offset: number;
  size: number;
}

interface PartitionTableEntry {
  color: string;
  name: string;
  offset_hex: string;
  offset_dec: number;
  size_hex: string;
  size_dec: number;
  offset_size: number;
}

@Component({
  selector: 'app-esp8266-partition-view',
  imports: [MatTableModule],
  templateUrl: './esp8266-partition-view.component.html',
  styleUrl: './esp8266-partition-view.component.css'
})
export class Esp8266PartitionViewComponent {
  schemeName = input<string>('');
  selectedSchemeData = input<Esp8266PartitionEntry[]>([]);

  readonly displayedColumns: string[] = ['color', 'name', 'offset_hex', 'offset_dec', 'size_hex', 'size_dec', 'offset_size'];
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

  private setTableData(data: Esp8266PartitionEntry[]) {
    if (data.length === 0) {
      this.dataSource = new MatTableDataSource<PartitionTableEntry>([]);
      this.partitionGraph = [];
      this.partitionGraphTotalSize = 0;
      this.viewBox = '0 0 0 0';
      return;
    }

    const newData: PartitionTableEntry[] = [];
    const partitions: PartitionGraphEntry[] = [];

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      const offset_dec = parseInt(entry.offset, 16);
      const size_dec = parseInt(entry.size, 16);
      const color = this.colors[i % this.colors.length];

      newData.push({
        color,
        name: entry.name,
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
