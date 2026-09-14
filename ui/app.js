import { playArrivalIntro } from './arrival-intro.js';
import { createSession } from './session.js';
import { showCity } from './city-screen.js';
import { mountStartMenu } from './start-menu.js?v=20260915-2';
import { createSaveStore } from './save-game.js?v=20260915-2';
import { createMusicController, createSettingsStore, mountSettings } from './settings.js';

const settingsStore = createSettingsStore(localStorage);
const music = createMusicController({
  audio: document.getElementById('background-music'),
  settingsStore
});

mountSettings({ document, settingsStore, music });
mountStartMenu({
  document,
  createSession,
  showCity,
  saveStore: createSaveStore(localStorage),
  playIntro: options => playArrivalIntro({ document, ...options, settings: music.getSettings() }),
  onGameOpen: () => music.start()
});
