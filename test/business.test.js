import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_BUSINESSES, ALL_JOBS, BUSINESS_FIELDS, Business, DISTRICT_BUSINESSES, DISTRICTS,
  LegitWork
} from '../src/engine.js';

test('every district has immutable businesses with stable world attributes', () => {
  assert.deepEqual(Object.keys(DISTRICT_BUSINESSES), Object.keys(DISTRICTS));
  assert.ok(Object.isFrozen(DISTRICT_BUSINESSES));
  assert.equal(Object.keys(ALL_BUSINESSES).length, 31);

  for (const [districtId, businesses] of Object.entries(DISTRICT_BUSINESSES)) {
    assert.ok(Object.keys(businesses).length > 0);
    assert.ok(Object.isFrozen(businesses));
    for (const [id, business] of Object.entries(businesses)) {
      assert.ok(business instanceof Business);
      assert.equal(business.id, id);
      assert.equal(business.district, DISTRICTS[districtId]);
      assert.equal(ALL_BUSINESSES[id], business);
      assert.ok(business.name);
      assert.ok(business.type);
      assert.ok(business.description);
      assert.ok(Object.isFrozen(business.jobIds));
      assert.ok(Object.isFrozen(business));
    }
  }
});

test('business and job registries have complete two-way workplace links', () => {
  for (const [jobId, job] of Object.entries(ALL_JOBS)) {
    assert.equal(ALL_BUSINESSES[job.business.id], job.business);
    assert.equal(job.business.district, job.district);
    assert.ok(job.business.jobIds.includes(jobId));
  }

  for (const business of Object.values(ALL_BUSINESSES))
    for (const jobId of business.jobIds) {
      assert.equal(ALL_JOBS[jobId]?.business, business);
      assert.equal(ALL_JOBS[jobId]?.district, business.district);
    }
});

test('selected districts expose dormant businesses without creating jobs or actions', () => {
  const dormantByDistrict = {
    downtown: ['hawthorne_jewelers', 'continental_department_store'],
    docks: ['harbor_fish_exchange', 'crown_customs_brokerage'],
    little_italy: ['moretti_barber_shop', 'vesuvio_funeral_parlor'],
    theater_district: ['orpheum_cabaret', 'regency_hotel'],
    industrial_district: ['american_ribbon_mill', 'monarch_cold_storage'],
    tenderloin: ['crescent_pawn_and_loan', 'gardenia_dance_hall'],
    rail_yards: ['national_railway_express', 'switchmans_lunch_counter']
  };

  for (const [districtId, ids] of Object.entries(dormantByDistrict))
    for (const id of ids) {
      assert.equal(DISTRICT_BUSINESSES[districtId][id], ALL_BUSINESSES[id]);
      assert.deepEqual(ALL_BUSINESSES[id].jobIds, []);
      assert.equal(ALL_JOBS[id], undefined);
    }
});

test('Business validates its documented shape and district placement data', () => {
  assert.deepEqual(Object.keys(BUSINESS_FIELDS),
    ['id', 'name', 'type', 'district', 'description', 'jobIds']);
  const base = {
    id: 'test_shop', name: 'Test Shop', type: 'shop', district: DISTRICTS.docks,
    description: 'A test workplace.', jobIds: ['test_job']
  };
  assert.throws(() => new Business({ ...base, extra: true }), /Unknown Business attribute/);
  assert.throws(() => new Business({ ...base, district: 'docks' }), /must be a District/);
  assert.deepEqual(new Business({ ...base, jobIds: [] }).jobIds, []);
  assert.throws(() => new Business({ ...base, jobIds: 'test_job' }), /must be an array/);
  assert.throws(() => new Business({ ...base, jobIds: [''] }), /nonempty/);
  assert.throws(() => new Business({ ...base, jobIds: ['test_job', 'test_job'] }), /duplicates/);
});

test('LegitWork requires a Business in the same district', () => {
  const base = {
    name: 'Test work', district: DISTRICTS.docks, pay: 1,
    education: 0, hours: 1, energy: 0
  };
  assert.throws(() => new LegitWork(base), /needs business/);
  assert.throws(() => new LegitWork({
    ...base, business: ALL_BUSINESSES.first_city_bank
  }), /must be in the job district/);
});
