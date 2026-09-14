import { ALL_HOMES, ALL_JOBS, DISTRICTS, clockAt, createInitialState } from '../src/engine.js';

export const SAVE_FORMAT = 'calder-bay-save';
export const SAVE_FORMAT_VERSION = 1;
export const SAVE_STORAGE_KEY = 'calder-bay.save.slot.1';
export const SAVE_LIBRARY_KEY = 'calder-bay.save.library.1';

const CURRENT_STATE_VERSION = createInitialState().version;
const STATE_KEYS = Object.freeze([
  'version', 'nextEventId', 'nextNpcId', 'totalJournalEntries', 'elapsedHours', 'calendar',
  'player', 'crime', 'lodging', 'workProgress', 'journal'
]);

const fail = message => { throw new Error(`Invalid Calder Bay save: ${message}`); };
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const assertRecord = (value, label) => { if (!isRecord(value)) fail(`${label} must be an object.`); };
const assertFinite = (value, label) => { if (!Number.isFinite(value)) fail(`${label} must be a finite number.`); };
const assertNonnegativeInteger = (value, label) => {
  if (!Number.isInteger(value) || value < 0) fail(`${label} must be a nonnegative integer.`);
};
const sameKeys = (value, keys) => {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
};

function assertJsonData(value, path = 'save') {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail(`${path} contains a non-finite number.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonData(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) fail(`${path} contains a value that JSON cannot preserve.`);
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) fail(`${path} contains an unsafe key.`);
    assertJsonData(item, `${path}.${key}`);
  }
}

export function validateSaveState(state) {
  assertRecord(state, 'state');
  if (!sameKeys(state, STATE_KEYS)) fail('state has missing or unknown top-level fields.');
  if (state.version !== CURRENT_STATE_VERSION)
    fail(`engine state version ${state.version} is not supported; expected ${CURRENT_STATE_VERSION}.`);
  for (const key of ['nextEventId', 'nextNpcId', 'totalJournalEntries'])
    assertNonnegativeInteger(state[key], key);
  assertFinite(state.elapsedHours, 'elapsedHours');
  if (state.elapsedHours < 0) fail('elapsedHours cannot be negative.');

  assertRecord(state.player, 'player');
  if (!Object.hasOwn(DISTRICTS, state.player.district)) fail('player district is unknown.');
  for (const key of ['age', 'money', 'energy', 'finesse', 'strength', 'education'])
    assertFinite(state.player[key], `player.${key}`);
  assertRecord(state.player.birthday, 'player.birthday');

  const expectedClock = clockAt(state.elapsedHours);
  if (JSON.stringify(state.calendar) !== JSON.stringify(expectedClock))
    fail('calendar does not match elapsedHours.');

  assertRecord(state.crime, 'crime');
  assertNonnegativeInteger(state.crime.pickpocketAttempts, 'crime.pickpocketAttempts');
  assertNonnegativeInteger(state.crime.pickpocketSuccesses, 'crime.pickpocketSuccesses');
  if (state.crime.prospects !== null) {
    assertRecord(state.crime.prospects, 'crime.prospects');
    if (!Object.hasOwn(DISTRICTS, state.crime.prospects.district)) fail('prospect district is unknown.');
    if (!Array.isArray(state.crime.prospects.npcs)) fail('crime.prospects.npcs must be an array.');
    assertFinite(state.crime.prospects.expiresAtHour, 'crime.prospects.expiresAtHour');
  }

  assertRecord(state.lodging, 'lodging');
  assertRecord(state.lodging.homes, 'lodging.homes');
  const progressHomes = Object.values(ALL_HOMES).filter(home => home.rental || home.purchase).map(home => home.id);
  if (!sameKeys(state.lodging.homes, progressHomes)) fail('lodging progress does not match the current homes.');

  assertRecord(state.workProgress, 'workProgress');
  if (!sameKeys(state.workProgress, Object.keys(ALL_JOBS)))
    fail('work progress does not match the current jobs.');
  if (!Array.isArray(state.journal)) fail('journal must be an array.');
  if (state.journal.length > 200) fail('journal exceeds the engine limit.');

  assertJsonData(state, 'state');
  return structuredClone(state);
}

export function createSaveDocument(state, { savedAt = new Date().toISOString() } = {}) {
  if (typeof savedAt !== 'string' || !Number.isFinite(Date.parse(savedAt)))
    fail('savedAt must be an ISO date string.');
  return {
    format: SAVE_FORMAT,
    formatVersion: SAVE_FORMAT_VERSION,
    savedAt,
    state: validateSaveState(state)
  };
}

export function serializeSave(state, options) {
  return JSON.stringify(createSaveDocument(state, options), null, 2);
}

export function parseSave(text) {
  if (typeof text !== 'string' || !text.trim()) fail('file is empty.');
  let document;
  try { document = JSON.parse(text); }
  catch { fail('file is not valid JSON.'); }
  assertRecord(document, 'document');
  if (!sameKeys(document, ['format', 'formatVersion', 'savedAt', 'state']))
    fail('document has missing or unknown top-level fields.');
  if (document.format !== SAVE_FORMAT) fail(`format must be "${SAVE_FORMAT}".`);
  if (document.formatVersion !== SAVE_FORMAT_VERSION)
    fail(`format version ${document.formatVersion} is not supported.`);
  if (typeof document.savedAt !== 'string' || !Number.isFinite(Date.parse(document.savedAt)))
    fail('savedAt is invalid.');
  return {
    format: document.format,
    formatVersion: document.formatVersion,
    savedAt: document.savedAt,
    state: validateSaveState(document.state)
  };
}

export function createSaveStore(storage, { key = SAVE_STORAGE_KEY } = {}) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function' ||
      typeof storage.removeItem !== 'function')
    throw new Error('A Web Storage-compatible object is required.');
  const libraryKey = key === SAVE_STORAGE_KEY ? SAVE_LIBRARY_KEY : `${key}.library`;
  const emptyLibrary = () => ({ format: 'calder-bay-save-library', formatVersion: 1, slots: [] });
  const validateLibrary = value => {
    if (!isRecord(value) || value.format !== 'calder-bay-save-library' || value.formatVersion !== 1 ||
        !Array.isArray(value.slots)) fail('browser save library is invalid.');
    const ids = new Set();
    value.slots.forEach((slot, index) => {
      if (!isRecord(slot) || typeof slot.id !== 'string' || !slot.id || typeof slot.name !== 'string' ||
          !slot.name.trim() || !isRecord(slot.save)) fail(`browser save slot ${index + 1} is invalid.`);
      if (ids.has(slot.id)) fail('browser save library contains duplicate slots.');
      ids.add(slot.id);
      parseSave(JSON.stringify(slot.save));
    });
    return value;
  };
  const write = library => storage.setItem(libraryKey, JSON.stringify(library));
  const read = () => {
    const stored = storage.getItem(libraryKey);
    if (stored !== null) {
      try { return validateLibrary(JSON.parse(stored)); }
      catch (error) {
        if (error.message.startsWith('Invalid Calder Bay save:')) throw error;
        fail('browser save library is not valid JSON.');
      }
    }
    const library = emptyLibrary();
    const legacy = storage.getItem(key);
    if (legacy !== null) {
      const save = parseSave(legacy);
      library.slots.push({ id: 'legacy-save', name: 'Original save', save });
      write(library);
      storage.removeItem(key);
    }
    return library;
  };
  const uniqueId = (library, savedAt) => {
    const base = `save-${savedAt.replace(/[^0-9]/g, '')}`;
    let id = base, suffix = 2;
    while (library.slots.some(slot => slot.id === id)) id = `${base}-${suffix++}`;
    return id;
  };
  const cleanName = name => {
    if (typeof name !== 'string' || !name.trim()) throw new Error('Give this saved game a name.');
    return name.trim().slice(0, 80);
  };
  const cloneSlot = slot => ({
    id: slot.id, name: slot.name, savedAt: slot.save.savedAt, state: structuredClone(slot.save.state)
  });
  return {
    has: () => read().slots.length > 0,
    list: () => read().slots.map(cloneSlot).sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    save(state, { id = null, name = 'Saved game' } = {}) {
      const library = read();
      const save = createSaveDocument(state);
      const slot = id ? library.slots.find(item => item.id === id) : null;
      if (id && !slot) throw new Error('That saved game no longer exists.');
      if (slot) {
        slot.name = cleanName(name);
        slot.save = save;
      } else {
        library.slots.push({ id: uniqueId(library, save.savedAt), name: cleanName(name), save });
      }
      write(library);
      return cloneSlot(slot || library.slots.at(-1));
    },
    load(id = null) {
      const slots = read().slots;
      if (!slots.length) throw new Error('No saved game exists in this browser.');
      const slot = id ? slots.find(item => item.id === id) : slots[0];
      if (!slot) throw new Error('That saved game no longer exists.');
      return cloneSlot(slot);
    },
    export(id) {
      const library = read();
      const slot = library.slots.find(item => item.id === id);
      if (!slot) throw new Error('That saved game no longer exists.');
      return JSON.stringify(slot.save, null, 2);
    },
    import(text, { name = 'Imported save' } = {}) {
      const save = parseSave(text);
      const library = read();
      const slot = { id: uniqueId(library, save.savedAt), name: cleanName(name), save };
      library.slots.push(slot);
      write(library);
      return cloneSlot(slot);
    },
    clear(id = null) {
      if (id === null) {
        storage.removeItem(libraryKey);
        storage.removeItem(key);
        return;
      }
      const library = read();
      const index = library.slots.findIndex(item => item.id === id);
      if (index < 0) throw new Error('That saved game no longer exists.');
      library.slots.splice(index, 1);
      write(library);
    }
  };
}
