// One immutable citywide registry; only five districts deliberately offer housing.
import { DOCK_HOMES } from './docks/home.js';
import { HIGH_SOCIETY_HOMES } from './high-society/home.js';
import { LITTLE_ITALY_HOMES } from './little-italy/home.js';
import { OUTSKIRTS_HOMES } from './outskirts/home.js';
import { TENEMENT_HOMES } from './tenements/home.js';

export const DISTRICT_HOMES = Object.freeze({
  docks: DOCK_HOMES,
  tenements: TENEMENT_HOMES,
  little_italy: LITTLE_ITALY_HOMES,
  outskirts: OUTSKIRTS_HOMES,
  high_society: HIGH_SOCIETY_HOMES
});

export const ALL_HOMES = Object.freeze(Object.fromEntries(
  Object.values(DISTRICT_HOMES).flatMap(homes => Object.entries(homes))
));

export { DOCK_HOMES, TENEMENT_HOMES, LITTLE_ITALY_HOMES, OUTSKIRTS_HOMES, HIGH_SOCIETY_HOMES };
