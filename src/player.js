// A player's starting shape lives outside the engine. The definition is fixed;
// each new game receives its own mutable, plain-data copy for its save state.

export const PLAYER_FIELDS = Object.freeze({
  name: 'The player’s name, used in the arrival story.',
  age: 'Age in years; increases when the repeated calendar reaches the birthday.',
  birthday: 'Month and day on the displayed 1920 calendar; the year is intentionally hidden.',
  district: 'District id where the player is currently present.',
  money: 'Cash in 1920 U.S. dollars.',
  energy: 'Available energy from 0 to 100.',
  finesse: 'Subtle manual skill used to lift cash without alerting a target.',
  strength: 'Physical leverage used in contests.',
  education: 'Schooling level used to qualify for work.'
});

export const PLAYER_START = Object.freeze({
  name: 'Luca Bellini',
  age: 19,
  birthday: Object.freeze({ month: 6, day: 1 }),
  district: 'docks',
  money: 40,
  energy: 100,
  finesse: 20,
  strength: 20,
  education: 0
});

export function createPlayer() {
  return { ...PLAYER_START, birthday: { ...PLAYER_START.birthday } };
}
