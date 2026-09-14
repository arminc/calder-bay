import test from 'node:test';
import assert from 'node:assert/strict';
import { DISTRICTS, District } from '../src/district.js';

const ids = [
  'downtown', 'docks', 'little_italy', 'theater_district', 'industrial_district',
  'tenderloin', 'chinatown', 'irish_quarter', 'government_row', 'tenements',
  'high_society', 'balkan_quarter', 'rail_yards', 'university_district',
  'auto_district', 'outskirts'
];

test('the city exposes every immutable district under its stable id', () => {
  assert.deepEqual(Object.keys(DISTRICTS), ids);
  assert.ok(Object.isFrozen(DISTRICTS));
  for (const id of ids) {
    assert.ok(DISTRICTS[id] instanceof District);
    assert.equal(DISTRICTS[id].id, id);
    assert.ok(DISTRICTS[id].name);
    assert.ok(DISTRICTS[id].description);
    assert.ok(Number.isInteger(DISTRICTS[id].position.x));
    assert.ok(Number.isInteger(DISTRICTS[id].position.y));
    assert.ok(Object.isFrozen(DISTRICTS[id].position));
    assert.ok(Object.isFrozen(DISTRICTS[id]));
  }
  assert.equal(new Set(Object.values(DISTRICTS)
    .map(district => `${district.position.x},${district.position.y}`)).size, ids.length);
});
