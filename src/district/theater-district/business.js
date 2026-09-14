import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const THEATER_DISTRICT_BUSINESSES = Object.freeze({
  majestic_theatre: new Business({
    id: 'majestic_theatre', name: 'Majestic Theatre', type: 'theater',
    district: DISTRICTS.theater_district,
    description: 'A busy playhouse whose scenery and rigging must be reset between performances.',
    jobIds: ['theater_stagehand']
  }),
  orpheum_cabaret: new Business({
    id: 'orpheum_cabaret', name: 'Orpheum Cabaret', type: 'cabaret',
    district: DISTRICTS.theater_district,
    description: 'A fashionable late-night room selling music, dancing, and expensive tables beneath electric lights.',
    jobIds: []
  }),
  regency_hotel: new Business({
    id: 'regency_hotel', name: 'Regency Hotel', type: 'hotel',
    district: DISTRICTS.theater_district,
    description: 'An ornate hotel serving touring performers, wealthy visitors, and discreet private meetings.',
    jobIds: []
  })
});
