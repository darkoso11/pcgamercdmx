import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';
import { provideRouter } from '@angular/router';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideRouter(routes)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
