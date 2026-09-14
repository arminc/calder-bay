export const DISTRICT_FIELDS = Object.freeze({
  id: 'Stable key used to find this district in game state, actions, and event records.',
  name: 'Player-facing district name shown in the city and narrative events.',
  description: 'Short description of the place shown on its district card.',
  position: 'Immutable x/y tile on the city map; travel distance is measured between these tiles.'
});

export class District {
  constructor({ id, name, description, position }) {
    for (const [key, value] of Object.entries({ id, name, description }))
      if (typeof value !== 'string' || !value.trim())
        throw new Error(`District needs a nonempty ${key}.`);
    if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y) ||
        position.x < 0 || position.y < 0)
      throw new Error('District needs a nonnegative integer x/y position.');
    Object.assign(this, { id, name, description, position: Object.freeze({ ...position }) });
    Object.freeze(this);
  }
}

// Concrete city layout. Manhattan distance between positions determines travel distance.
export const DISTRICTS = Object.freeze({
  downtown: new District({ id: 'downtown', name: 'Downtown / Financial District',
    description: 'Banks, law offices, courts, and guarded ledgers at the commercial heart of the city.',
    position: { x: 2, y: 2 } }),
  docks: new District({ id: 'docks', name: 'Docks',
    description: 'Cargo cranes, shipyards, and long shifts beside the city\'s main smuggling route.',
    position: { x: 1, y: 3 } }),
  little_italy: new District({ id: 'little_italy', name: 'Little Italy',
    description: 'Family shops and crowded blocks where neighborhood loyalty carries weight.',
    position: { x: 3, y: 3 } }),
  theater_district: new District({ id: 'theater_district', name: 'Theater District / Uptown Nightlife',
    description: 'Theaters, jazz clubs, and speakeasies turn nightly crowds into cash and cover.',
    position: { x: 3, y: 0 } }),
  industrial_district: new District({ id: 'industrial_district', name: 'Industrial District / Warehouses',
    description: 'Factories and cavernous storehouses offer both hard labor and concealed storage.',
    position: { x: 0, y: 2 } }),
  tenderloin: new District({ id: 'tenderloin', name: 'Red Light District / The Tenderloin',
    description: 'Gambling rooms, vice houses, and a police precinct accustomed to envelopes.',
    position: { x: 2, y: 1 } }),
  chinatown: new District({ id: 'chinatown', name: 'Chinatown',
    description: 'Merchant associations and tightly knit streets guard an independent center of trade.',
    position: { x: 3, y: 2 } }),
  irish_quarter: new District({ id: 'irish_quarter', name: 'Irish Quarter / Union Docks',
    description: 'Union halls, freight piers, and organized dockworkers make this contested rival turf.',
    position: { x: 0, y: 3 } }),
  government_row: new District({ id: 'government_row', name: 'City Hall / Government Row',
    description: 'Municipal offices put permits, police appointments, and court influence within reach.',
    position: { x: 3, y: 1 } }),
  tenements: new District({ id: 'tenements', name: 'The Slums / Tenements',
    description: 'Overcrowded housing offers cheap rooms, willing hands, and alert neighborhood eyes.',
    position: { x: 2, y: 3 } }),
  high_society: new District({ id: 'high_society', name: 'High Society Row / The Hill',
    description: 'Mansions and private clubs trade in reputations, favors, and carefully hidden scandals.',
    position: { x: 2, y: 0 } }),
  balkan_quarter: new District({ id: 'balkan_quarter', name: 'The Balkan Quarter',
    description: 'Workshops, cafes, and immigrant societies hold their ground between larger factions.',
    position: { x: 1, y: 2 } }),
  rail_yards: new District({ id: 'rail_yards', name: 'Rail Yards / Freight District',
    description: 'Switching yards and freight sheds provide a second route for cargo and hijacking.',
    position: { x: 0, y: 1 } }),
  university_district: new District({ id: 'university_district', name: 'The University District',
    description: 'Lecture halls and fraternity houses mix educated opportunity with reform agitation.',
    position: { x: 1, y: 0 } }),
  auto_district: new District({ id: 'auto_district', name: 'Machine Row / Auto District',
    description: 'Garages and machine shops build, repair, and quietly alter the city\'s motorcars.',
    position: { x: 1, y: 1 } }),
  outskirts: new District({ id: 'outskirts', name: 'The Outskirts / The Backwoods',
    description: 'Farms, woods, dirt roads, and isolated barns lie beyond routine police patrols.',
    position: { x: 0, y: 0 } })
});
