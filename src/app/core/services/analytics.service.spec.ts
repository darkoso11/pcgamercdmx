import { AnalyticsService } from './seo.service';
import { environment } from '../../../environments/environment';

describe('Analytics head tag', () => {
  const originalId = environment.marketing.googleAnalyticsId;
  afterEach(() => { environment.marketing.googleAnalyticsId = originalId; });

  it('includes the tag during prerender and does not duplicate it on hydration', () => {
    environment.marketing.googleAnalyticsId = 'G-1RE1CQG7LC';
    const doc = document.implementation.createHTMLDocument('Landing');
    new AnalyticsService(doc).init();
    expect(doc.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length).toBe(1);
    new AnalyticsService(doc).init();
    expect(doc.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length).toBe(1);
    expect(doc.head.querySelectorAll('script:not([src])').length).toBe(1);
    expect(doc.head.textContent).toContain("gtag('config', 'G-1RE1CQG7LC')");
  });

  it('keeps local development untracked when no ID is configured', () => {
    environment.marketing.googleAnalyticsId = '';
    const doc = document.implementation.createHTMLDocument('Development');
    new AnalyticsService(doc).init();
    expect(doc.head.querySelector('script')).toBeNull();
  });
});
