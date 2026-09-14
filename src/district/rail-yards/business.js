import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const RAIL_YARD_BUSINESSES = Object.freeze({
  union_freight_yard: new Business({
    id: 'union_freight_yard', name: 'Union Freight Yard', type: 'rail yard',
    district: DISTRICTS.rail_yards,
    description: 'A sprawling switching yard sorting inbound freight cars onto warehouse and factory lines.',
    jobIds: ['freight_switchman']
  }),
  national_railway_express: new Business({
    id: 'national_railway_express', name: 'National Railway Express Office', type: 'rail express office',
    district: DISTRICTS.rail_yards,
    description: 'A brick depot office receiving valuable parcels and dispatching them under numbered waybills.',
    jobIds: []
  }),
  switchmans_lunch_counter: new Business({
    id: 'switchmans_lunch_counter', name: "Switchman's Lunch Counter", type: 'lunch counter',
    district: DISTRICTS.rail_yards,
    description: 'A round-the-clock counter feeding rail crews and keeping a cash drawer busy at every shift change.',
    jobIds: []
  })
});
