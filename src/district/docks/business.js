import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const DOCK_BUSINESSES = Object.freeze({
  atlas_freight_company: new Business({
    id: 'atlas_freight_company', name: 'Atlas Freight Company', type: 'freight company',
    district: DISTRICTS.docks,
    description: 'A pier-side freight concern that hires crews to move cargo between holds, cranes, and warehouses.',
    jobIds: ['stevedore']
  }),
  federal_ship_and_iron_works: new Business({
    id: 'federal_ship_and_iron_works', name: 'Federal Ship & Iron Works',
    type: 'shipyard and ironworks', district: DISTRICTS.docks,
    description: 'A noisy waterfront yard where structural iron and heavy ship plate are fitted and repaired.',
    jobIds: ['ironworker', 'ship_fabrication']
  }),
  harbor_fish_exchange: new Business({
    id: 'harbor_fish_exchange', name: 'Harbor Fish Exchange', type: 'wholesale fish market',
    district: DISTRICTS.docks,
    description: 'An early-morning market where fishing crews and wholesalers bargain over iced crates of catch.',
    jobIds: []
  }),
  crown_customs_brokerage: new Business({
    id: 'crown_customs_brokerage', name: 'Crown Customs Brokerage', type: 'customs brokerage',
    district: DISTRICTS.docks,
    description: 'A pier office handling manifests, fees, and the paperwork that releases imported cargo.',
    jobIds: []
  })
});
