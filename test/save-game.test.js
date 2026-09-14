import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, createInitialState } from '../src/engine.js';
import {
  SAVE_FORMAT, SAVE_FORMAT_VERSION, createSaveDocument, createSaveStore, parseSave, serializeSave
} from '../ui/save-game.js';

test('a save is versioned JSON that round-trips the complete engine state', () => {
  const state = applyAction(createInitialState(),
    { type: 'travel', to: 'tenements', mode: 'walk' }, { random: () => 0.5 }).state;
  const text = serializeSave(state, { savedAt: '2026-09-14T12:00:00.000Z' });
  const save = parseSave(text);
  assert.equal(save.format, SAVE_FORMAT);
  assert.equal(save.formatVersion, SAVE_FORMAT_VERSION);
  assert.equal(save.savedAt, '2026-09-14T12:00:00.000Z');
  assert.deepEqual(save.state, state);
  save.state.player.money = 999;
  assert.notEqual(state.player.money, 999);
});

test('the browser save slot restores a state and reports whether it exists', () => {
  const data = new Map();
  const storage = {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
  const store = createSaveStore(storage);
  assert.equal(store.has(), false);
  const state = createInitialState();
  store.save(state);
  assert.equal(store.has(), true);
  assert.deepEqual(store.load().state, state);
  store.clear();
  assert.equal(store.has(), false);
});

test('multiple named browser saves remain independent and can be overwritten or deleted', () => {
  const data = new Map();
  const storage = {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
  const store = createSaveStore(storage);
  const firstState = createInitialState();
  const secondState = createInitialState();
  secondState.player.money = 25;
  const first = store.save(firstState, { name: 'Docks beginning' });
  const second = store.save(secondState, { name: 'Lean times' });
  assert.notEqual(first.id, second.id);
  assert.deepEqual(new Set(store.list().map(slot => slot.name)), new Set(['Docks beginning', 'Lean times']));
  assert.equal(store.load(first.id).state.player.money, 40);
  assert.equal(store.load(second.id).state.player.money, 25);
  secondState.player.money = 70;
  store.save(secondState, { id: second.id, name: 'A recovery' });
  assert.equal(store.load(second.id).state.player.money, 70);
  assert.equal(store.load(second.id).name, 'A recovery');
  store.clear(first.id);
  assert.deepEqual(store.list().map(slot => slot.name), ['A recovery']);
});

test('exported saves import into a new named slot without changing their state or timestamp', () => {
  const data = new Map();
  const storage = {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
  const store = createSaveStore(storage);
  const state = createInitialState();
  state.player.money = 31.25;
  const source = store.save(state, { name: 'Before the job' });
  const exported = store.export(source.id);
  const imported = store.import(exported, { name: 'Copy from file' });
  assert.notEqual(imported.id, source.id);
  assert.equal(imported.name, 'Copy from file');
  assert.equal(imported.savedAt, source.savedAt);
  assert.deepEqual(imported.state, state);
  assert.equal(parseSave(exported).state.player.money, 31.25);
});

test('the original single browser save migrates into the named save library', () => {
  const data = new Map([['old-slot', serializeSave(createInitialState(), { savedAt: '2026-09-14T12:00:00.000Z' })]]);
  const storage = {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
  const store = createSaveStore(storage, { key: 'old-slot' });
  assert.deepEqual(store.list().map(slot => slot.name), ['Original save']);
  assert.equal(data.has('old-slot'), false);
  assert.equal(store.load().savedAt, '2026-09-14T12:00:00.000Z');
});

test('malformed, incompatible and internally inconsistent saves are rejected', () => {
  assert.throws(() => parseSave('not json'), /not valid JSON/);
  const wrongFormat = createSaveDocument(createInitialState(), { savedAt: '2026-09-14T12:00:00.000Z' });
  wrongFormat.formatVersion++;
  assert.throws(() => parseSave(JSON.stringify(wrongFormat)), /format version/);
  const wrongClock = createSaveDocument(createInitialState(), { savedAt: '2026-09-14T12:00:00.000Z' });
  wrongClock.state.calendar.day++;
  assert.throws(() => parseSave(JSON.stringify(wrongClock)), /calendar does not match/);
});
