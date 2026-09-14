import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { GOVERNMENT_ROW_BUSINESSES } from './business.js';

export const GOVERNMENT_ROW_JOBS = Object.freeze({
  municipal_records_clerk: new LegitWork({
    name: 'Municipal records clerk', district: DISTRICTS.government_row,
    business: GOVERNMENT_ROW_BUSINESSES.municipal_records_office, pay: 6,
    education: 2, hours: 8, energy: 20
  })
});
