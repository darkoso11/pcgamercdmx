export type PublicationState = 'draft' | 'scheduled' | 'published';

export type NormalizedVideoEmbed = {
  kind: 'video-embed';
  provider: 'youtube' | 'vimeo';
  externalId: string;
};

const BLOG_TIME_ZONE = 'America/Mexico_City';

export function getPublicationState(
  published: boolean,
  publishedAt?: string,
  now = new Date()
): PublicationState {
  if (!published) {
    return 'draft';
  }

  const publicationTime = publishedAt ? new Date(publishedAt).getTime() : 0;
  return publicationTime > now.getTime() ? 'scheduled' : 'published';
}

export function localDateTimeToUtc(
  localDateTime: string,
  timeZone = BLOG_TIME_ZONE
): string {
  const match = localDateTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) {
    throw new Error('Fecha y hora local inválida');
  }

  const [, year, month, day, hour, minute, second = '00'] = match;
  const intendedUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  let candidate = intendedUtc;
  for (let attempt = 0; attempt < 2; attempt++) {
    const represented = getZonedParts(new Date(candidate), timeZone);
    const representedUtc = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute,
      represented.second
    );
    candidate += intendedUtc - representedUtc;
  }

  return new Date(candidate).toISOString();
}

export function utcDateTimeToLocal(
  utcDateTime: string,
  timeZone = BLOG_TIME_ZONE
): string {
  const date = new Date(utcDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const parts = getZonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function normalizeVideoUrl(rawUrl: string): NormalizedVideoEmbed {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('URL de video inválida');
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('URL de video inválida');
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be') {
    return youtubeEmbed(url.pathname.slice(1));
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (url.pathname === '/watch') {
      return youtubeEmbed(url.searchParams.get('v') ?? '');
    }
    const pathMatch = url.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/);
    if (pathMatch) {
      return youtubeEmbed(pathMatch[1]);
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.match(/(?:\/video)?\/(\d+)(?:$|\/)/)?.[1];
    if (id) {
      return { kind: 'video-embed', provider: 'vimeo', externalId: id };
    }
  }

  throw new Error('Solo se admiten enlaces de YouTube o Vimeo');
}

function youtubeEmbed(id: string): NormalizedVideoEmbed {
  if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) {
    throw new Error('URL de YouTube inválida');
  }

  return { kind: 'video-embed', provider: 'youtube', externalId: id };
}

function getZonedParts(date: Date, timeZone: string): Record<
  'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
  number
> {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  );
  return values as Record<
    'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
    number
  >;
}
