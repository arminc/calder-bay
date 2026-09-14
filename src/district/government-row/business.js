import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const GOVERNMENT_ROW_BUSINESSES = Object.freeze({
  municipal_records_office: new Business({
    id: 'municipal_records_office', name: 'Municipal Records Office', type: 'public office',
    district: DISTRICTS.government_row,
    description: 'The city office where permits, deeds, licenses, and case files pass through ordered ledgers.',
    jobIds: ['municipal_records_clerk']
  })
});
