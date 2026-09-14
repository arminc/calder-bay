import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const IRISH_QUARTER_BUSINESSES = Object.freeze({
  emerald_cartage_cooperative: new Business({
    id: 'emerald_cartage_cooperative', name: 'Emerald Cartage Cooperative', type: 'cartage company',
    district: DISTRICTS.irish_quarter,
    description: 'A union cartage concern moving freight from the piers by wagon and motor truck.',
    jobIds: ['union_teamster']
  })
});
