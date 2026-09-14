import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { IRISH_QUARTER_BUSINESSES } from './business.js';

export const IRISH_QUARTER_JOBS = Object.freeze({
  union_teamster: new LegitWork({
    name: 'Union teamster', district: DISTRICTS.irish_quarter,
    business: IRISH_QUARTER_BUSINESSES.emerald_cartage_cooperative, pay: 5.6,
    education: 0, hours: 10, energy: 65,
    strengthTraining: { strengthChance: 0.12, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Loading the union wagons has put weight behind your arms.',
      'You shift a loaded barrel without waiting for the rest of the crew.',
      'Long freight runs leave your stance as solid as the wagon bed.'
    ]
  })
});
