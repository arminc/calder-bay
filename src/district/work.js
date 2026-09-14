// One import point for the engine; definitions remain beside their districts.
import { AUTO_DISTRICT_JOBS } from './auto-district/work.js';
import { BALKAN_QUARTER_JOBS } from './balkan-quarter/work.js';
import { CHINATOWN_JOBS } from './chinatown/work.js';
import { DOCK_JOBS } from './docks/work.js';
import { DOWNTOWN_JOBS } from './downtown/work.js';
import { GOVERNMENT_ROW_JOBS } from './government-row/work.js';
import { HIGH_SOCIETY_JOBS } from './high-society/work.js';
import { INDUSTRIAL_DISTRICT_JOBS } from './industrial-district/work.js';
import { IRISH_QUARTER_JOBS } from './irish-quarter/work.js';
import { LITTLE_ITALY_JOBS } from './little-italy/work.js';
import { OUTSKIRTS_JOBS } from './outskirts/work.js';
import { RAIL_YARD_JOBS } from './rail-yards/work.js';
import { TENEMENT_JOBS } from './tenements/work.js';
import { TENDERLOIN_JOBS } from './tenderloin/work.js';
import { THEATER_DISTRICT_JOBS } from './theater-district/work.js';
import { UNIVERSITY_DISTRICT_JOBS } from './university-district/work.js';

export { DOCK_JOBS } from './docks/work.js';

export const DISTRICT_JOBS = Object.freeze({
  ...DOWNTOWN_JOBS,
  ...LITTLE_ITALY_JOBS,
  ...THEATER_DISTRICT_JOBS,
  ...INDUSTRIAL_DISTRICT_JOBS,
  ...TENDERLOIN_JOBS,
  ...CHINATOWN_JOBS,
  ...IRISH_QUARTER_JOBS,
  ...GOVERNMENT_ROW_JOBS,
  ...TENEMENT_JOBS,
  ...HIGH_SOCIETY_JOBS,
  ...BALKAN_QUARTER_JOBS,
  ...RAIL_YARD_JOBS,
  ...UNIVERSITY_DISTRICT_JOBS,
  ...AUTO_DISTRICT_JOBS,
  ...OUTSKIRTS_JOBS
});

export const ALL_JOBS = Object.freeze({ ...DOCK_JOBS, ...DISTRICT_JOBS });
