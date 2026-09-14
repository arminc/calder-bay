import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const TENEMENT_BUSINESSES = Object.freeze({
  ward_coal_and_ice: new Business({
    id: 'ward_coal_and_ice', name: 'Ward Coal & Ice Yard', type: 'coal yard',
    district: DISTRICTS.tenements,
    description: 'A cramped fuel yard dispatching coal sacks to walk-up buildings across the tenements.',
    jobIds: ['coal_delivery_hand']
  })
});
