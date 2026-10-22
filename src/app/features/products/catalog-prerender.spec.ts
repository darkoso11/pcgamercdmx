import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';
import { serverRoutes } from '../../app.routes.server';

describe('Catalog prerender taxonomy', () => {
  for (const unavailable of [true, false]) {
    it(`rejects ${unavailable ? 'failed' : 'empty'} remote taxonomy instead of silently omitting CMS routes`, async () => {
      TestBed.configureTestingModule({ providers: [{ provide: DirectusApiService, useValue: {
        isEnabled: () => true,
        readItems: () => unavailable ? throwError(() => new Error('CMS unavailable')) : of({ data: [] }),
      } }] });
      const route = serverRoutes.find(route => route.path === 'productos/perifericos/:category')!;
      if ('getPrerenderParams' in route) {
        await expectAsync(TestBed.runInInjectionContext(() => route.getPrerenderParams())).toBeRejected();
      } else fail('Missing dynamic prerender route');
    });
  }
});
