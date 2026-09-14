// The campaign always presents a 1920 calendar. Internally, yearIndex counts
// repeated 365-day cycles so birthdays and other annual rules can still work.

export const MONTHS = Object.freeze([
  Object.freeze({ name: 'January', days: 31 }),
  Object.freeze({ name: 'February', days: 28 }),
  Object.freeze({ name: 'March', days: 31 }),
  Object.freeze({ name: 'April', days: 30 }),
  Object.freeze({ name: 'May', days: 31 }),
  Object.freeze({ name: 'June', days: 30 }),
  Object.freeze({ name: 'July', days: 31 }),
  Object.freeze({ name: 'August', days: 31 }),
  Object.freeze({ name: 'September', days: 30 }),
  Object.freeze({ name: 'October', days: 31 }),
  Object.freeze({ name: 'November', days: 30 }),
  Object.freeze({ name: 'December', days: 31 })
]);

export const DAYS_PER_YEAR = 365;
export const HOURS_PER_YEAR = DAYS_PER_YEAR * 24;
export const CAMPAIGN_START = Object.freeze({ month: 6, day: 1, hour: 0 });

const daysBeforeMonth = month => MONTHS.slice(0, month - 1)
  .reduce((total, item) => total + item.days, 0);

export function dayOfYear(month, day) {
  if (!Number.isInteger(month) || month < 1 || month > MONTHS.length)
    throw new Error('Month must be an integer from 1 to 12.');
  const days = MONTHS[month - 1].days;
  if (!Number.isInteger(day) || day < 1 || day > days)
    throw new Error(`Day must be an integer from 1 to ${days} for ${MONTHS[month - 1].name}.`);
  return daysBeforeMonth(month) + day;
}

const START_DAY_INDEX = dayOfYear(CAMPAIGN_START.month, CAMPAIGN_START.day) - 1;

export function seasonForDate(month, day) {
  const ordinal = dayOfYear(month, day);
  if (ordinal >= dayOfYear(12, 21) || ordinal < dayOfYear(3, 20)) return 'winter';
  if (ordinal < dayOfYear(6, 21)) return 'spring';
  if (ordinal < dayOfYear(9, 22)) return 'summer';
  return 'autumn';
}

export function clockAt(elapsedHours) {
  if (!Number.isFinite(elapsedHours) || elapsedHours < 0)
    throw new Error('Elapsed hours must be a nonnegative number.');
  const absoluteDay = START_DAY_INDEX + Math.floor(elapsedHours / 24);
  const yearIndex = Math.floor(absoluteDay / DAYS_PER_YEAR);
  let dayInYear = absoluteDay % DAYS_PER_YEAR;
  let month = 1;
  while (dayInYear >= MONTHS[month - 1].days) dayInYear -= MONTHS[month++ - 1].days;
  const day = dayInYear + 1;
  const hour = Math.floor(elapsedHours % 24);
  const minute = Math.round((elapsedHours - Math.floor(elapsedHours)) * 60);
  const monthName = MONTHS[month - 1].name;
  return {
    month, monthName, day, hour, yearIndex, yearsPassed: yearIndex,
    season: seasonForDate(month, day),
    label: `${day} ${monthName} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  };
}

export function birthdaysCrossed(fromHour, toHour, birthday) {
  if (toHour < fromHour) throw new Error('Time cannot move backwards.');
  const birthdayIndex = dayOfYear(birthday.month, birthday.day) - 1;
  const firstAbsoluteDay = START_DAY_INDEX + Math.floor(fromHour / 24);
  const lastAbsoluteDay = START_DAY_INDEX + Math.floor(toHour / 24);
  const occurrencesThrough = absoluteDay => Math.floor((absoluteDay - birthdayIndex) / DAYS_PER_YEAR);
  return Math.max(0, occurrencesThrough(lastAbsoluteDay) - occurrencesThrough(firstAbsoluteDay));
}

const SLEEP_CLIMATE = Object.freeze({
  spring: Object.freeze({ exposed: [0, 0], poor: [0, 0] }),
  summer: Object.freeze({ exposed: [0.05, -5], poor: [0.02, -2] }),
  autumn: Object.freeze({ exposed: [0.1, -8], poor: [0.04, -4] }),
  winter: Object.freeze({ exposed: [0.25, -20], poor: [0.1, -10] })
});

export function seasonalSleepModifiers(season, shelter) {
  if (!Object.hasOwn(SLEEP_CLIMATE, season)) throw new Error(`Unknown season: ${season}`);
  if (['standard', 'great', 'best'].includes(shelter))
    return { badSleepChance: 0, energy: 0 };
  const modifier = SLEEP_CLIMATE[season][shelter];
  if (!modifier) throw new Error(`Unknown shelter quality: ${shelter}`);
  return { badSleepChance: modifier[0], energy: modifier[1] };
}
