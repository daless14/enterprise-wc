import { ummalquraData } from '../../components/ids-locale/info/umalqura-data';
import { stringToNumber } from '../ids-string-utils/ids-string-utils';

/**
 * Determine whether or not a date is todays date.
 * @param {Date} date The date to check.
 * @returns {boolean} Returns true or false if the compared date is today.
 */
export function isTodaysDate(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
  );
}

/**
 * Gets the first day of the week.
 * @param {Date} date The date to check.
 * @param {number} startsOn Day of the week to start on. Sunday is 0, Monday is 1, and so on.
 * @param {boolean} showRange If calendar is showing range view, day of the week should not be counted backwards
 * @returns {Date} Returns first day of the week date.
 */
export function firstDayOfWeekDate(date: Date, startsOn = 0, showRange = false): Date {
  const dayOfWeek = date.getDay();
  const firstDay = new Date(date);
  const diff = dayOfWeek >= startsOn || showRange ? dayOfWeek - startsOn : 6 - dayOfWeek;

  firstDay.setDate(date.getDate() - diff);
  firstDay.setHours(0, 0, 0, 0);

  return firstDay;
}

/**
 * Gets the last day of the week.
 * @param {Date} date The date to check.
 * @param {number} startsOn Day of the week to start on. Sunday is 0, Monday is 1, and so on.
 * @returns {Date} Returns last day of the week date.
 */
export function lastDayOfWeekDate(date: Date, startsOn = 0): Date {
  const lastDay = firstDayOfWeekDate(date, startsOn);
  lastDay.setDate(lastDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);

  return lastDay;
}

/**
 * Get the difference between two dates.
 * @param {Date} first The first date.
 * @param {Date} second The second date.
 * @param {boolean} useHours The different in hours if true, otherways days.
 * @returns {number} The difference between the two dates.
 */
export function dateDiff(first: any, second: any, useHours: boolean): number {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  const dtoday = new Date();
  return Math.round(
    (second - first) / (1000 * 60 * 60 * (useHours ? 1 : Math.abs(dtoday.getTimezoneOffset())))
  );
}

/**
 * Get the month difference between two dates.
 * @param {Date} first The first date.
 * @param {Date} second The second date.
 * @returns {number} The difference between the two dates.
 */
export function monthDiff(first: Date, second: Date): number {
  let months;

  months = (second.getFullYear() - first.getFullYear()) * 12;
  months -= first.getMonth();
  months += second.getMonth();

  return months <= 0 ? 0 : months;
}

/**
 * Get the difference in days between two dates.
 * @param {Date} startDate the beginning of the interval
 * @param {Date} endDate the end of the interval
 * @returns {number} number of days
 */
export function daysDiff(startDate: any, endDate: any): number {
  return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
}

/**
 * Add a number of units to original date
 * @param {Date | string} date original date.
 * @param {number} number of unit to add to the date.
 * @param {string} unit days
 * @returns {Date} new date after addition.
 */
export function addDate(date: Date | string, number: number, unit?: string): any {
  let newDate = null;
  const originalDate = date instanceof Date ? new Date(date.toISOString()) : new Date(date);
  switch (unit) {
    case 'days':
      newDate = new Date(originalDate.setDate(originalDate.getDate() + number));
      break;
    default:
      break;
  }
  return newDate;
}

/**
 * Subtract a number of units to original date
 * @param {Date | string} date original date.
 * @param {number} number of unit to subtract from the given date.
 * @param {string} unit days
 * @returns {Date} new date after subtraction.
 */
export function subtractDate(date: Date | string, number: number, unit?: string): any {
  let newDate = null;
  const originalDate = date instanceof Date ? new Date(date.toISOString()) : new Date(date);
  switch (unit) {
    case 'days':
      newDate = new Date(originalDate.setDate(originalDate.getDate() - number));
      break;
    default:
      break;
  }
  return newDate;
}

/**
 * Check if a date is using daylight saving time
 * @param {Date} date original date.
 * @returns {boolean} true if given date is using daylight saving time, false otherwise.
 */
export function isDaylightSavingTime(date: Date) {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== date.getTimezoneOffset();
}

/**
 * Check if a date is valid
 * @param {any} date date to check.
 * @returns {boolean} true if valid, false otherwise.
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date
    && !Number.isNaN(date)
    && date.toString() !== 'Invalid Date';
}

/**
 * Convert umalqura to gregorian date.
 * @param {number} year Umm al-Qura calendar year
 * @param {number} month Umm al-Qura calendar month
 * @param {number} day Umm al-Qura calendar day
 * @param {number} hours hours
 * @param {number} mins minutes
 * @param {number} secs seconds
 * @param {number} mills milliseconds
 * @returns {Date} Gregorian calendar date
 */
export function umalquraToGregorian(year: number, month: number, day: number, hours = 0, mins = 0, secs = 0, mills = 0) {
  // Modified version of Amro Osama's code. From at https://github.com/kbwood/calendars/blob/master/src/js/jquery.calendars.ummalqura.js
  const getJd = (y: number, m: number, d: number) => {
    const index = (12 * (y - 1)) + m - 15292;
    const mcjdn = d + ummalquraData[index - 1] - 1;

    return mcjdn + 2400000 - 0.5;
  };
  const jd = getJd(year, month + 1, day);

  const julianToGregorian = (julianDate: number) => {
    const z = Math.floor(julianDate + 0.5);
    let a = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + a - Math.floor(a / 4);
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const gday = b - d - Math.floor(e * 30.6001);
    const gmonth = e - (e > 13.5 ? 13 : 1);
    const gyear = c - (gmonth > 2.5 ? 4716 : 4715);

    return { year: gyear, month: gmonth - 1, day: gday };
  };
  const gregorianDateObj = julianToGregorian(jd);

  const gregorianDate = new Date(
    gregorianDateObj.year,
    gregorianDateObj.month,
    gregorianDateObj.day,
    hours,
    mins,
    secs,
    mills
  );

  return gregorianDate;
}

/**
 * Convert Gregorian to Umm al-Qura calendar date.
 * @param {Date} date Gregorian calendar date
 * @returns {object} Umm al-Qura calendar year, month, day
 */
export function gregorianToUmalqura(date?: Date): any {
  const umalquraParts: any = new Intl.DateTimeFormat('en-US', { calendar: 'islamic-umalqura' })
    // set a current date if argument is not valid
    .formatToParts(isValidDate(date) ? date : new Date())
    .reduce((acc, item) => ({ ...acc, [item.type]: stringToNumber(item.value) }), {});

  return {
    year: umalquraParts.year,
    month: umalquraParts.month - 1,
    day: umalquraParts.day
  };
}

/**
 * Gets first day of given month/year date.
 * @param {number} year Gregorian calendar year, long format
 * @param {number} month Gregorian calendar month, 0-11 range
 * @param {number} day Gregorian calendar day, needed only if converting to Umm al-Qura calendar date
 * @param {boolean} isIslamic if set to true the calculation is based on the Umm al-Qura Calendar
 * @returns {Date} Gregorian calendar date
 */
export function firstDayOfMonthDate(year: number, month: number, day?: number | undefined, isIslamic?: boolean) {
  if (isIslamic) {
    const umalqura = gregorianToUmalqura(new Date(year, month, day));

    return umalquraToGregorian(umalqura.year, umalqura.month, 1);
  }

  return new Date(year, month, 1);
}

/**
 * Gets last day of given month/year date.
 * @param {number} year Gregorian calendar year, long format
 * @param {number} month Gregorian calendar month, 0-11 range
 * @param {number} day Gregorian calendar day, needed only if converting to Umm al-Qura calendar date
 * @param {boolean} isIslamic if set to true the calculation is based on the Umm al-Qura Calendar
 * @returns {Date} Gregorian calendar date
 */
export function lastDayOfMonthDate(year: number, month: number, day?: number | undefined, isIslamic?: boolean) {
  if (isIslamic) {
    const umalqura = gregorianToUmalqura(new Date(year, month, day));

    return umalquraToGregorian(umalqura.year, umalqura.month + 1, 0);
  }

  return new Date(year, month + 1, 0);
}

/**
 * Gets the number of days in a given month.
 * @param {number} year Gregorian calendar year, long format
 * @param {number} month Gregorian calendar month, 0-11 range
 * @param {number} day Gregorian calendar day, needed only if converting to Umm al-Qura calendar date
 * @param {boolean} isIslamic if set to true the calculation is base the Umm al-Qura Calendar
 * @returns {number} number of days in a given month.
 */
export function daysInMonth(year: number, month: number, day?: number | undefined, isIslamic?: boolean) {
  const lastDayOfMonth = lastDayOfMonthDate(year, month, day, isIslamic);

  if (isIslamic) {
    const firstDayOfMonth = firstDayOfMonthDate(year, month, day, isIslamic);

    return daysDiff(firstDayOfMonth, lastDayOfMonth) + 1;
  }

  return lastDayOfMonth.getDate();
}

/**
 * Gets the number of weeks in a given month.
 * @param {number} year Gregorian calendar year, long format
 * @param {number} month Gregorian calendar month, 0-11 range
 * @param {number} day Gregorian calendar day, needed only if converting to Umm al-Qura calendar date
 * @param {number} startsOn day of the week to start on. Sunday is 0, Monday is 1 and so on
 * @param {boolean} isIslamic if set to true the calculation is base the Umm al-Qura Calendar
 * @returns {number} number of weeks in a given month
 */
export function weeksInMonth(year: number, month: number, day?: number | undefined, startsOn?: number, isIslamic?: boolean) {
  const firstDayOfMonth = firstDayOfMonthDate(year, month, day, isIslamic);
  const numberOfDaysInMonth = daysInMonth(year, month, day, isIslamic);
  const firstDayOfWeekIndex = (firstDayOfMonth.getDay() - (startsOn || 0) + 7) % 7;

  return Math.ceil((firstDayOfWeekIndex + numberOfDaysInMonth) / 7);
}

/**
 * Gets the number of weeks in a given range of dates.
 * @param {Date} startDate start of the range
 * @param {Date} endDate end of the range
 * @param {number} startsOn day of the week to start on. Sunday is 0, Monday is 1, and so on
 * @returns {number} number of weeks in a given range of dates
 */
export function weeksInRange(startDate: any, endDate: any, startsOn = 0) {
  const daysInRange = daysDiff(startDate, endDate);
  const firstDayOfWeekIndex = (startDate.getDay() - startsOn + 7) % 7;

  return Math.ceil((firstDayOfWeekIndex + daysInRange) / 7);
}

/**
 * Gets date of first day of the week by year and week number.
 * @param {Date} year a year where week number should be returned
 * @param {number} week week number
 * @param {number} startsOn day of the week to start on. Sunday is 0, Monday is 1, and so on
 * @returns {Date} date of first day of the week
 */
export function weekNumberToDate(year: number, week: number, startsOn = 0): Date {
  const daysInRange: number = ((week - 1) * 7) + startsOn;
  const firstDayOfYearDate: Date = new Date(year, 0, 1);
  const fristDayIndex: number = firstDayOfYearDate.getDay();
  const days: number = fristDayIndex > 4 ? daysInRange + (8 - fristDayIndex) : daysInRange - (fristDayIndex - 1);

  return new Date(year, 0, days);
}

/**
 * Gets ISO-8601 week number of a year by date
 * @param {Date} date what date week number should be returned
 * @param {number} startsOn day of the week to start on. Sunday is 0, Monday is 1, and so on
 * @returns {number} week number
 */
export function weekNumber(date: Date, startsOn = 0) {
  // Set range end
  const weekDayIndex: number = (date.getDay() + 7 - startsOn) % 7;

  date.setDate(date.getDate() - weekDayIndex + 3);

  const rangeEnd: number = date.getTime();

  // Set range start
  date.setMonth(0, 1);

  if (date.getDay() !== 4) {
    date.setMonth(0, 1 + ((4 - date.getDay() + 7) % 7));
  }

  const rangeStart: number = date.getTime();
  const msInWeek = 604800000;

  // Number of weeks in range
  return 1 + Math.ceil((rangeEnd - rangeStart) / msInWeek);
}
