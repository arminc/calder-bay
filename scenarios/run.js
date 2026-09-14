import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { applyAction, createInitialState } from '../src/engine.js';
import { PLAYTHROUGHS } from './playthroughs.js';

function exactRandom(draws, label) {
  let used = 0;
  return {
    next() {
      if (used >= draws.length) throw new Error(`${label}: unexpected random draw ${used + 1}`);
      return draws[used++];
    },
    verify() { assert.equal(used, draws.length, `${label}: unused random draws`); }
  };
}

export function runPlaythrough(name) {
  const scenario = PLAYTHROUGHS[name];
  if (!scenario) throw new Error(`Unknown playthrough: ${name}. Available: ${Object.keys(PLAYTHROUGHS).join(', ')}`);
  let state = createInitialState();
  if (scenario.startingMoney !== undefined) state.player.money = scenario.startingMoney;
  if (scenario.startingEnergy !== undefined) state.player.energy = scenario.startingEnergy;
  const steps = [];
  for (const [index, step] of scenario.steps.entries()) {
    const label = `${name} step ${index + 1} (${step.label})`;
    const before = structuredClone(state);
    const random = exactRandom(step.draws ?? [], label);
    const result = applyAction(state, step.action, { random: () => random.next() });
    random.verify();
    assert.deepEqual(state, before, `${label}: input state was mutated`);
    assert.ok(result.entries.length, `${label}: no narrative explanation`);
    for (const entry of result.entries) assert.ok(entry.text, `${label}: empty narrative reason`);
    for (const [eventIndex, event] of result.events.entries()) {
      if (eventIndex === 0) assert.equal(event.causeId, null, `${label}: root event has a cause`);
      else assert.ok(result.events.slice(0, eventIndex).some(prior => prior.id === event.causeId),
        `${label}: ${event.type} has no earlier causal event`);
    }
    for (const entry of result.entries) assert.ok(result.events.some(event => event.id === entry.eventId),
      `${label}: ${entry.type} is not linked to an event`);
    if (step.events) assert.deepEqual(result.events.map(event => event.type), step.events, `${label}: event chain`);
    for (const [path, expected] of Object.entries(step.expect)) {
      const actual = path.split('.').reduce((value, key) => value?.[key], result.state);
      assert.deepEqual(actual, expected, `${label}: ${path}`);
    }
    state = result.state;
    steps.push({ number: index + 1, label: step.label, action: step.action, draws: step.draws ?? [],
      expected: step.expect, events: result.events, entries: result.entries });
  }
  return { name, description: scenario.description, steps, finalState: state };
}

function main(args) {
  const json = args.includes('--json');
  const names = args.filter(arg => arg !== '--json');
  if (names.length && names.some(name => !Object.hasOwn(PLAYTHROUGHS, name)))
    throw new Error(`Available playthroughs: ${Object.keys(PLAYTHROUGHS).join(', ')}`);
  const runs = (names.length ? names : Object.keys(PLAYTHROUGHS)).map(runPlaythrough);
  if (json) {
    process.stdout.write(`${JSON.stringify(runs, null, 2)}\n`);
    return;
  }
  for (const run of runs) {
    console.log(`\n${run.name}: ${run.description}`);
    for (const step of run.steps) {
      console.log(`  ${step.number}. ${step.label} [draws: ${JSON.stringify(step.draws)}]`);
      for (const entry of step.entries) console.log(`     ${entry.type}: ${entry.text}`);
      console.log(`     checked: ${JSON.stringify(step.expected)}`);
    }
    console.log(`  PASS — ${run.steps.length} steps; final money $${run.finalState.player.money.toFixed(2)} (1920 USD)`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error); process.exitCode = 1; }
}
