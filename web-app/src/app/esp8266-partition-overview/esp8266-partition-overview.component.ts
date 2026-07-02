import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

import { Esp8266DataService, Esp8266PartitionEntry } from '../esp8266-data.service';
import { Esp8266PartitionViewComponent } from '../esp8266-partition-view/esp8266-partition-view.component';

@Component({
  selector: 'app-esp8266-partition-overview',
  imports: [MatSelectModule, MatFormFieldModule, MatOptionModule, Esp8266PartitionViewComponent],
  templateUrl: './esp8266-partition-overview.component.html',
  styleUrl: './esp8266-partition-overview.component.css'
})
export class Esp8266PartitionOverviewComponent {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  esp8266DataService = inject(Esp8266DataService);

  partitionsData = this.esp8266DataService.partitionsData;
  boardNames = Object.keys(this.partitionsData);

  selectedBoard = this.boardNames[0];
  selectedScheme = this.esp8266DataService.getDefaultScheme(this.selectedBoard);
  schemes = Object.keys(this.partitionsData[this.selectedBoard]?.schemes ?? {});
  selectedSchemeData: Esp8266PartitionEntry[] = this.esp8266DataService.getSchemeEntries(this.selectedBoard, this.selectedScheme);

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      const boardId: string | undefined = params['boardId'];
      const schemeId: string | undefined = params['schemeId'];

      if (!boardId) {
        const board = this.boardNames[0];
        const scheme = this.esp8266DataService.getDefaultScheme(board);
        this.updatePage(board, scheme);
      } else if (this.boardNames.includes(boardId)) {
        const scheme = schemeId ?? this.esp8266DataService.getDefaultScheme(boardId);
        this.updatePage(boardId, scheme);
      } else {
        this.router.navigate(['/page-not-found']);
      }
    });
  }

  updatePage(board: string, scheme: string) {
    this.selectedBoard = board;
    this.schemes = Object.keys(this.partitionsData[board]?.schemes ?? {});
    this.selectedScheme = this.schemes.includes(scheme) ? scheme : (this.schemes[0] ?? '');
    this.selectedSchemeData = this.esp8266DataService.getSchemeEntries(board, this.selectedScheme);
  }

  onBoardChange(board: string) {
    const scheme = this.esp8266DataService.getDefaultScheme(board);
    this.router.navigate([`/esp8266-partitions/${board}/${scheme}`]);
  }

  onSchemeChange(scheme: string) {
    this.router.navigate([`/esp8266-partitions/${this.selectedBoard}/${scheme}`]);
  }

  get selectedSchemeName(): string {
    return this.partitionsData[this.selectedBoard]?.schemes?.[this.selectedScheme]?.full_name ?? '';
  }
}
