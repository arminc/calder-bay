// Work types live here. District files construct the work available in each place.
// A job definition is immutable. Per-player progress belongs in the save state.
// All pay is in 1920 U.S. dollars; consult economic_anchors.md when setting it.
import { District } from './district.js';
import { Business } from './business.js';

export const WORK_PROGRESS_FIELDS = Object.freeze({
  shifts: 'Total completed shifts at this job.',
  streak: 'Shifts at this job since its last strength gain.',
  strengthGains: 'Total strength gains earned at this job; selects its strength text, capped at the last text.',
  strengthChance: 'Current chance of a strength gain at this job, or null if it does not train strength.'
});

// Work definitions are shared; progress belongs to one game's state, per job.
export function createWorkProgress(jobs) {
  return Object.fromEntries(Object.entries(jobs).map(([key, job]) => [key, {
    shifts: 0,
    streak: 0,
    strengthGains: 0,
    strengthChance: job.strengthTraining?.strengthChance ?? null
  }]));
}

export const LEGIT_WORK_FIELDS = Object.freeze({
  name: 'Name shown to the player and in the journal.',
  district: 'District object where the job is available.',
  business: 'Business object where the job is performed.',
  pay: '1920 U.S. dollars earned for one completed shift.',
  education: 'Minimum education needed to take the job.',
  hours: 'Time in hours consumed by one shift.',
  energy: 'Energy needed and consumed by one shift.',
  strengthTexts: 'One to three job-specific lines, used in order as strength gains accumulate.',
  strengthTraining: Object.freeze({
    strengthChance: 'Initial probability (0–1) of a strength gain on each shift.',
    strengthGain: 'Strength points awarded when the training roll succeeds.',
    minChanceGainPoints: 'Minimum percentage-point increase to the next chance after a failed roll.',
    maxChanceGainPoints: 'Maximum inclusive percentage-point increase after a failed roll.'
  })
});

const REQUIRED = ['name', 'district', 'business', 'pay', 'education', 'hours', 'energy'];
const GROUPS = ['strengthTraining'];

function checkShape(value, fields, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${label} must be an object.`);
  for (const key of Object.keys(value))
    if (!Object.hasOwn(fields, key)) throw new Error(`Unknown ${label} attribute: ${key}`);
}

function checkNumber(value, label, { integer = false, positive = false } = {}) {
  if (!Number.isFinite(value) || value < 0 || (positive && value === 0))
    throw new Error(`Invalid LegitWork ${label}: ${value}`);
  if (integer && !Number.isInteger(value)) throw new Error(`LegitWork ${label} must be an integer.`);
}

export class LegitWork {
  constructor(values) {
    checkShape(values, LEGIT_WORK_FIELDS, 'LegitWork');
    for (const key of REQUIRED)
      if (!Object.hasOwn(values, key)) throw new Error(`LegitWork needs ${key}.`);
    if (typeof values.name !== 'string' || !values.name.trim())
      throw new Error('LegitWork needs a nonempty name.');
    if (!(values.district instanceof District))
      throw new Error('LegitWork district must be a District object.');
    if (!(values.business instanceof Business))
      throw new Error('LegitWork business must be a Business object.');
    if (values.business.district !== values.district)
      throw new Error('LegitWork business must be in the job district.');
    for (const key of ['pay', 'education', 'hours', 'energy'])
      checkNumber(values[key], key,
        { integer: key !== 'pay', positive: key === 'hours' });
    if (Math.abs(values.pay * 100 - Math.round(values.pay * 100)) > 1e-8)
      throw new Error('LegitWork pay must be in cents.');

    for (const group of GROUPS) {
      if (!Object.hasOwn(values, group)) continue;
      checkShape(values[group], LEGIT_WORK_FIELDS[group], `LegitWork ${group}`);
      for (const key of Object.keys(LEGIT_WORK_FIELDS[group]))
        if (!Object.hasOwn(values[group], key)) throw new Error(`LegitWork ${group} needs ${key}.`);
      for (const key of Object.keys(LEGIT_WORK_FIELDS[group]))
        checkNumber(values[group][key], `${group}.${key}`,
          { integer: key !== 'strengthChance',
            positive: group === 'strengthTraining' && (key === 'strengthChance' || key === 'strengthGain') });
    }
    if (values.strengthTraining) {
      if (values.strengthTraining.strengthChance > 1) throw new Error('LegitWork strengthChance must be at most 1.');
      if (values.strengthTraining.minChanceGainPoints > values.strengthTraining.maxChanceGainPoints)
        throw new Error('LegitWork minimum chance boost exceeds maximum.');
    }
    if (Object.hasOwn(values, 'strengthTexts')) {
      if (!values.strengthTraining) throw new Error('LegitWork strengthTexts requires strengthTraining.');
      if (!Array.isArray(values.strengthTexts) || values.strengthTexts.length < 1 || values.strengthTexts.length > 3 ||
          values.strengthTexts.some(text => typeof text !== 'string' || !text.trim()))
        throw new Error('LegitWork strengthTexts needs one to three nonempty strings.');
    }

    for (const key of REQUIRED) this[key] = values[key];
    if (values.strengthTexts) this.strengthTexts = Object.freeze([...values.strengthTexts]);
    for (const group of GROUPS)
      if (values[group]) this[group] = Object.freeze({ ...values[group] });
    Object.freeze(this);
  }
}
