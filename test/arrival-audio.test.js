import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ARRIVAL_TRACKS, createArrivalAudio } from '../ui/arrival-audio.js';

test('the four arrival shots use the checked-in field-recording mixes', () => {
  const expected = [
    'a9f068d08811fc42e65795544a36b07ce8601d873e7ecf5848f19631084b3fb1',
    '6b931e6011194c86bc03cbb94fdbf65274412890da9cfdbda983074df3d1ab7f',
    '2b6f8a33845587b097eb3d4938b40e38d551068670e521ac5d1a5bcd2868c535',
    '39dfebc59cb9e5124ec7aa3a07196b6b9f61f57585f91353918bf161d3ee6fb9'
  ];
  assert.equal(ARRIVAL_TRACKS.length, 4);
  const actual = ARRIVAL_TRACKS.map(track => {
    const bytes = readFileSync(new URL(`../${track.slice(2)}`, import.meta.url));
    assert.ok(bytes.length > 200_000, `${track} contains a full scene mix`);
    return createHash('sha256').update(bytes).digest('hex');
  });
  assert.deepEqual(actual, expected);
});

test('decoded recordings replace each other and pause, mute and stop control the mix', async () => {
  const sources = [];
  let context, volume;
  class Context {
    constructor() { context = this; this.state = 'running'; this.currentTime = 0; }
    createGain() { return { gain: { set value(value) { volume = value; }, setTargetAtTime(value) { volume = value; } }, connect() {} }; }
    createBufferSource() { const source = { connect() {}, start() { this.started = true; }, stop() { this.stopped = true; } }; sources.push(source); return source; }
    async decodeAudioData(data) { return { data }; }
    async resume() { this.state = 'running'; }
    async suspend() { this.state = 'suspended'; }
    async close() { this.state = 'closed'; }
  }
  const fetcher = async path => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode(path).buffer });
  const audio = createArrivalAudio({ AudioContext: Context, fetcher, volume: .8 });
  assert.equal(audio.start(), true);
  audio.scene(0);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(sources[0].loop, true);
  assert.equal(sources[0].started, true);
  audio.scene(2);
  assert.equal(sources[0].stopped, true);
  assert.equal(sources[1].started, true);
  audio.mute(true); assert.equal(volume, 0);
  audio.mute(false); assert.equal(volume, .8);
  audio.pause(true); assert.equal(context.state, 'suspended');
  audio.pause(false); assert.equal(context.state, 'running');
  audio.stop(); assert.equal(context.state, 'closed');
  audio.scene(3); assert.equal(sources.length, 2);
  assert.equal(createArrivalAudio({ AudioContext: null }).start(), false);
});

test('missing decoding support disables sound instead of using a synthetic fallback', () => {
  class Context {
    constructor() { this.state = 'running'; }
    async close() { this.state = 'closed'; }
  }
  assert.equal(createArrivalAudio({ AudioContext: Context, fetcher() {} }).start(), false);
});
