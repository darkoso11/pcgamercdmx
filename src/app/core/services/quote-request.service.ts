import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { DirectusApiService } from './directus-api.service';

export interface QuoteRequestPayload {
  name: string;
  email?: string | null;
  phone: string;
  requestType?: string | null;
  serviceModality?: string | null;
  budget?: string | null;
  message: string;
  dataConsent: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class QuoteRequestService {
  constructor(private readonly directus: DirectusApiService) {}

  submit(payload: QuoteRequestPayload): Observable<boolean> {
    if (!this.directus.isEnabled('quoteRequests')) {
      return of(false);
    }

    return this.directus
      .createItem('pc_quote_requests', {
        name: payload.name,
        email: payload.email ?? null,
        phone: payload.phone,
        request_type: payload.requestType ?? null,
        service_modality: payload.serviceModality ?? null,
        budget: payload.budget ?? null,
        message: payload.message,
        data_consent: payload.dataConsent,
      })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
