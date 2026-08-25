import { BUSINESS_INFO } from './business-info';

describe('BUSINESS_INFO social links', () => {
  it('uses the approved official profile URLs', () => {
    expect(BUSINESS_INFO.social.facebook).toBe(
      'https://www.facebook.com/pcgamerciudadmexico'
    );
    expect(BUSINESS_INFO.social.instagram).toBe(
      'https://www.instagram.com/pcgamer_cdmx/'
    );
    expect(BUSINESS_INFO.social.tiktok).toBe(
      'https://www.tiktok.com/@pcgamercdmx'
    );
  });
});
