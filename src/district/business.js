// One import point for the engine; definitions remain beside their districts.
import { AUTO_DISTRICT_BUSINESSES } from './auto-district/business.js';
import { BALKAN_QUARTER_BUSINESSES } from './balkan-quarter/business.js';
import { CHINATOWN_BUSINESSES } from './chinatown/business.js';
import { DOCK_BUSINESSES } from './docks/business.js';
import { DOWNTOWN_BUSINESSES } from './downtown/business.js';
import { GOVERNMENT_ROW_BUSINESSES } from './government-row/business.js';
import { HIGH_SOCIETY_BUSINESSES } from './high-society/business.js';
import { INDUSTRIAL_DISTRICT_BUSINESSES } from './industrial-district/business.js';
import { IRISH_QUARTER_BUSINESSES } from './irish-quarter/business.js';
import { LITTLE_ITALY_BUSINESSES } from './little-italy/business.js';
import { OUTSKIRTS_BUSINESSES } from './outskirts/business.js';
import { RAIL_YARD_BUSINESSES } from './rail-yards/business.js';
import { TENEMENT_BUSINESSES } from './tenements/business.js';
import { TENDERLOIN_BUSINESSES } from './tenderloin/business.js';
import { THEATER_DISTRICT_BUSINESSES } from './theater-district/business.js';
import { UNIVERSITY_DISTRICT_BUSINESSES } from './university-district/business.js';

export const DISTRICT_BUSINESSES = Object.freeze({
  downtown: DOWNTOWN_BUSINESSES,
  docks: DOCK_BUSINESSES,
  little_italy: LITTLE_ITALY_BUSINESSES,
  theater_district: THEATER_DISTRICT_BUSINESSES,
  industrial_district: INDUSTRIAL_DISTRICT_BUSINESSES,
  tenderloin: TENDERLOIN_BUSINESSES,
  chinatown: CHINATOWN_BUSINESSES,
  irish_quarter: IRISH_QUARTER_BUSINESSES,
  government_row: GOVERNMENT_ROW_BUSINESSES,
  tenements: TENEMENT_BUSINESSES,
  high_society: HIGH_SOCIETY_BUSINESSES,
  balkan_quarter: BALKAN_QUARTER_BUSINESSES,
  rail_yards: RAIL_YARD_BUSINESSES,
  university_district: UNIVERSITY_DISTRICT_BUSINESSES,
  auto_district: AUTO_DISTRICT_BUSINESSES,
  outskirts: OUTSKIRTS_BUSINESSES
});

export const ALL_BUSINESSES = Object.freeze(Object.fromEntries(
  Object.values(DISTRICT_BUSINESSES).flatMap(businesses => Object.entries(businesses))
));
