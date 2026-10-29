export function getIndexingDirective(hostname: string): string | undefined {
  return hostname.toLowerCase() === 'test.pcgamercdmx.com' ? 'noindex' : undefined;
}
