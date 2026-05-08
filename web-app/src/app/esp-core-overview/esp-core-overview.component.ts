import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import coreList_input from '../../../data/core_list.json';
import { RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  selector: 'app-esp-core-overview',
  imports: [MatTableModule, RouterLinkActive, RouterLink],
  templateUrl: './esp-core-overview.component.html',
  styleUrl: './esp-core-overview.component.css'
})
export class EspCoreOverviewComponent implements OnInit {
  coreList: Core[] = (coreList_input as Core[]);
  displayedColumns: string[] = ['core_name', 'core', 'installed_version', 'link'];
  dataSource = this.coreList;
  esp32Version: string = this.coreList.find(core => core.core_name === 'esp32')?.installed_version || 'N/A';
  ngOnInit() {
    if (this.coreList.length == 2 && this.coreList[0].core_name == "esp8266" && this.coreList[1].core_name == "esp32") {
      this.coreList[0].link = "/esp8266";
      this.coreList[1].link = "/esp32";
    }
    else {
      console.log("Error: core_list.json is not in the correct format");
    }
  }
}

export interface Core {
  core: string;
  installed_version: string;
  latest_version: string;
  core_name: string;
  link: string;
}
