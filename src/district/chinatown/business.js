import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const CHINATOWN_BUSINESSES = Object.freeze({
  golden_crane_apothecary: new Business({
    id: 'golden_crane_apothecary', name: 'Golden Crane Apothecary', type: 'apothecary shop',
    district: DISTRICTS.chinatown,
    description: 'A respected herbal and medicinal shop serving families throughout the quarter.',
    jobIds: ['apothecary_assistant']
  })
});
