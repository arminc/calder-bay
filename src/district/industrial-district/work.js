import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { INDUSTRIAL_DISTRICT_BUSINESSES } from './business.js';

export const INDUSTRIAL_DISTRICT_JOBS = Object.freeze({
  warehouse_porter: new LegitWork({
    name: 'Warehouse porter', district: DISTRICTS.industrial_district,
    business: INDUSTRIAL_DISTRICT_BUSINESSES.great_lakes_storage, pay: 4.8,
    education: 0, hours: 10, energy: 70,
    strengthTraining: { strengthChance: 0.14, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Stacking cases to the rafters has hardened your back and arms.',
      'You carry loads that once needed a handcart.',
      'A full warehouse day no longer leaves your grip trembling.'
    ]
  })
});
