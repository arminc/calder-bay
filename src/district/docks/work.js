// Five shifts pay $20–$28, matching the 1920 industrial-labor band in
// economic_anchors.md.
import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { DOCK_BUSINESSES } from './business.js';

export const DOCK_JOBS = Object.freeze({
  stevedore: new LegitWork({
    name: 'Cargo handler', district: DISTRICTS.docks,
    business: DOCK_BUSINESSES.atlas_freight_company, pay: 4,
    education: 0, hours: 12, energy: 80,
    strengthTraining: { strengthChance: 0.16, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'The first crates that used to take two men now move under your grip.',
      'You shoulder loaded cargo without stopping at the gangplank.',
      'The heaviest crates leave your hands steady at the end of the shift.'
    ]
  }),
  ironworker: new LegitWork({
    name: 'Ironworker', district: DISTRICTS.docks,
    business: DOCK_BUSINESSES.federal_ship_and_iron_works, pay: 5,
    education: 0, hours: 12, energy: 80,
    strengthTraining: { strengthChance: 0.12, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Handling iron all day has made the tools feel lighter in your hands.',
      'You hold a beam in place long enough for the riveters to finish.',
      'The crew trusts you to steady the heaviest iron without a second pair of hands.'
    ]
  }),
  ship_fabrication: new LegitWork({
    name: 'Ship fabrication · heavy metal work', district: DISTRICTS.docks,
    business: DOCK_BUSINESSES.federal_ship_and_iron_works, pay: 5.6,
    education: 0, hours: 12, energy: 80,
    strengthTraining: { strengthChance: 0.08, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 },
    strengthTexts: [
      'Lifting heavy plate at the fabrication bench has strengthened your arms.',
      'You guide a stubborn sheet of metal into place without calling for help.',
      'The thickest plates no longer force you to put down your tools and rest.'
    ]
  })
});
