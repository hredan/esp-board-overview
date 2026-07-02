import { RenderMode, ServerRoute } from '@angular/ssr';
import { Esp32DataService } from './esp32-data.service';
import { Esp8266DataService } from './esp8266-data.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'esp8266-schemes/:schemeId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const service = new Esp8266DataService();
      return service.getSchemeRoutes();
    }
  },
  {
    path: 'esp8266-partitions/:boardId/:schemeId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const service = new Esp8266DataService();
      return service.getPartitionRoutes();
    }
  },
  {
    path: 'esp32-schemes/:schemeId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams () {
      const esp32DataService = new Esp32DataService();
      return esp32DataService.getSchemeRoutes();
    }
  },
  {
    path: 'esp32-partitions/:boardId/:schemeId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams () {
        const esp32DataService = new Esp32DataService();
        return esp32DataService.getPartitionRoutes();
      }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
