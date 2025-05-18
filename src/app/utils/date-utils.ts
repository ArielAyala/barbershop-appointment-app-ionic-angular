export class DateUtils {

  /**
   * Returns the current date in `YYYY-MM-DD` format based on the device's local timezone.
   *
   * @returns {string} - Example output: `"2025-02-24"`
   */
  static getCurrentDate(): string {
    return new Date().toLocaleDateString('en-CA'); // 'en-CA' ensures YYYY-MM-DD format
  }

  /**
   * Returns the current date and time in `YYYY-MM-DD HH:mm:ss` format based on the device's local timezone.
   *
   * @returns {string} - Example output: `"2025-02-24 14:35:12"`
   */
  static getCurrentDateTime(): string {
    const date = new Date().toLocaleString('en-CA', { hour12: false }).replace(',', '');
    return date.replace(/\//g, '-');
  }

  /**
   * Converts a UTC date string (ISO format) to the local timezone in `YYYY-MM-DD HH:mm:ss` format.
   *
   * @param {string} utcDateString - ISO date string, e.g. `"2025-02-24T14:35:12.123Z"`
   * @returns {string} - Example output (local time): `"2025-02-24 08:35:12"`
   */
  static convertUTCToLocal(utcDateString: string): string {
    const date = new Date(utcDateString);
    return date.toLocaleString('en-CA', { hour12: false }).replace(',', '').replace(/\//g, '-');
  }

  /**
   * Returns the device's timezone offset in minutes relative to UTC.
   *
   * @returns {number} - Example output (Mexico UTC-6): `360`
   */
  static getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  /**
   * Formats a given Date object into `YYYY-MM-DD` format.
   *
   * @param {Date} date - JavaScript Date object
   * @returns {string} - Example output: `"2025-02-24"`
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-CA');
  }

  /**
   * Formats a given Date object into `YYYY-MM-DD HH:mm:ss` format.
   *
   * @param {Date} date - JavaScript Date object
   * @returns {string} - Example output: `"2025-02-24 14:35:12"`
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString('en-CA', { hour12: false }).replace(',', '').replace(/\//g, '-');
  }

  /**
   * Returns the name of the day in English or Spanish based on a date string.
   *
   * @param {string} dateString - Date string in YYYY-MM-DD format (from getCurrentDate)
   * @param {string} language - Language code ('en' for English, 'es' for Spanish)
   * @returns {string} - Example output: 'Monday' or 'Lunes'
   */
  static getDayName(dateString: string, language: 'en' | 'es' = 'en'): string {
    // Split the date string and create date with local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in JavaScript Date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return date.toLocaleDateString(language, options);
  }
}
