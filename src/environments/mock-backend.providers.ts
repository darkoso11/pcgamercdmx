import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MockBackendInterceptor } from '../app/features/blog/services/mock-backend.interceptor';

export const mockBackendProviders: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: MockBackendInterceptor, multi: true },
];
