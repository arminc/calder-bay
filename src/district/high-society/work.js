import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { HIGH_SOCIETY_BUSINESSES } from './business.js';

export const HIGH_SOCIETY_JOBS = Object.freeze({
  private_chauffeur: new LegitWork({
    name: 'Private chauffeur', district: DISTRICTS.high_society,
    business: HIGH_SOCIETY_BUSINESSES.whitmore_estate, pay: 7,
    education: 1, hours: 10, energy: 25
  })
});
