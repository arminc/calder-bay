import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const OUTSKIRTS_BUSINESSES = Object.freeze({
  miller_family_farm: new Business({
    id: 'miller_family_farm', name: 'Miller Family Farm', type: 'farm',
    district: DISTRICTS.outskirts,
    description: 'A working farm of fields, livestock, and weathered barns beyond the paved roads.',
    jobIds: ['farmhand']
  })
});
