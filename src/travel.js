// Travel is deliberately district-to-district rather than street-to-street.
// Movement inside the player's current district costs no additional time.
import { DISTRICTS, District } from './district.js';

export const TRAVEL_MODES = Object.freeze({
  walk: Object.freeze({
    id: 'walk', name: 'walk', baseHours: 0, hoursPerTile: 0.5, costPerTile: 0,
    description: 'Walk about thirty minutes per district tile without spending money.'
  }),
  public_transit: Object.freeze({
    id: 'public_transit', name: 'public transportation', baseHours: 0,
    hoursPerTile: 0.25, costPerTile: 0.05,
    description: 'Ride streetcars and local rail, paying another five-cent fare for each district tile.'
  }),
  taxi: Object.freeze({
    id: 'taxi', name: 'taxi', baseHours: 0, hoursPerTile: 0.25, costPerTile: 0.2,
    description: 'Pay twenty cents per district tile for a direct, private ride.'
  })
});

function asDistrict(value) {
  const district = typeof value === 'string' ? DISTRICTS[value] : value;
  if (!(district instanceof District)) throw new Error(`Unknown district: ${value}`);
  return district;
}

export function districtDistance(from, to) {
  const origin = asDistrict(from);
  const destination = asDistrict(to);
  return Math.abs(origin.position.x - destination.position.x) +
    Math.abs(origin.position.y - destination.position.y);
}

export function quoteTravel(from, to, modeId) {
  const mode = TRAVEL_MODES[modeId];
  if (!mode) throw new Error(`Unknown travel mode: ${modeId}`);
  const distance = districtDistance(from, to);
  return Object.freeze({
    distance,
    hours: Math.round((mode.baseHours + mode.hoursPerTile * distance) * 100) / 100,
    cost: Math.round(mode.costPerTile * distance * 100) / 100
  });
}
