import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { RAIL_YARD_BUSINESSES } from './business.js';

export const RAIL_YARD_JOBS = Object.freeze({
  freight_switchman: new LegitWork({
    name: 'Freight switchman', district: DISTRICTS.rail_yards,
    business: RAIL_YARD_BUSINESSES.union_freight_yard, pay: 5.6,
    education: 1, hours: 12, energy: 65,
    strengthTraining: { strengthChance: 0.08, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Throwing stiff rail switches has strengthened your hands and back.',
      'You wrench an iced switch over without a second man on the lever.',
      'The yard\'s heaviest levers give way under one steady pull.'
    ]
  })
});
