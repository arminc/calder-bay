import { createArrivalStory } from './arrival-story.js';
import { createArrivalAudio } from './arrival-audio.js';

export function playArrivalIntro({ document, player, onComplete, settings = {}, audioFactory = createArrivalAudio, schedule = setTimeout, cancel = clearTimeout, reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false }) {
  const root = document.getElementById('arrival-intro');
  const get = id => document.getElementById(`arrival-${id}`);
  const scenes = createArrivalStory(player);
  // Effects stay intelligible independently of the quieter in-game music mix.
  const audio = audioFactory({ volume: .8 });
  let index = 0, timer, finished = false, paused = reducedMotion, muted = settings.musicEnabled === false;
  const soundAvailable = audio.start();
  audio.mute(muted);
  const sound = () => {
    get('sound').textContent = soundAvailable ? (muted ? 'Sound off' : 'Sound on') : 'Sound unavailable';
    get('sound').setAttribute('aria-pressed', String(!muted && soundAvailable));
    get('sound').disabled = !soundAvailable;
  };
  const pause = () => {
    root.classList.toggle('is-paused', paused);
    get('pause').textContent = paused ? 'Play' : 'Pause';
    get('pause').setAttribute('aria-pressed', String(paused));
    audio.pause(paused || document.hidden);
  };
  const arm = () => {
    cancel(timer);
    if (!paused && !document.hidden) timer = schedule(next, 12000);
  };
  const render = () => {
    const scene = scenes[index];
    root.dataset.shot = scene.shot;
    get('label').textContent = scene.label;
    get('title').textContent = scene.title;
    get('text').textContent = scene.text;
    get('count').textContent = `0${index + 1} / 04`;
    get('next').textContent = index === scenes.length - 1 ? 'Begin your life →' : 'Continue →';
    audio.scene(index); arm();
  };
  const finish = () => {
    if (finished) return;
    finished = true; cancel(timer); audio.stop(); root.hidden = true;
    for (const [element, event, handler] of listeners) element.removeEventListener(event, handler);
    onComplete();
  };
  function next() { if (finished) return; if (index === scenes.length - 1) finish(); else { index++; render(); } }
  const listeners = [
    [get('next'), 'click', next],
    [get('skip'), 'click', finish],
    [get('pause'), 'click', () => { paused = !paused; pause(); arm(); }],
    [get('sound'), 'click', () => { muted = !muted; audio.mute(muted); sound(); }],
    [document, 'visibilitychange', () => { pause(); arm(); }],
    [document, 'keydown', event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }]
  ];
  listeners.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  root.hidden = false;
  document.title = 'Calder Bay — Arrival';
  sound(); render(); pause(); get('next').focus();
  return { finish };
}
