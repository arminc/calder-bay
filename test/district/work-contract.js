import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_BUSINESSES, ALL_JOBS, DISTRICTS, applyAction, createInitialState, sequenceRandom
} from '../../src/engine.js';

const TRAINING_BOOST = { strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 };

export function testDistrictWork(districtId, districtJobs, cases) {
  test(`${DISTRICTS[districtId].name}: work definitions and 1920 wages`, () => {
    assert.deepEqual(Object.keys(districtJobs), cases.map(item => item.id));
    for (const item of cases) {
      const job = districtJobs[item.id];
      assert.equal(ALL_JOBS[item.id], job);
      assert.equal(job.district, DISTRICTS[districtId]);
      assert.equal(ALL_BUSINESSES[job.business.id], job.business);
      assert.equal(job.business.district, job.district);
      assert.ok(job.business.jobIds.includes(item.id));
      assert.equal(job.pay, item.pay);
      assert.equal(job.pay * 5, item.weekly);
      assert.equal(job.education, item.education);
      assert.equal(job.hours, item.hours);
      assert.equal(job.energy, item.energy);
      assert.deepEqual(job.strengthTraining,
        item.strengthChance === undefined ? undefined : { strengthChance: item.strengthChance, ...TRAINING_BOOST });
      assert.equal(Object.hasOwn(job, 'strengthTexts'), item.strengthChance !== undefined);
      assert.ok(Object.isFrozen(job));
    }
  });

  test(`${DISTRICTS[districtId].name}: every shift has a deterministic explained outcome`, () => {
    for (const item of cases) {
      const job = districtJobs[item.id];
      const before = createInitialState();
      before.player.district = districtId;
      before.player.education = item.education;
      const trainsStrength = item.strengthChance !== undefined;
      const result = applyAction(before, { type: 'work', district: districtId, job: item.id },
        { random: sequenceRandom(trainsStrength ? [0] : []) });
      assert.equal(result.state.player.money, Math.round((40 + item.pay) * 100) / 100);
      assert.equal(result.state.player.energy, 100 - item.energy);
      assert.equal(result.state.elapsedHours, item.hours);
      assert.equal(result.state.workProgress[item.id].shifts, 1);
      assert.equal(result.entries[0].facts.business, job.business.id);
      assert.ok(result.entries[0].text.includes(job.business.name));
      assert.deepEqual(result.events.map(event => event.type),
        trainsStrength ? ['work', 'body_adapts'] : ['work']);
      assert.deepEqual({
        job: result.entries[0].facts.job,
        pay: result.entries[0].facts.pay,
        energy: result.entries[0].facts.energy,
        hours: result.entries[0].facts.hours,
        educationRequired: result.entries[0].facts.educationRequired
      }, {
        job: item.id, pay: item.pay, energy: -item.energy,
        hours: item.hours, educationRequired: item.education
      });
      assert.match(result.entries[0].text, new RegExp(`earn \\$${item.pay.toFixed(2).replace('.', '\\.')}`));
    }
  });

  const gated = cases.filter(item => item.education > 0);
  if (gated.length) test(`${DISTRICTS[districtId].name}: education gates leave the save unchanged`, () => {
    for (const item of gated) {
      const before = createInitialState();
      before.player.district = districtId;
      before.player.education = item.education - 1;
      const snapshot = structuredClone(before);
      assert.throws(() => applyAction(before, { type: 'work', district: districtId, job: item.id }),
        new RegExp(`Need education ${item.education}`));
      assert.deepEqual(before, snapshot);
    }
  });
}
