import test from 'node:test';
import assert from 'node:assert/strict';
import { playArrivalIntro } from '../ui/arrival-intro.js';
import { createArrivalStory } from '../ui/arrival-story.js';
import { createSession } from '../ui/session.js';
import { serializeSave, parseSave } from '../ui/save-game.js';

function fixture(options = {}) {
  const nodes = new Map();
  const element = () => ({ hidden: true, dataset: {}, textContent: '', classList: { toggle() {} }, listeners: {}, setAttribute() {}, focus() {}, addEventListener(type, handler) { this.listeners[type] = handler; }, removeEventListener(type) { delete this.listeners[type]; } });
  const document = Object.assign(element(), { hidden: false, getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); } });
  let timer, completed = 0, stopped = 0, suspended, muted;
  const session = createSession(), before = session.snapshot();
  const controller = playArrivalIntro({ document, player: before.player, onComplete() { completed++; }, schedule(fn) { timer = fn; return 1; }, cancel() { timer = null; }, audioFactory: () => ({ start: () => true, scene() {}, stop() { stopped++; }, mute(value) { muted = value; }, pause(value) { suspended = value; } }), reducedMotion: false, ...options });
  return { document, session, before, controller, node: id => document.getElementById(`arrival-${id}`), click(id) { this.node(id).listeners.click(); }, tick() { timer?.(); }, get timer() { return timer; }, get completed() { return completed; }, get stopped() { return stopped; }, get suspended() { return suspended; }, get muted() { return muted; } };
}

test('arrival story is deterministic, uses the saved identity, and supports older unnamed players', () => {
  const player = createSession().snapshot().player;
  assert.deepEqual(createArrivalStory(player), createArrivalStory(structuredClone(player)));
  assert.match(createArrivalStory({ ...player, name: 'Marco Rossi', age: 21 })[0].text, /Marco Rossi, 21 years old/);
  assert.match(createArrivalStory({ age: 19 })[0].text, /Luca Bellini/);
  assert.equal(parseSave(serializeSave(createSession().snapshot())).state.player.name, player.name);
});

test('four automatic scenes enter the city exactly once without advancing or changing the simulation', () => {
  const f = fixture();
  assert.equal(f.node('count').textContent, '01 / 04');
  f.tick(); f.tick(); f.tick();
  assert.equal(f.node('count').textContent, '04 / 04');
  assert.equal(f.completed, 0);
  f.tick(); f.controller.finish();
  assert.equal(f.completed, 1); assert.equal(f.stopped, 1); assert.equal(f.timer, null);
  assert.equal(f.document.getElementById('arrival-intro').hidden, true);
  assert.deepEqual(f.session.snapshot(), f.before);
  assert.deepEqual(f.node('next').listeners, {});
});

test('pause, continue, mute, hidden tab and skip keep control of playback', () => {
  const f = fixture({ settings: { musicEnabled: false } });
  assert.equal(f.muted, true);
  f.click('sound'); assert.equal(f.muted, false);
  f.click('pause'); assert.equal(f.timer, null); assert.equal(f.suspended, true);
  f.click('next'); assert.equal(f.node('count').textContent, '02 / 04'); assert.equal(f.timer, null);
  f.click('pause'); assert.ok(f.timer);
  f.document.hidden = true; f.document.listeners.visibilitychange();
  assert.equal(f.timer, null); assert.equal(f.suspended, true);
  f.document.hidden = false; f.document.listeners.visibilitychange(); assert.ok(f.timer);
  f.click('skip'); assert.equal(f.completed, 1); assert.equal(f.stopped, 1);
});

test('reduced motion starts with manual advancement and Escape ends the intro', () => {
  const f = fixture({ reducedMotion: true });
  assert.equal(f.timer, null); assert.equal(f.node('pause').textContent, 'Play');
  f.document.listeners.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(f.completed, 1);
});
