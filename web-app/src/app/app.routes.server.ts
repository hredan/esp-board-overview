import { RenderMode, ServerRoute } from '@angular/ssr';
import { Esp32DataService } from './esp32-data.service';

export const serverRoutes: ServerRoute[] = [
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
