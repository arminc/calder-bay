import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { CHINATOWN_BUSINESSES } from './business.js';

export const CHINATOWN_JOBS = Object.freeze({
  apothecary_assistant: new LegitWork({
    name: 'Apothecary assistant', district: DISTRICTS.chinatown,
    business: CHINATOWN_BUSINESSES.golden_crane_apothecary, pay: 5,
    education: 1, hours: 10, energy: 30
  })
});
