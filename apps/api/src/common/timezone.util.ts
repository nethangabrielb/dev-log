const SUPPORTED_TIMEZONES: ReadonlySet<string> = (() => {
  try {
    const zones: string[] =
      typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('timeZone')
        : [];
    return new Set(zones);
  } catch {
    return new Set();
  }
})();

export const DEFAULT_TIMEZONE = 'Asia/Manila';

export function isValidTimezone(timezone: string): boolean {
  if (!timezone) return false;
  if (SUPPORTED_TIMEZONES.has(timezone)) return true;

  // Intl.supportedValuesOf omits alias zones such as Etc/UTC, UTC and GMT,
  // even though they are accepted by Intl. Fall back to DateTimeFormat to
  // resolve those instead of treating them as invalid.
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimezone(timezone?: string | null): string {
  if (timezone && isValidTimezone(timezone)) return timezone;
  return DEFAULT_TIMEZONE;
}
