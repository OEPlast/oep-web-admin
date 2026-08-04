export const DEFAULT_TIMEZONE = 'Africa/Lagos';

/**
 * Timezones offered in the store-settings picker.
 *
 * `Intl.supportedValuesOf('timeZone')` returns the runtime's full IANA list
 * (~400 entries), which is the honest source and keeps the picker correct as the
 * business expands beyond Nigeria. It is a relatively recent API, so fall back to
 * a short list covering the markets that actually matter today rather than
 * rendering an empty select on an older browser.
 */
const FALLBACK_TIMEZONES = [
  'Africa/Lagos',
  'Africa/Accra',
  'Africa/Abidjan',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Dubai',
  'UTC',
];

export interface TimezoneOption {
  label: string;
  value: string;
}

const offsetLabel = (tz: string): string => {
  try {
    // `shortOffset` yields e.g. "GMT+1", which is what makes the difference
    // between two similar-looking zones legible at a glance.
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());

    const name = parts.find((p) => p.type === 'timeZoneName')?.value;
    return name ? `${tz} (${name})` : tz;
  } catch {
    return tz;
  }
};

export const getTimezoneOptions = (): TimezoneOption[] => {
  const supported =
    typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('timeZone')
      : FALLBACK_TIMEZONES;

  const zones = supported.length > 0 ? supported : FALLBACK_TIMEZONES;

  return zones.map((tz) => ({ label: offsetLabel(tz), value: tz }));
};
