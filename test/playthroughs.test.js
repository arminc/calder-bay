import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYTHROUGHS } from '../scenarios/playthroughs.js';
import { runPlaythrough } from '../scenarios/run.js';

for (const [name, scenario] of Object.entries(PLAYTHROUGHS)) {
  test(`playthrough: ${name} — ${scenario.description}`, () => {
    const run = runPlaythrough(name);
    assert.deepEqual(runPlaythrough(name), run, 'replaying the same actions and draws is deterministic');
    assert.equal(run.steps.length, scenario.steps.length);
    assert.equal(run.finalState.totalJournalEntries,
      run.steps.reduce((total, step) => total + step.entries.length, 0));
  });
}
