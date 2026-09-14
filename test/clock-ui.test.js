import test from 'node:test';
import assert from 'node:assert/strict';
import { clockPresentation, renderClock } from '../ui/clock.js';
import { createSession } from '../ui/session.js';

test('watch hands and readable time agree at midnight, noon and fractional hours', () => {
  for (const [hours, time, period, hourAngle, minuteAngle] of [
    [0, '12:00', 'AM', 0, 0], [12, '12:00', 'PM', 0, 0],
    [15.5, '3:30', 'PM', 105, 180], [23.75, '11:45', 'PM', 352.5, 270]
  ]) {
    const view = clockPresentation(hours);
    assert.deepEqual([view.time, view.period, view.hourAngle, view.minuteAngle],
      [time, period, hourAngle, minuteAngle]);
  }
});

test('calendar leaf follows midnight, month, season and repeated year boundaries', () => {
  assert.equal(clockPresentation(23.999).day, 2);
  assert.equal(clockPresentation(23.999).time, '12:00');
  assert.equal(clockPresentation(30 * 24).month, 'July');
  assert.equal(clockPresentation(20 * 24).season, 'summer');
  assert.equal(clockPresentation(214 * 24).datetime, '1920-01-01T00:00');
  assert.equal(clockPresentation(365 * 24).label, clockPresentation(0).label);
  for (const hours of [-1, NaN, Infinity]) assert.throws(() => clockPresentation(hours));
});

test('rendering game time preserves simulation state and exposes an accessible date', () => {
  const session = createSession(), before = session.snapshot();
  const attributes = {};
  const element = { setAttribute(name, value) { attributes[name] = value; } };
  renderClock(element, before.elapsedHours);
  assert.equal(element.dateTime, '1920-06-01T00:00');
  assert.equal(attributes['aria-label'], '1 June, 12:00 AM. Game time.');
  assert.match(element.innerHTML, /date-month">June/);
  assert.match(element.innerHTML, /date-day">01/);
  assert.match(element.innerHTML, /CALDER BAY/);
  renderClock(element, 15.5);
  assert.match(element.innerHTML, /rotate\(105\)/);
  assert.match(element.innerHTML, /rotate\(180\)/);
  assert.deepEqual(session.snapshot(), before);
});
