import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const HIGH_SOCIETY_BUSINESSES = Object.freeze({
  whitmore_estate: new Business({
    id: 'whitmore_estate', name: 'Whitmore Estate', type: 'private estate',
    district: DISTRICTS.high_society,
    description: 'A guarded hilltop household maintaining cars and staff for a prominent family.',
    jobIds: ['private_chauffeur']
  })
});
