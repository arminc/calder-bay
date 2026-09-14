import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const BALKAN_QUARTER_BUSINESSES = Object.freeze({
  danube_bakery: new Business({
    id: 'danube_bakery', name: 'Danube Bakery', type: 'bakery',
    district: DISTRICTS.balkan_quarter,
    description: 'A family bakery supplying dark loaves and pastries to cafes and neighborhood households.',
    jobIds: ['bakery_hand']
  })
});
