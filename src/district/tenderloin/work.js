import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { TENDERLOIN_BUSINESSES } from './business.js';

export const TENDERLOIN_JOBS = Object.freeze({
  card_room_dealer: new LegitWork({
    name: 'Card-room dealer', district: DISTRICTS.tenderloin,
    business: TENDERLOIN_BUSINESSES.red_lantern_card_room, pay: 5.5,
    education: 1, hours: 10, energy: 30
  })
});
