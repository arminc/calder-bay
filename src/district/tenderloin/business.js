import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const TENDERLOIN_BUSINESSES = Object.freeze({
  red_lantern_card_room: new Business({
    id: 'red_lantern_card_room', name: 'Red Lantern Card Room', type: 'card room',
    district: DISTRICTS.tenderloin,
    description: 'A discreet upstairs gambling room where steady hands deal through the late hours.',
    jobIds: ['card_room_dealer']
  }),
  crescent_pawn_and_loan: new Business({
    id: 'crescent_pawn_and_loan', name: 'Crescent Pawn & Loan', type: 'pawnshop',
    district: DISTRICTS.tenderloin,
    description: 'A barred pawnshop trading small loans for watches, instruments, tools, and other portable collateral.',
    jobIds: []
  }),
  gardenia_dance_hall: new Business({
    id: 'gardenia_dance_hall', name: 'Gardenia Dance Hall', type: 'dance hall',
    district: DISTRICTS.tenderloin,
    description: 'A crowded dance hall collecting cover charges beneath bright signs and watchful floor men.',
    jobIds: []
  })
});
