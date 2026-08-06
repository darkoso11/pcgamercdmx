import {
  getPublicationState,
  localDateTimeToUtc,
  normalizeVideoUrl,
  utcDateTimeToLocal,
} from './blog-content.utils';

describe('Blog content utilities', () => {
  it('classifies drafts, scheduled posts and published posts', () => {
    const now = new Date('2026-07-28T18:00:00.000Z');

    expect(getPublicationState(false, undefined, now)).toBe('draft');
    expect(getPublicationState(true, '2026-07-29T18:00:00.000Z', now)).toBe('scheduled');
    expect(getPublicationState(true, '2026-07-27T18:00:00.000Z', now)).toBe('published');
  });

  it('converts a Mexico City local date and time to UTC', () => {
    expect(localDateTimeToUtc('2026-07-30T10:00')).toBe('2026-07-30T16:00:00.000Z');
  });

  it('returns an empty local date for an invalid stored publication time', () => {
    expect(utcDateTimeToLocal('not-a-date')).toBe('');
  });

  it('normalizes supported YouTube and Vimeo URLs', () => {
    expect(normalizeVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      kind: 'video-embed',
      provider: 'youtube',
      externalId: 'dQw4w9WgXcQ',
    });
    expect(normalizeVideoUrl('https://vimeo.com/76979871')).toEqual({
      kind: 'video-embed',
      provider: 'vimeo',
      externalId: '76979871',
    });
  });

  it('rejects unsupported or malformed video URLs', () => {
    expect(() => normalizeVideoUrl('https://example.com/video/123')).toThrowError(
      'Solo se admiten enlaces de YouTube o Vimeo'
    );
    expect(() => normalizeVideoUrl('javascript:alert(1)')).toThrow();
  });
});
