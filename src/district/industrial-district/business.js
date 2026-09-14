import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const INDUSTRIAL_DISTRICT_BUSINESSES = Object.freeze({
  great_lakes_storage: new Business({
    id: 'great_lakes_storage', name: 'Great Lakes Storage Company', type: 'warehouse',
    district: DISTRICTS.industrial_district,
    description: 'A block-long commercial warehouse stacked with crated goods awaiting city distribution.',
    jobIds: ['warehouse_porter']
  }),
  american_ribbon_mill: new Business({
    id: 'american_ribbon_mill', name: 'American Ribbon Mill', type: 'textile mill',
    district: DISTRICTS.industrial_district,
    description: 'A brick mill where belts drive rows of looms and finished cloth leaves through a guarded yard.',
    jobIds: []
  }),
  monarch_cold_storage: new Business({
    id: 'monarch_cold_storage', name: 'Monarch Cold Storage', type: 'cold-storage warehouse',
    district: DISTRICTS.industrial_district,
    description: 'An insulated warehouse holding meat and produce for grocers, hotels, and restaurants across the city.',
    jobIds: []
  })
});
