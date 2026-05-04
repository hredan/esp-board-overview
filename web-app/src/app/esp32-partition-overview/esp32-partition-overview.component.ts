import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { Esp32PartitionViewComponent } from '../esp32-partition-view/esp32-partition-view.component';

import { Esp32DataService, PartitionEntry } from '../esp32-data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-esp32-partition-overview',
  imports: [MatSelectModule, MatFormFieldModule, MatOptionModule, Esp32PartitionViewComponent, RouterLink],
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

  constructor() {
    this._activatedRoute.params.subscribe(params => {
      const boardNamesParam = params['boardId'];
      const schemesParam = params['schemeId'];
      console.log('Received boarId:', boardNamesParam, 'Received schemeId:', schemesParam);
      // set board based on param
      if (boardNamesParam === undefined) {
        const board = this.boardNames[0];
        const selectedScheme = this.esp32DataService.getDefaultScheme(board);
        this.updatePage(board, selectedScheme);
      } else {
        if (boardNamesParam && this.boardNames.includes(boardNamesParam) && schemesParam === undefined) {
          const board = boardNamesParam;
          const selectedScheme = this.esp32DataService.getDefaultScheme(board);
          this.updatePage(board, selectedScheme);
        }
        else if (boardNamesParam && this.boardNames.includes(boardNamesParam) && schemesParam) 
          {
            const board = boardNamesParam;
            const selectedScheme = schemesParam;
            this.updatePage(board, selectedScheme);
          } else {
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
      const scheme_build = this.partitionsData[board].schemes?.[this.selectedScheme]?.build;
      if (scheme_build) {
        this.selectedSchemeData = this.defaultSchemes[scheme_build];
      } else {
        this.selectedSchemeData = [];
      }
    }
  }

  onSchemeChange(scheme: string) {
    console.log('onSchemeChange', scheme);
    this.router.navigate([`/esp32-partitions/${this.selectedBoard}/${scheme}`]);
  }
}