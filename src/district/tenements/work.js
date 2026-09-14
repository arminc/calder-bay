import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { TENEMENT_BUSINESSES } from './business.js';

export const TENEMENT_JOBS = Object.freeze({
  coal_delivery_hand: new LegitWork({
    name: 'Coal delivery hand', district: DISTRICTS.tenements,
    business: TENEMENT_BUSINESSES.ward_coal_and_ice, pay: 3.6,
    education: 0, hours: 10, energy: 70,
    strengthTraining: { strengthChance: 0.14, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Carrying coal up tenement stairs has thickened your arms.',
      'You take two flights at a time with a full sack on your shoulder.',
      'The steepest tenement stairs no longer slow your deliveries.'
    ]
  })
});
