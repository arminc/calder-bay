import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { DOWNTOWN_BUSINESSES } from './business.js';

export const DOWNTOWN_JOBS = Object.freeze({
  bank_messenger: new LegitWork({
    name: 'Bank messenger', district: DISTRICTS.downtown,
    business: DOWNTOWN_BUSINESSES.first_city_bank, pay: 5,
    education: 1, hours: 8, energy: 25
  })
});
