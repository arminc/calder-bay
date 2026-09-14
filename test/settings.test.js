import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS, MUSIC_PLAYLIST, SETTINGS_STORAGE_KEY, createMusicController, createSettingsStore
} from '../ui/settings.js';

function memoryStorage(initial = new Map()) {
  return {
    data: initial,
    getItem: key => initial.has(key) ? initial.get(key) : null,
    setItem: (key, value) => initial.set(key, value)
  };
}

test('settings default safely and persist normalized music preferences', () => {
  const storage = memoryStorage();
  const store = createSettingsStore(storage);
  assert.deepEqual(store.load(), DEFAULT_SETTINGS);
  assert.deepEqual(store.save({ musicEnabled: false, musicVolume: 4 }), {
    musicEnabled: false, musicVolume: 1
  });
  assert.deepEqual(JSON.parse(storage.data.get(SETTINGS_STORAGE_KEY)), {
    musicEnabled: false, musicVolume: 1
  });

  storage.data.set(SETTINGS_STORAGE_KEY, '{broken');
  assert.deepEqual(store.load(), DEFAULT_SETTINGS);
});

test('the soundtrack uses the three licensed Pixabay recordings in order', () => {
  assert.deepEqual(MUSIC_PLAYLIST, [
    'ui/assets/audio/le-parrain-de-minuit.mp3',
    'ui/assets/audio/the-great-days-of-chicago.mp3',
    'ui/assets/audio/swingin-nights.mp3'
  ]);
});

test('music waits for a player gesture, then responds deterministically to settings', async () => {
  const storage = memoryStorage();
  const store = createSettingsStore(storage);
  let plays = 0, pauses = 0;
  const listeners = new Map();
  const audio = {
    loop: false, volume: 1, muted: false, src: '',
    play() { plays++; return Promise.resolve(); },
    pause() { pauses++; },
    addEventListener(event, listener) { listeners.set(event, listener); }
  };
  const tracks = ['first.mp3', 'second.mp3'];
  const music = createMusicController({ audio, settingsStore: store, tracks });
  assert.equal(audio.loop, false);
  assert.equal(audio.src, tracks[0]);
  assert.equal(audio.volume, 0.35);
  assert.equal(plays, 0);

  music.start();
  assert.equal(plays, 1);
  listeners.get('ended')();
  assert.equal(audio.src, tracks[1]);
  assert.equal(plays, 2);
  listeners.get('ended')();
  assert.equal(audio.src, tracks[0]);
  assert.equal(plays, 3);
  music.update({ musicEnabled: true, musicVolume: 0.62 });
  assert.equal(audio.volume, 0.62);
  assert.equal(plays, 4);
  music.update({ musicEnabled: false, musicVolume: 0.62 });
  assert.equal(audio.muted, true);
  assert.equal(pauses, 1);
});
