import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const LITTLE_ITALY_BUSINESSES = Object.freeze({
  bellini_family_grocery: new Business({
    id: 'bellini_family_grocery', name: 'Bellini Family Grocery', type: 'grocery shop',
    district: DISTRICTS.little_italy,
    description: 'A narrow neighborhood shop selling produce, dry goods, and household staples on familiar credit.',
    jobIds: ['neighborhood_grocer']
  }),
  moretti_barber_shop: new Business({
    id: 'moretti_barber_shop', name: 'Moretti Barber Shop', type: 'barber shop',
    district: DISTRICTS.little_italy,
    description: 'A three-chair barber shop where neighborhood news travels faster than the clippers.',
    jobIds: []
  }),
  vesuvio_funeral_parlor: new Business({
    id: 'vesuvio_funeral_parlor', name: 'Vesuvio Funeral Parlor', type: 'funeral parlor',
    district: DISTRICTS.little_italy,
    description: 'A somber family undertaking business with a chapel, carriage doors, and deep local obligations.',
    jobIds: []
  })
});
