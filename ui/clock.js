import { clockAt } from '../src/calendar.js';

// Campaign minutes, never the computer's wall clock. Normalize rounding before
// asking the calendar for a date so 23:59.9 carries into the following day.
export function clockPresentation(elapsedHours) {
  if (!Number.isFinite(elapsedHours) || elapsedHours < 0)
    throw new Error('Elapsed hours must be a nonnegative number.');
  const totalMinutes = Math.round(elapsedHours * 60);
  const calendar = clockAt(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const hour = calendar.hour;
  const time = `${hour % 12 || 12}:${String(minute).padStart(2, '0')}`;
  const period = hour < 12 ? 'AM' : 'PM';
  return {
    day: calendar.day, month: calendar.monthName, season: calendar.season,
    time, period,
    datetime: `1920-${String(calendar.month).padStart(2, '0')}-${String(calendar.day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    label: `${calendar.day} ${calendar.monthName}, ${time} ${period}. Game time.`,
    hourAngle: (hour % 12) * 30 + minute * 0.5,
    minuteAngle: minute * 6
  };
}

export function renderClock(element, elapsedHours) {
  const view = clockPresentation(elapsedHours);
  element.dateTime = view.datetime;
  element.setAttribute('aria-label', view.label);
  element.innerHTML = `<span class="pocket-watch" aria-hidden="true">
    <svg viewBox="0 0 140 158" class="watch-face">
      <ellipse class="watch-bow" cx="70" cy="13" rx="12" ry="10"/>
      <rect class="watch-crown" x="63" y="17" width="14" height="12" rx="3"/>
      <circle class="watch-case" cx="70" cy="87" r="65"/>
      <circle class="watch-bezel" cx="70" cy="87" r="60"/>
      <circle class="watch-dial" cx="70" cy="87" r="55"/>
      <g transform="translate(70 87)">
        ${Array.from({ length: 60 }, (_, i) => `<path class="watch-tick${i % 5 === 0 ? ' major' : ''}" d="M0 -${i % 5 === 0 ? 44 : 47}V-50" transform="rotate(${i * 6})"/>`).join('')}
        ${['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].map((n, i) => `<text class="watch-numeral" x="${Math.sin(i * Math.PI / 6) * 36}" y="${-Math.cos(i * Math.PI / 6) * 36 + 4}">${n}</text>`).join('')}
        <text class="watch-inscription" y="-16">CALDER BAY</text>
        <path class="watch-hand hour" d="M-2 8L-3 -18L0 -28L3 -18L2 8Z" transform="rotate(${view.hourAngle})"/>
        <path class="watch-hand minute" d="M-1.4 10L-1.8 -30L0 -41L1.8 -30L1.4 10Z" transform="rotate(${view.minuteAngle})"/>
        <circle class="watch-pin" r="3.5"/>
      </g>
    </svg>
  </span>
  <span class="date-leaf" aria-hidden="true">
    <span class="date-month">${view.month}</span>
    <span class="date-day">${String(view.day).padStart(2, '0')}</span>
    <span class="date-season">${view.season}</span>
    <span class="date-time">${view.time} <small>${view.period}</small></span>
  </span>`;
}
