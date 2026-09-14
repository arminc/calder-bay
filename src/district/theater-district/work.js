import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { THEATER_DISTRICT_BUSINESSES } from './business.js';

export const THEATER_DISTRICT_JOBS = Object.freeze({
  theater_stagehand: new LegitWork({
    name: 'Theater stagehand', district: DISTRICTS.theater_district,
    business: THEATER_DISTRICT_BUSINESSES.majestic_theatre, pay: 5,
    education: 0, hours: 8, energy: 55,
    strengthTraining: { strengthChance: 0.08, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Hauling scenery between acts has steadied your shoulders.',
      'You swing a painted flat into place without calling for another hand.',
      'Even the largest set pieces move cleanly when you take their weight.'
    ]
  })
});
