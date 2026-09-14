import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { LITTLE_ITALY_BUSINESSES } from './business.js';

export const LITTLE_ITALY_JOBS = Object.freeze({
  neighborhood_grocer: new LegitWork({
    name: 'Neighborhood grocer', district: DISTRICTS.little_italy,
    business: LITTLE_ITALY_BUSINESSES.bellini_family_grocery, pay: 4,
    education: 0, hours: 10, energy: 35
  })
});
