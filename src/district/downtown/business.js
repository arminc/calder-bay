import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const DOWNTOWN_BUSINESSES = Object.freeze({
  first_city_bank: new Business({
    id: 'first_city_bank', name: 'First City Bank', type: 'bank', district: DISTRICTS.downtown,
    description: 'A marble-fronted commercial bank whose sealed documents cross downtown by trusted messenger.',
    jobIds: ['bank_messenger']
  }),
  hawthorne_jewelers: new Business({
    id: 'hawthorne_jewelers', name: 'Hawthorne Jewelers', type: 'jewelry shop',
    district: DISTRICTS.downtown,
    description: 'A discreet jewelry shop displaying watches and gemstones behind thick glass and an iron grille.',
    jobIds: []
  }),
  continental_department_store: new Business({
    id: 'continental_department_store', name: 'Continental Department Store', type: 'department store',
    district: DISTRICTS.downtown,
    description: 'A many-floored emporium whose tills, loading doors, and storerooms stay busy throughout the day.',
    jobIds: []
  })
});
