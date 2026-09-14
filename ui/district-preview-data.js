// Presentation fixtures only. References document future engine adapters; never dispatch actions.
const place = (id, name, kind, street, description, outcome, reference = null) => ({
  id, name, kind, street, description, outcome, reference
});
export const PREVIEW_DISTRICTS = {
  little_italy: {
    name: 'Little Italy', defaultLayout: 'overview', atmosphere: 'Laundry overhead. Coffee on the stove. Every window has eyes.',
    streets: ['Mulberry Street', 'Parish Square', 'Back Courtyards'],
    captions: ['Family shops beneath crowded tenements.', 'Church bells carry over the neighborhood workshops.', 'Behind the respectable fronts, a quieter trade.'],
    places: [
      place('bellini', 'Bellini Grocery', 'shops', 0, 'Crates of tomatoes crowd the pavement. Mrs. Bellini knows every family on the block.', 'Mrs. Bellini sets a basket on the counter and asks what you need.', { businessId: 'bellini_family_grocery', jobIds: ['neighborhood_grocer'] }),
      place('moretti', 'Moretti Barber', 'shops', 0, 'Three chairs, warm towels, and a conversation that stops when you enter.', 'Moretti dusts off the empty chair. “Sit. You look like a man with a story.”', { businessId: 'moretti_barber_shop' }),
      place('bakery', 'Rosa’s Bakery', 'shops', 1, 'The morning bread is cooling in the window. A bell hangs above the door.', 'Rosa lifts the cloth from a tray of fresh rolls.'),
      place('delivery', 'Grocery Deliveries', 'work', 0, 'A handwritten notice at Bellini’s asks for a dependable pair of hands.', 'Mrs. Bellini points to the delivery baskets. “Come early if you want to help.”', { businessId: 'bellini_family_grocery', jobIds: ['neighborhood_grocer'] }),
      place('tailor', 'Parish Tailoring Room', 'work', 1, 'Sewing machines chatter behind an open window. The forewoman is looking for help.', 'The forewoman shows you the cutting table and explains the day’s work.'),
      place('alley', 'Unattended Cart', 'crime', 2, 'A deliveryman has left his cart in the courtyard while he carries a parcel upstairs.', 'You watch the staircase. The deliveryman returns before the courtyard empties.'),
      place('cards', 'Backroom Card Table', 'crime', 2, 'Muffled arguments drift through a half-open cellar door.', 'A man at the door studies you, then closes it. You will need an introduction.')
    ]
  },
  docks: {
    name: 'The Docks', defaultLayout: 'streets', atmosphere: 'Salt in the air. Iron against iron. A horn beyond the harbor fog.',
    streets: ['Harbor Front', 'Ironworks Lane', 'Bonded Warehouses'],
    captions: ['Fishmongers and chandlers open along the working waterfront.', 'Riveters hammer beneath the cranes. Men gather for the next shift.', 'Cargo waits behind locked doors and weathered brick.'],
    places: [
      place('fish', 'Harbor Fish Exchange', 'shops', 0, 'Fishing crews unload their catch onto ice beneath a gull-filled sky.', 'A fishmonger opens a crate to show you this morning’s catch.', { businessId: 'harbor_fish_exchange' }),
      place('chandler', 'Anchor Chandlery', 'shops', 0, 'Rope, lanterns, and oilskins fill a shop barely wider than its doorway.', 'The chandler spreads a coil of rope across the counter.'),
      place('canteen', 'Pier Nine Canteen', 'shops', 0, 'Steam clouds the glass. Dockworkers take their coffee standing up.', 'The cook wipes down a place at the counter and pours a cup.'),
      place('atlas', 'Atlas Freight', 'work', 1, 'A foreman counts the waiting men while a crane swings over an open hold.', 'The foreman points toward the cargo gangs and describes the loading shift.', { businessId: 'atlas_freight_company', jobIds: ['stevedore'] }),
      place('iron', 'Federal Iron Works', 'work', 1, 'Rivets glow in the gloom. Skilled hands are needed in the fabrication shed.', 'The yard supervisor leads you to the workshop noticeboard.', { businessId: 'federal_ship_and_iron_works', jobIds: ['ironworker', 'ship_fabrication'] }),
      place('cargo', 'Unwatched Cargo', 'crime', 2, 'A stack of small crates sits beyond the warehouse watchman’s line of sight.', 'You follow the watchman’s rounds. A second guard appears at the loading door.'),
      place('manifest', 'Side-door Exchange', 'crime', 2, 'Two men compare a manifest in the shadow of the customs office.', 'Their conversation ends as you approach. One slips the manifest into his coat.')
    ]
  }
};
export function visiblePlaces(district, layout, street, filter = 'all') {
  return district.places.filter(p => (layout === 'overview' || p.street === street) && (filter === 'all' || p.kind === filter));
}
