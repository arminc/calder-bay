import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { BALKAN_QUARTER_BUSINESSES } from './business.js';

export const BALKAN_QUARTER_JOBS = Object.freeze({
  bakery_hand: new LegitWork({
    name: 'Neighborhood bakery hand', district: DISTRICTS.balkan_quarter,
    business: BALKAN_QUARTER_BUSINESSES.danube_bakery, pay: 4.4,
    education: 0, hours: 10, energy: 45
  })
});
