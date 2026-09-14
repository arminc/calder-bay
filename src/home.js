// Home definitions are shared and immutable. Rental and ownership progress belong to one game.
// All costs are 1920 U.S. dollars; consult economic_anchors.md when changing them.
import { District } from './district.js';
import { seasonalSleepModifiers } from './calendar.js';

export const HOME_FIELDS = Object.freeze({
  id: 'Stable key used in actions, game state, and journal facts.',
  name: 'Player-facing name of the home option.',
  district: 'District where this option is available.',
  description: 'Short description shown when choosing a home.',
  shelter: 'Seasonal protection: exposed, poor, standard, great, or best.',
  sleepHours: 'Hours consumed by one rest.',
  nightlyCost: '1920 U.S. dollars paid on each rest.',
  badSleepChance: 'Probability from 0 to 1 that the night is disturbed.',
  goodEnergy: 'Potential energy restored by a good rest.',
  badEnergy: 'Potential energy restored by a bad rest.',
  goodSleepText: 'Narrative reason for a good rest.',
  badSleepText: 'Narrative reason for a bad rest.',
  rental: Object.freeze({
    cost: '1920 U.S. dollars paid to start or renew a rental.',
    durationHours: 'Hours of access bought by one rental payment.',
    setupHours: 'Time spent arranging or renewing the rental.'
  }),
  purchase: Object.freeze({
    cost: '1920 U.S. dollars paid once to own the property.',
    setupHours: 'Time spent completing the purchase.',
    maintenanceCost: '1920 U.S. dollars paid for each maintenance period.',
    maintenanceDurationHours: 'Hours of maintained access bought by one upkeep payment.',
    maintenanceHours: 'Time spent arranging upkeep.'
  })
});

const isCents = value => Number.isFinite(value) && value >= 0 &&
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
const isPositiveInteger = value => Number.isInteger(value) && value > 0;

export class Home {
  constructor(values) {
    if (!values || typeof values !== 'object' || Array.isArray(values))
      throw new Error('Home must be an object.');
    for (const key of Object.keys(values))
      if (!Object.hasOwn(HOME_FIELDS, key)) throw new Error(`Unknown Home attribute: ${key}`);
    for (const key of ['id', 'name', 'description', 'goodSleepText', 'badSleepText'])
      if (typeof values[key] !== 'string' || !values[key].trim())
        throw new Error(`Home needs a nonempty ${key}.`);
    if (!(values.district instanceof District)) throw new Error('Home district must be a District object.');
    if (!['exposed', 'poor', 'standard', 'great', 'best'].includes(values.shelter))
      throw new Error('Home shelter must be exposed, poor, standard, great, or best.');
    for (const key of ['sleepHours', 'goodEnergy', 'badEnergy'])
      if (!isPositiveInteger(values[key])) throw new Error(`Home ${key} must be a positive integer.`);
    if (values.badEnergy > values.goodEnergy) throw new Error('Home badEnergy cannot exceed goodEnergy.');
    if (!Number.isFinite(values.badSleepChance) || values.badSleepChance < 0 || values.badSleepChance > 1)
      throw new Error('Home badSleepChance must be between 0 and 1.');
    if (!isCents(values.nightlyCost)) throw new Error('Home nightlyCost must be a nonnegative 1920-dollar amount in cents.');
    if (values.rental !== undefined) {
      const rental = values.rental;
      if (!rental || typeof rental !== 'object' || Array.isArray(rental)) throw new Error('Home rental must be an object.');
      for (const key of Object.keys(rental))
        if (!Object.hasOwn(HOME_FIELDS.rental, key)) throw new Error(`Unknown Home rental attribute: ${key}`);
      if (!isCents(rental.cost) || rental.cost === 0) throw new Error('Home rental cost must be positive cents.');
      for (const key of ['durationHours', 'setupHours'])
        if (!isPositiveInteger(rental[key])) throw new Error(`Home rental ${key} must be a positive integer.`);
      if (values.nightlyCost !== 0) throw new Error('A rented Home cannot also charge a nightly cost.');
    }
    if (values.purchase !== undefined) {
      const purchase = values.purchase;
      if (!purchase || typeof purchase !== 'object' || Array.isArray(purchase))
        throw new Error('Home purchase must be an object.');
      for (const key of Object.keys(purchase))
        if (!Object.hasOwn(HOME_FIELDS.purchase, key)) throw new Error(`Unknown Home purchase attribute: ${key}`);
      for (const key of ['cost', 'maintenanceCost'])
        if (!isCents(purchase[key]) || purchase[key] === 0)
          throw new Error(`Home purchase ${key} must be positive cents.`);
      for (const key of ['setupHours', 'maintenanceDurationHours', 'maintenanceHours'])
        if (!isPositiveInteger(purchase[key])) throw new Error(`Home purchase ${key} must be a positive integer.`);
      if (values.nightlyCost !== 0) throw new Error('An owned Home cannot also charge a nightly cost.');
    }
    if (values.rental && values.purchase) throw new Error('A Home cannot be both rented and purchased.');
    Object.assign(this, values);
    if (values.rental) this.rental = Object.freeze({ ...values.rental });
    if (values.purchase) this.purchase = Object.freeze({ ...values.purchase });
    Object.freeze(this);
  }
}

export function createHomeProgress(homes) {
  return Object.fromEntries(Object.entries(homes)
    .filter(([, home]) => Boolean(home.rental || home.purchase))
    .map(([id, home]) => [id, home.rental
      ? { rentedUntilHour: null }
      : { owned: false, maintainedUntilHour: null }]));
}

export function resolveHomeRest(home, energy, draw, season = 'spring') {
  const seasonal = seasonalSleepModifiers(season, home.shelter);
  const chance = Math.min(1, home.badSleepChance + seasonal.badSleepChance);
  const badSleep = draw < chance;
  const recoveryPotential = Math.max(0,
    (badSleep ? home.badEnergy : home.goodEnergy) + seasonal.energy);
  const recoveredEnergy = Math.min(100, energy + recoveryPotential);
  return {
    badSleep, chance, season, seasonal, recoveryPotential, energyGain: recoveredEnergy - energy,
    energy: recoveredEnergy,
    reason: badSleep ? home.badSleepText : home.goodSleepText
  };
}

export function extendHomeRental(home, currentUntilHour, afterSetupHour) {
  return Math.max(currentUntilHour ?? 0, afterSetupHour) + home.rental.durationHours;
}

export function extendHomeMaintenance(home, currentUntilHour, afterSetupHour) {
  return Math.max(currentUntilHour ?? 0, afterSetupHour) + home.purchase.maintenanceDurationHours;
}
