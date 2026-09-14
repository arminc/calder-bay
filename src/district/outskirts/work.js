import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { OUTSKIRTS_BUSINESSES } from './business.js';

export const OUTSKIRTS_JOBS = Object.freeze({
  farmhand: new LegitWork({
    name: 'Farmhand', district: DISTRICTS.outskirts,
    business: OUTSKIRTS_BUSINESSES.miller_family_farm, pay: 3.2,
    education: 0, hours: 10, energy: 70,
    strengthTraining: { strengthChance: 0.14, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Pitching hay from dawn onward has hardened your shoulders.',
      'You carry full feed sacks from the barn without breaking stride.',
      'A day behind the plow leaves strength to spare at sundown.'
    ]
  })
});
