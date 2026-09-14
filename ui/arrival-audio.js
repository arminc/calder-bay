// Four edited field-recording mixes. No synthesized substitute is used.
export const ARRIVAL_TRACKS = Object.freeze([
  './ui/assets/audio/arrival/crossing.mp3',
  './ui/assets/audio/arrival/harbor.mp3',
  './ui/assets/audio/arrival/landing.mp3',
  './ui/assets/audio/arrival/city.mp3'
]);

export function createArrivalAudio({
  AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext,
  fetcher = globalThis.fetch,
  volume = .8,
  tracks = ARRIVAL_TRACKS
} = {}) {
  let context, master, source, wantedScene = null, loadId = 0;
  const recordings = new Map();
  const level = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : .8));

  const fadeOut = active => {
    if (!active) return;
    active.level.gain.setTargetAtTime(0, context.currentTime, .055);
    active.node.stop(context.currentTime + .3);
  };
  const play = index => {
    const buffer = recordings.get(index);
    if (!buffer || !master || context.state === 'closed') return;
    if (source?.index === index) return;
    fadeOut(source);
    const node = context.createBufferSource(), channel = context.createGain();
    channel.gain.value = 0;
    channel.connect(master);
    node.buffer = buffer;
    node.loop = true;
    node.connect(channel);
    node.start();
    channel.gain.setTargetAtTime(1, context.currentTime, .055);
    source = { node, level: channel, index };
  };
  const load = () => {
    const currentLoad = ++loadId;
    tracks.forEach((path, index) => {
      Promise.resolve(fetcher(path))
        .then(response => {
          if (!response.ok) throw new Error(`Arrival sound failed: ${path}`);
          return response.arrayBuffer();
        })
        .then(data => context.decodeAudioData(data))
        .then(buffer => {
          if (currentLoad !== loadId || context.state === 'closed') return;
          recordings.set(index, buffer);
          if (wantedScene === index) play(index);
        })
        .catch(() => {});
    });
  };

  return {
    start() {
      if (!AudioContext || typeof fetcher !== 'function') return false;
      try {
        context = new AudioContext();
        if (typeof context.decodeAudioData !== 'function') {
          context.close().catch(() => {});
          return false;
        }
        master = context.createGain();
        master.gain.value = level;
        master.connect(context.destination);
        context.resume().catch(() => {});
        load();
        return true;
      } catch {
        context?.close().catch(() => {});
        return false;
      }
    },
    scene(index) {
      if (!master || context.state === 'closed') return;
      wantedScene = index;
      if (recordings.has(index)) play(index);
      else if (source) {
        fadeOut(source);
        source = null;
      }
    },
    mute(value) {
      if (master) master.gain.setTargetAtTime(value ? 0 : level, context.currentTime, .025);
    },
    pause(value) {
      if (context && context.state !== 'closed') (value ? context.suspend() : context.resume()).catch(() => {});
    },
    stop() {
      loadId++;
      if (context && context.state !== 'closed') context.close().catch(() => {});
      recordings.clear();
    }
  };
}
