export const SETTINGS_STORAGE_KEY = 'calder-bay.settings';
export const DEFAULT_SETTINGS = Object.freeze({ musicEnabled: true, musicVolume: 0.35 });
export const MUSIC_PLAYLIST = Object.freeze([
  'ui/assets/audio/le-parrain-de-minuit.mp3',
  'ui/assets/audio/the-great-days-of-chicago.mp3',
  'ui/assets/audio/swingin-nights.mp3'
]);

function normalizeSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_SETTINGS };
  const volume = Number(value.musicVolume);
  return {
    musicEnabled: typeof value.musicEnabled === 'boolean' ? value.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
    musicVolume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_SETTINGS.musicVolume
  };
}

export function createSettingsStore(storage, { key = SETTINGS_STORAGE_KEY } = {}) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function')
    throw new Error('A Web Storage-compatible object is required.');
  return {
    load() {
      const text = storage.getItem(key);
      if (text === null) return { ...DEFAULT_SETTINGS };
      try { return normalizeSettings(JSON.parse(text)); }
      catch { return { ...DEFAULT_SETTINGS }; }
    },
    save(settings) {
      const normalized = normalizeSettings(settings);
      storage.setItem(key, JSON.stringify(normalized));
      return { ...normalized };
    }
  };
}

export function createMusicController({ audio, settingsStore, tracks = MUSIC_PLAYLIST }) {
  if (!audio || typeof audio.play !== 'function' || typeof audio.pause !== 'function')
    throw new Error('An HTML audio element is required.');
  if (!Array.isArray(tracks) || tracks.length === 0)
    throw new Error('At least one music track is required.');
  let settings = settingsStore.load();
  let started = false;
  let trackIndex = 0;

  const play = () => {
    const attempt = audio.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
  };

  const apply = () => {
    audio.loop = tracks.length === 1;
    audio.volume = settings.musicVolume;
    audio.muted = !settings.musicEnabled;
    if (!started) return;
    if (!settings.musicEnabled) {
      audio.pause();
      return;
    }
    play();
  };

  audio.src = tracks[trackIndex];
  audio.addEventListener('ended', () => {
    trackIndex = (trackIndex + 1) % tracks.length;
    audio.src = tracks[trackIndex];
    audio.load?.();
    if (started && settings.musicEnabled) play();
  });

  apply();
  return {
    start() { started = true; apply(); },
    update(nextSettings) {
      settings = settingsStore.save(nextSettings);
      apply();
      return { ...settings };
    },
    getSettings: () => ({ ...settings })
  };
}

export function mountSettings({ document, settingsStore, music }) {
  const panel = document.getElementById('settings-panel');
  const menuButton = document.getElementById('settings');
  const gameButton = document.getElementById('game-settings');
  const closeButton = document.getElementById('close-settings');
  const enabledInput = document.getElementById('music-enabled');
  const volumeInput = document.getElementById('music-volume');
  const volumeValue = document.getElementById('music-volume-value');
  let returnFocus = null;

  const render = settings => {
    enabledInput.checked = settings.musicEnabled;
    volumeInput.value = String(Math.round(settings.musicVolume * 100));
    volumeInput.disabled = !settings.musicEnabled;
    volumeValue.textContent = `${volumeInput.value}%`;
  };
  const persist = () => render(music.update({
    musicEnabled: enabledInput.checked,
    musicVolume: Number(volumeInput.value) / 100
  }));
  const open = event => {
    returnFocus = event?.currentTarget ?? null;
    render(settingsStore.load());
    panel.hidden = false;
    closeButton.focus();
  };
  const close = () => {
    panel.hidden = true;
    returnFocus?.focus?.();
  };

  menuButton.addEventListener('click', open);
  gameButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  enabledInput.addEventListener('change', persist);
  volumeInput.addEventListener('input', persist);
  panel.addEventListener('click', event => { if (event.target === panel) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) close();
  });
  render(music.getSettings());
}
