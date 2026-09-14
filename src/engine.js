// The engine has no browser dependencies. Each command is an atomic state transition.
export { ALL_JOBS, DISTRICT_JOBS, DOCK_JOBS } from './district/work.js';
export { LegitWork, LEGIT_WORK_FIELDS, createWorkProgress, WORK_PROGRESS_FIELDS } from './work.js';
export { Business, BUSINESS_FIELDS } from './business.js';
export { ALL_BUSINESSES, DISTRICT_BUSINESSES } from './district/business.js';
export { Home, HOME_FIELDS, createHomeProgress, resolveHomeRest,
  extendHomeRental, extendHomeMaintenance } from './home.js';
export { ALL_HOMES, DISTRICT_HOMES, DOCK_HOMES, TENEMENT_HOMES, LITTLE_ITALY_HOMES,
  OUTSKIRTS_HOMES, HIGH_SOCIETY_HOMES } from './district/home.js';
export { District, DISTRICTS, DISTRICT_FIELDS } from './district.js';
export { TRAVEL_MODES, districtDistance, quoteTravel } from './travel.js';
export { createPlayer, PLAYER_FIELDS, PLAYER_START } from './player.js';
export { NPC_ARCHETYPES, NPC_FIELDS, NPC_PRESENCE, DISTRICT_NPC_WEIGHTS,
  createNpc, generateNpc, generateNpcs } from './npc.js';
export { PICKPOCKET_RULES, PICKPOCKET_TYPE_MODIFIERS, apparentCash,
  apparentDifficulty, pickpocketChance } from './pickpocket.js';
export { CAMPAIGN_START, DAYS_PER_YEAR, HOURS_PER_YEAR, MONTHS, birthdaysCrossed,
  clockAt, dayOfYear, seasonForDate, seasonalSleepModifiers } from './calendar.js';
import { ALL_JOBS } from './district/work.js';
import { createPlayer } from './player.js';
import { createWorkProgress } from './work.js';
import { ALL_HOMES } from './district/home.js';
import { createHomeProgress, extendHomeMaintenance, extendHomeRental } from './home.js';
import { birthdaysCrossed, clockAt, seasonalSleepModifiers } from './calendar.js';
import { DISTRICTS } from './district.js';
import { TRAVEL_MODES, quoteTravel } from './travel.js';
import { generateNpc, generateNpcs, NPC_ARCHETYPES } from './npc.js';
import { PICKPOCKET_RULES, apparentCash, apparentDifficulty, pickpocketChance } from './pickpocket.js';

export const RULES = Object.freeze({
  travel: TRAVEL_MODES,
  rest: {
    hours: 8,
    places: {
      outside: { cost: ALL_HOMES.docks_homeless.nightlyCost,
        badSleepChance: ALL_HOMES.docks_homeless.badSleepChance,
        goodEnergy: ALL_HOMES.docks_homeless.goodEnergy, badEnergy: ALL_HOMES.docks_homeless.badEnergy },
      hotel: { cost: ALL_HOMES.harbor_house_hotel.nightlyCost,
        badSleepChance: ALL_HOMES.harbor_house_hotel.badSleepChance,
        goodEnergy: ALL_HOMES.harbor_house_hotel.goodEnergy, badEnergy: ALL_HOMES.harbor_house_hotel.badEnergy },
      room: { cost: ALL_HOMES.pier_street_room.nightlyCost,
        badSleepChance: ALL_HOMES.pier_street_room.badSleepChance,
        goodEnergy: ALL_HOMES.pier_street_room.goodEnergy, badEnergy: ALL_HOMES.pier_street_room.badEnergy }
    }
  },
  rentRoom: { cost: ALL_HOMES.pier_street_room.rental.cost,
    hours: ALL_HOMES.pier_street_room.rental.setupHours,
    durationHours: ALL_HOMES.pier_street_room.rental.durationHours },
  pickpocket: PICKPOCKET_RULES,
  journalLimit: 200,
  maxEvents: 64
});

const copy = value => structuredClone(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createInitialState(jobs = ALL_JOBS) {
  return {
    version: 8,
    nextEventId: 1,
    nextNpcId: 1,
    totalJournalEntries: 0,
    elapsedHours: 0,
    calendar: clockAt(0),
    player: createPlayer(),
    crime: { prospects: null, pickpocketAttempts: 0, pickpocketSuccesses: 0 },
    lodging: { roomRentedUntilHour: null, homes: createHomeProgress(ALL_HOMES) },
    workProgress: createWorkProgress(jobs),
    journal: []
  };
}

const LEGACY_REST_HOMES = Object.freeze({
  outside: 'docks_homeless', hotel: 'harbor_house_hotel', room: 'pier_street_room'
});

function actionHome(action) {
  if (action.type === 'rent_room') return ALL_HOMES.pier_street_room;
  if (action.type === 'rest' && action.home === undefined) {
    const place = action.place ?? 'outside';
    const id = LEGACY_REST_HOMES[place];
    if (!id) throw new Error(`Unknown rest place: ${place}`);
    return ALL_HOMES[id];
  }
  const home = ALL_HOMES[action.home];
  if (!home) throw new Error(`Unknown home: ${action.home}`);
  return home;
}

function rentedUntil(state, home, legacyDocksRoom = false) {
  return legacyDocksRoom && home.id === 'pier_street_room'
    ? state.lodging.roomRentedUntilHour
    : state.lodging.homes[home.id].rentedUntilHour;
}

function requireDistrict(state, district) {
  if (state.player.district !== district.id)
    throw new Error(`Travel to ${district.name} before doing that.`);
}

// Strict sequences reveal accidental extra random draws in tests.
export function sequenceRandom(values) {
  let index = 0;
  return () => {
    if (index >= values.length) throw new Error(`Random sequence exhausted after ${index} draw(s)`);
    const value = values[index++];
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Random draw must be in [0, 1)');
    return value;
  };
}

export function seededRandom(seed = 1) {
  let value = (Number(seed) >>> 0) || 1;
  return () => {
    value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

function validate(state, action, jobs) {
  if (!action || typeof action !== 'object') throw new Error('Action must be an object');
  if (!['travel', 'work', 'rest', 'rent_room', 'rent_home', 'buy_home', 'maintain_home',
    'scout_marks', 'pickpocket', 'discard_marks'].includes(action.type))
    throw new Error(`Unknown action: ${action.type}`);
  if (action.type === 'scout_marks' && state.player.energy < PICKPOCKET_RULES.scoutEnergy)
    throw new Error(`Need ${PICKPOCKET_RULES.scoutEnergy} energy to scout for marks.`);
  if (action.type === 'pickpocket') {
    if (state.player.energy < PICKPOCKET_RULES.attemptEnergy)
      throw new Error(`Need ${PICKPOCKET_RULES.attemptEnergy} energy to pickpocket.`);
    if (action.target !== undefined) {
      if (typeof action.target !== 'string' || !action.target.trim())
        throw new Error('Pickpocket target must be a nonempty NPC id.');
      const prospects = state.crime.prospects;
      if (!prospects || prospects.district !== state.player.district ||
          state.elapsedHours >= prospects.expiresAtHour)
        throw new Error('Those marks are no longer available.');
      if (!prospects.npcs.some(npc => npc.id === action.target))
        throw new Error(`Unknown scouted mark: ${action.target}`);
    }
  }
  if (action.type === 'discard_marks' && !state.crime.prospects)
    throw new Error('There are no scouted marks to leave behind.');
  if (action.type === 'travel') {
    const destination = DISTRICTS[action.to];
    if (!destination) throw new Error(`Unknown destination district: ${action.to}`);
    if (action.to === state.player.district)
      throw new Error(`You are already in ${destination.name}.`);
    const mode = TRAVEL_MODES[action.mode];
    if (!mode) throw new Error(`Unknown travel mode: ${action.mode}`);
    const quote = quoteTravel(state.player.district, destination, action.mode);
    if (state.player.money < quote.cost)
      throw new Error(`Need $${quote.cost.toFixed(2)} to travel by ${mode.name}.`);
  }
  if (action.type === 'work') {
    if (!Object.hasOwn(jobs, action.job)) throw new Error(`Unknown job: ${action.job}`);
    const job = jobs[action.job];
    if (action.district !== job.district.id)
      throw new Error(`This shift is available only in ${job.district.name}.`);
    requireDistrict(state, job.district);
    if (state.player.education < job.education)
      throw new Error(`Need education ${job.education} for ${job.name}.`);
    if (state.player.energy < job.energy)
      throw new Error(`Need ${job.energy} energy for work.`);
  }
  if (action.type === 'rest') {
    const home = actionHome(action);
    requireDistrict(state, home.district);
    if (state.player.money < home.nightlyCost)
      throw new Error(`Need $${home.nightlyCost.toFixed(2)} to rest at ${home.name}.`);
    const legacyDocksRoom = action.home === undefined && (action.place ?? 'outside') === 'room';
    if (home.rental && (rentedUntil(state, home, legacyDocksRoom) ?? 0) < state.elapsedHours + home.sleepHours) {
      if (legacyDocksRoom)
        throw new Error('Rent a Docks room through the end of this rest.');
      throw new Error(`Rent ${home.name} through the end of this rest.`);
    }
    if (home.purchase) {
      const progress = state.lodging.homes[home.id];
      if (!progress.owned) throw new Error(`Buy ${home.name} before resting there.`);
      if ((progress.maintainedUntilHour ?? 0) < state.elapsedHours + home.sleepHours)
        throw new Error(`Maintain ${home.name} through the end of this rest.`);
    }
  }
  if (action.type === 'rent_room' || action.type === 'rent_home') {
    const home = actionHome(action);
    if (!home.rental) throw new Error(`${home.name} is not a rental.`);
    requireDistrict(state, home.district);
    if (state.player.money < home.rental.cost)
      throw new Error(`Need $${home.rental.cost.toFixed(2)} to rent ${home.name}.`);
  }
  if (action.type === 'buy_home') {
    const home = actionHome(action);
    if (!home.purchase) throw new Error(`${home.name} cannot be purchased.`);
    if (state.lodging.homes[home.id].owned) throw new Error(`You already own ${home.name}.`);
    requireDistrict(state, home.district);
    if (state.player.money < home.purchase.cost)
      throw new Error(`Need $${home.purchase.cost.toFixed(2)} to buy ${home.name}.`);
  }
  if (action.type === 'maintain_home') {
    const home = actionHome(action);
    if (!home.purchase) throw new Error(`${home.name} is not an owned property.`);
    if (!state.lodging.homes[home.id].owned) throw new Error(`Buy ${home.name} before maintaining it.`);
    requireDistrict(state, home.district);
    if (state.player.money < home.purchase.maintenanceCost)
      throw new Error(`Need $${home.purchase.maintenanceCost.toFixed(2)} to maintain ${home.name}.`);
  }
}

export function applyAction(current, action, options = {}) {
  const jobs = options.jobs ?? ALL_JOBS;
  validate(current, action, jobs);
  const state = copy(current);
  const queue = [{ type: action.type, data: action, causeId: null }];
  const events = [];
  const entries = [];
  const random = options.random ?? Math.random;
  const maxEvents = options.maxEvents ?? RULES.maxEvents;
  let currentId = null;
  const emit = (type, data = {}) => queue.push({ type, data, causeId: currentId });
  const log = (type, text, facts = {}) => {
    const entry = { eventId: currentId, type, text, facts };
    entries.push(entry);
    state.journal.push(entry);
    state.totalJournalEntries++;
    if (state.journal.length > RULES.journalLimit) state.journal.shift();
  };
  const roll = () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Random draw must be in [0, 1)');
    return value;
  };
  const advanceTime = hours => {
    const before = state.elapsedHours;
    const beforeClock = clockAt(before);
    state.elapsedHours += hours;
    state.calendar = clockAt(state.elapsedHours);
    if (state.crime.prospects && state.elapsedHours >= state.crime.prospects.expiresAtHour) {
      const expired = state.crime.prospects;
      state.crime.prospects = null;
      log('marks_expired', `The ${expired.npcs.length} marks you had been watching disappear into the streets while time passes.`,
        { ids: expired.npcs.map(npc => npc.id), district: expired.district,
          expiresAtHour: expired.expiresAtHour, reason: 'one hour passed since the marks were scouted' });
    }
    const birthdays = birthdaysCrossed(before, state.elapsedHours, state.player.birthday);
    for (let index = 0; index < birthdays; index++) emit('birthday', {});
    if (beforeClock.season !== state.calendar.season)
      emit('season_changed', { from: beforeClock.season, to: state.calendar.season });
  };

  while (queue.length) {
    if (events.length >= maxEvents) throw new Error(`Event budget of ${maxEvents} exceeded; transition rolled back.`);
    const event = queue.shift();
    currentId = state.nextEventId++;
    events.push({ id: currentId, type: event.type, causeId: event.causeId, data: copy(event.data) });
    const a = event.data;
    switch (event.type) {
      case 'travel': {
        const origin = DISTRICTS[state.player.district];
        const destination = DISTRICTS[a.to];
        const mode = TRAVEL_MODES[a.mode];
        const quote = quoteTravel(origin, destination, mode.id);
        const discardedProspectIds = state.crime.prospects?.npcs.map(npc => npc.id) ?? [];
        state.crime.prospects = null;
        state.player.money = Math.round((state.player.money - quote.cost) * 100) / 100;
        advanceTime(quote.hours);
        state.player.district = destination.id;
        const fare = quote.cost ? ` and costs $${quote.cost.toFixed(2)}` : '';
        const travelVerb = mode.id === 'walk' ? 'walk'
          : mode.id === 'taxi' ? 'take a taxi' : 'take public transportation';
        const marksText = discardedProspectIds.length ? ' The marks you were watching are left behind.' : '';
        log('travel', `You ${travelVerb} from ${origin.name} to ${destination.name}, ${quote.distance} ${quote.distance === 1 ? 'district tile' : 'district tiles'} away. The trip takes ${quote.hours} ${quote.hours === 1 ? 'hour' : 'hours'}${fare}.${marksText}`,
          { from: origin.id, to: destination.id, mode: mode.id, distance: quote.distance,
            hours: quote.hours, cost: quote.cost, money: state.player.money,
            ...(discardedProspectIds.length ? { discardedProspectIds } : {}),
            reason: `${mode.name} time and fare scale with the ${quote.distance}-tile route; movement within a district is free` });
        break;
      }
      case 'scout_marks': {
        const replacedIds = state.crime.prospects?.npcs.map(npc => npc.id) ?? [];
        state.crime.prospects = null;
        state.player.energy -= PICKPOCKET_RULES.scoutEnergy;
        advanceTime(PICKPOCKET_RULES.scoutHours);
        const startingId = state.nextNpcId;
        const npcs = generateNpcs({ district: state.player.district, count: 3, startingId }, roll)
          .map(npc => ({ ...npc }));
        state.nextNpcId += npcs.length;
        const scoutedAtHour = state.elapsedHours;
        const expiresAtHour = scoutedAtHour + PICKPOCKET_RULES.prospectLifetimeHours;
        state.crime.prospects = { district: state.player.district, scoutedAtHour, expiresAtHour, npcs };
        const observations = npcs.map(npc => {
          const estimate = pickpocketChance(state.player, npc, true);
          return { id: npc.id, type: npc.type, typeName: NPC_ARCHETYPES[npc.type].name,
            apparentCash: apparentCash(npc.money), difficulty: apparentDifficulty(estimate.chance) };
        });
        const described = observations.map(mark =>
          `${mark.typeName.toLowerCase()} with ${mark.apparentCash}; the lift looks ${mark.difficulty}`).join('; ');
        log('scout_marks', `You spend half an hour reading the foot traffic and settle on three marks: ${described}.`,
          { district: state.player.district, ids: npcs.map(npc => npc.id), observations,
            replacedIds, hours: PICKPOCKET_RULES.scoutHours, energy: -PICKPOCKET_RULES.scoutEnergy,
            scoutedAtHour, expiresAtHour,
            reason: 'watching each person reveals broad signs of wealth and difficulty without exposing exact cash or strength' });
        break;
      }
      case 'discard_marks': {
        const discarded = state.crime.prospects;
        state.crime.prospects = null;
        log('discard_marks', 'You leave the marks alone and move on before drawing attention.',
          { ids: discarded.npcs.map(npc => npc.id), district: discarded.district,
            hours: 0, energy: 0, reason: 'walking away ends the opportunity without attempting a crime' });
        break;
      }
      case 'pickpocket': {
        const scouted = a.target !== undefined;
        const existingProspects = state.crime.prospects;
        let target;
        if (scouted) {
          target = existingProspects.npcs.find(npc => npc.id === a.target);
        } else {
          target = generateNpc({ id: `npc_${state.nextNpcId}`, district: state.player.district }, roll);
          state.nextNpcId++;
        }
        const discardedProspectIds = existingProspects?.npcs
          .filter(npc => npc.id !== target.id).map(npc => npc.id) ?? [];
        state.crime.prospects = null;
        const calculation = pickpocketChance(state.player, target, scouted);
        const draw = roll();
        const success = draw < calculation.chance / 100;
        state.player.energy -= PICKPOCKET_RULES.attemptEnergy;
        advanceTime(PICKPOCKET_RULES.attemptHours);
        state.crime.pickpocketAttempts++;
        emit(success ? 'pickpocket_succeeded' : 'pickpocket_failed', {
          target: copy(target), scouted, discardedProspectIds, draw, ...calculation
        });
        break;
      }
      case 'pickpocket_succeeded': {
        state.player.money = Math.round((state.player.money + a.target.money) * 100) / 100;
        state.crime.pickpocketSuccesses++;
        log('pickpocket_succeeded', `Your hand reaches the ${NPC_ARCHETYPES[a.target.type].name.toLowerCase()}'s cash unnoticed. You take $${a.target.money.toFixed(2)} and disappear into the street.`,
          { target: a.target, scouted: a.scouted, chance: a.chance, draw: a.draw,
            finesse: state.player.finesse, finesseModifier: a.finesseModifier,
            typeModifier: a.typeModifier, scoutingModifier: a.scoutingModifier,
            moneyGained: a.target.money, money: state.player.money,
            energy: -PICKPOCKET_RULES.attemptEnergy, hours: PICKPOCKET_RULES.attemptHours,
            discardedProspectIds: a.discardedProspectIds,
            reason: 'the lift roll fell below the bounded chance produced by finesse, target behavior, and prior scouting' });
        break;
      }
      case 'pickpocket_failed': {
        log('pickpocket_failed', `The ${NPC_ARCHETYPES[a.target.type].name.toLowerCase()} shifts at the wrong moment. You withdraw empty-handed before the attempt becomes a confrontation.`,
          { target: a.target, scouted: a.scouted, chance: a.chance, draw: a.draw,
            finesse: state.player.finesse, finesseModifier: a.finesseModifier,
            typeModifier: a.typeModifier, scoutingModifier: a.scoutingModifier,
            moneyGained: 0, money: state.player.money,
            energy: -PICKPOCKET_RULES.attemptEnergy, hours: PICKPOCKET_RULES.attemptHours,
            discardedProspectIds: a.discardedProspectIds,
            reason: 'the lift roll met or exceeded the bounded chance, so the player abandoned the attempt without taking cash' });
        break;
      }
      case 'work': {
        const job = jobs[a.job];
        const progress = state.workProgress[a.job];
        const strengthTraining = job.strengthTraining;
        const chance = strengthTraining ? progress.strengthChance : null;
        const trainingEnabled = Boolean(strengthTraining);
        const draw = trainingEnabled ? roll() : null;
        const gainedStrength = trainingEnabled && draw < chance;
        let increaseDraw = null;
        let increasePoints = 0;
        let actualIncreasePoints = 0;
        if (trainingEnabled && !gainedStrength) {
          increaseDraw = roll();
          increasePoints = strengthTraining.minChanceGainPoints + Math.floor(increaseDraw *
            (strengthTraining.maxChanceGainPoints - strengthTraining.minChanceGainPoints + 1));
          progress.strengthChance = Math.min(1, Math.round(chance * 100 + increasePoints) / 100);
          actualIncreasePoints = Math.round((progress.strengthChance - chance) * 100);
        }
        state.player.energy -= job.energy;
        advanceTime(job.hours);
        state.player.money = Math.round((state.player.money + job.pay) * 100) / 100;
        progress.shifts++;
        if (trainingEnabled) progress.streak++;
        const trainingText = !trainingEnabled ? 'This shift does not train strength.' : gainedStrength
          ? `The repeated strain pays off (strength roll ${Math.round(chance * 100)}%); your body adapts.`
          : `The strain has not made you stronger yet (strength roll ${Math.round(chance * 100)}%); a ${increasePoints}-point training roll raises your next ${job.name.toLowerCase()} chance by ${actualIncreasePoints} points to ${Math.round(progress.strengthChance * 100)}%.`;
        const exertion = job.energy >= 50 ? 'Heavy labor drains you.'
          : job.energy > 0 ? 'The shift costs you energy.' : 'The shift leaves your energy intact.';
        log('work', `${job.hours} hours of ${job.name.toLowerCase()} at ${job.business.name} in ${job.district.name} earn $${job.pay.toFixed(2)}. ${exertion} ${trainingText}`,
          {
            job: a.job, business: job.business.id, pay: job.pay, energy: -job.energy, hours: job.hours,
            educationRequired: job.education,
            ...(strengthTraining ? {
              strengthChance: chance, draw, increaseDraw, increasePoints,
              actualIncreasePoints, nextChance: gainedStrength ? strengthTraining.strengthChance : progress.strengthChance
            } : {})
          });
        if (gainedStrength) emit('body_adapts', { job: a.job, chance, draw });
        break;
      }
      case 'body_adapts': {
        const job = jobs[a.job];
        const progress = state.workProgress[a.job];
        state.player.strength += job.strengthTraining.strengthGain;
        progress.streak = 0;
        progress.strengthChance = job.strengthTraining.strengthChance;
        progress.strengthGains = (progress.strengthGains ?? 0) + 1;
        const strengthTextIndex = job.strengthTexts
          ? Math.min(progress.strengthGains - 1, job.strengthTexts.length - 1) : null;
        const strengthText = strengthTextIndex === null ? '' : `${job.strengthTexts[strengthTextIndex]} `;
        log('body_adapts', `${strengthText}${job.name} has hardened your body. Your strength rises by ${job.strengthTraining.strengthGain}, and that job's training chance resets.`,
          {
            job: a.job, strength: state.player.strength, gain: job.strengthTraining.strengthGain,
            chance: a.chance, draw: a.draw, nextChance: job.strengthTraining.strengthChance,
            strengthGains: progress.strengthGains, strengthTextIndex,
            reason: 'strength roll succeeded after this job\'s accumulated shifts'
          });
        break;
      }
      case 'rest': {
        const home = actionHome(a);
        const place = a.home === undefined ? (a.place ?? 'outside') : home.id;
        const sleepStarted = clockAt(state.elapsedHours);
        const seasonal = seasonalSleepModifiers(sleepStarted.season, home.shelter);
        const badSleepChance = clamp(home.badSleepChance + seasonal.badSleepChance, 0, 1);
        const draw = roll();
        const badSleep = draw < badSleepChance;
        const baseEnergy = badSleep ? home.badEnergy : home.goodEnergy;
        const energyGain = Math.max(0, baseEnergy + seasonal.energy);
        const energyBefore = state.player.energy;
        state.player.money = Math.round((state.player.money - home.nightlyCost) * 100) / 100;
        advanceTime(home.sleepHours);
        state.player.energy = clamp(state.player.energy + energyGain, 0, 100);
        const actualEnergyGain = state.player.energy - energyBefore;
        const climateReason = seasonal.badSleepChance || seasonal.energy
          ? ` ${sleepStarted.season[0].toUpperCase()}${sleepStarted.season.slice(1)} conditions make this shelter less comfortable.` : '';
        const reason = (badSleep ? home.badSleepText : home.goodSleepText) + climateReason;
        log('rest', `${reason} ${home.sleepHours} hours pass and you regain ${actualEnergyGain} energy${home.nightlyCost ? ` for $${home.nightlyCost.toFixed(2)}` : ''}.`,
          { place, home: home.id, district: home.district.id, shelter: home.shelter,
            season: sleepStarted.season, date: sleepStarted.label,
            badSleep, baseChance: home.badSleepChance, seasonalChance: seasonal.badSleepChance,
            chance: badSleepChance, draw, seasonalEnergy: seasonal.energy,
            energyGain: actualEnergyGain, recoveryPotential: energyGain,
            energy: state.player.energy, cost: home.nightlyCost, money: state.player.money,
            hours: home.sleepHours });
        break;
      }
      case 'rent_room':
      case 'rent_home': {
        const home = actionHome(a);
        state.player.money = Math.round((state.player.money - home.rental.cost) * 100) / 100;
        advanceTime(home.rental.setupHours);
        const progress = state.lodging.homes[home.id];
        const currentUntilHour = home.id === 'pier_street_room'
          ? Math.max(progress.rentedUntilHour ?? 0, state.lodging.roomRentedUntilHour ?? 0)
          : progress.rentedUntilHour;
        progress.rentedUntilHour = extendHomeRental(home, currentUntilHour, state.elapsedHours);
        if (home.id === 'pier_street_room') state.lodging.roomRentedUntilHour = progress.rentedUntilHour;
        const legacyText = event.type === 'rent_room'
          ? ' for a private room in the Docks for seven days'
          : ` to rent ${home.name} in ${home.district.name} for seven days`;
        log(event.type, `You pay $${home.rental.cost.toFixed(2)}${legacyText}. Arranging it takes ${home.rental.setupHours === 1 ? 'an hour' : `${home.rental.setupHours} hours`}.`,
          { home: home.id, district: home.district.id, cost: home.rental.cost, money: state.player.money,
            hours: home.rental.setupHours, rentedUntilHour: progress.rentedUntilHour });
        break;
      }
      case 'buy_home': {
        const home = actionHome(a);
        const progress = state.lodging.homes[home.id];
        state.player.money = Math.round((state.player.money - home.purchase.cost) * 100) / 100;
        advanceTime(home.purchase.setupHours);
        progress.owned = true;
        progress.maintainedUntilHour = state.elapsedHours + home.purchase.maintenanceDurationHours;
        log('buy_home', `You pay $${home.purchase.cost.toFixed(2)} to buy ${home.name} in ${home.district.name}. The transfer takes ${home.purchase.setupHours} hours, and the property is maintained for its first seven days.`,
          { home: home.id, district: home.district.id, cost: home.purchase.cost,
            money: state.player.money, hours: home.purchase.setupHours, owned: true,
            maintainedUntilHour: progress.maintainedUntilHour,
            reason: 'the completed purchase includes the first maintenance period' });
        break;
      }
      case 'maintain_home': {
        const home = actionHome(a);
        const progress = state.lodging.homes[home.id];
        state.player.money = Math.round((state.player.money - home.purchase.maintenanceCost) * 100) / 100;
        advanceTime(home.purchase.maintenanceHours);
        progress.maintainedUntilHour = extendHomeMaintenance(
          home, progress.maintainedUntilHour, state.elapsedHours);
        log('maintain_home', `You pay $${home.purchase.maintenanceCost.toFixed(2)} for seven days of maintenance at ${home.name}. Arranging the work takes ${home.purchase.maintenanceHours === 1 ? 'an hour' : `${home.purchase.maintenanceHours} hours`}.`,
          { home: home.id, district: home.district.id, cost: home.purchase.maintenanceCost,
            money: state.player.money, hours: home.purchase.maintenanceHours,
            maintainedUntilHour: progress.maintainedUntilHour,
            reason: 'paid upkeep keeps the owned home safe and habitable' });
        break;
      }
      case 'birthday': {
        state.player.age++;
        const date = clockAt(state.elapsedHours);
        log('birthday', `Your birthday has passed. You are now ${state.player.age}.`,
          { age: state.player.age, birthday: copy(state.player.birthday), date: date.label,
            yearsPassed: date.yearsPassed, reason: 'time crossed the player\'s birthday' });
        break;
      }
      case 'season_changed': {
        log('season_changed', `${a.to[0].toUpperCase()}${a.to.slice(1)} has begun. The weather now changes how exposed and poorly sheltered sleep feels.`,
          { from: a.from, to: a.to, date: state.calendar.label,
            reason: 'time crossed a seasonal boundary' });
        break;
      }
      default: throw new Error(`No handler for event ${event.type}`);
    }
  }
  return { state, events, entries };
}
