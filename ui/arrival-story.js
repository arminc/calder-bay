// Stable variations: a saved identity always tells the same arrival story.
export function createArrivalStory(player) {
  const name = player.name || 'Luca Bellini';
  const origins = [
    { town: 'Palermo', memory: 'your mother sewing the lining of your coat', trade: 'mending fishing nets' },
    { town: 'Naples', memory: 'your father standing in the doorway until you turned the corner', trade: 'carrying crates at the market' },
    { town: 'Genoa', memory: 'your younger brother running beside the departing train', trade: 'sweeping a shipwright’s workshop' }
  ];
  const seed = [...name].reduce((hash, char) => (hash * 31 + char.codePointAt(0)) >>> 0, 0);
  const origin = origins[seed % origins.length];
  return [
    { shot: 'crossing', label: `${origin.town}, Italy → America · 1920`, title: 'An ocean behind you.', text: `You are ${name}, ${player.age} years old. Back in ${origin.town}, you spent your days ${origin.trade}. There was work enough to get by, but never enough to build a life of your own.` },
    { shot: 'harbor', label: 'Calder Bay · The harbor', title: 'A city through the fog.', text: `Your last clear memory of home is ${origin.memory}. Now the ship’s horn sounds. Beyond the rail, Calder Bay rises out of the mist. Someone on deck says there is always work at the docks.` },
    { shot: 'landing', label: `${name} · A first step`, title: 'Everything you can carry.', text: 'The gangway shifts beneath your boots. A suitcase, a change of clothes, and a folded letter from home: this is what you bring ashore. You promised to write as soon as you found a room. First, you need to find your feet.' },
    { shot: 'city', label: 'The Docks · Your story begins', title: 'Make a life here.', text: 'A foreman calls for hands. Beyond the warehouses, strangers hurry toward streets you do not yet know. You came to America for a new life. What you do next will decide the kind of man you become.' }
  ];
}
