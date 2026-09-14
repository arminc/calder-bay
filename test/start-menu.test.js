import test from 'node:test';
import assert from 'node:assert/strict';
import { mountStartMenu } from '../ui/start-menu.js';
import { createSession, createInitialState } from '../ui/session.js';

test('menu waits for New Game, then initializes one fresh session and opens the city', () => {
  let click, initialized = 0, shown = 0, focused = false;
  const menu = { hidden: false };
  const game = { hidden: true, focus() { focused = true; } };
  const button = { addEventListener(type, handler) { assert.equal(type, 'click'); click = handler; } };
  const document = { title: 'Calder Bay', getElementById: id => ({ 'start-menu': menu, game, 'new-game': button })[id] };
  mountStartMenu({
    document,
    createSession() { initialized++; return createSession(); },
    showCity(session) { shown++; assert.deepEqual(session.snapshot(), createInitialState()); }
  });
  assert.equal(initialized, 0);
  assert.equal(menu.hidden, false);
  assert.equal(game.hidden, true);
  click();
  assert.equal(initialized, 1);
  assert.equal(shown, 1);
  assert.equal(menu.hidden, true);
  assert.equal(game.hidden, false);
  assert.equal(focused, true);
  assert.equal(document.title, 'Calder Bay — City');
  click();
  assert.equal(initialized, 1);
  assert.equal(shown, 1);
});

test('menu enables Load Game only for a local save and restores that state', () => {
  let loadClick, received;
  const saved = createInitialState();
  saved.player.money = 27.35;
  const menu = { hidden: false };
  const game = { hidden: true, focus() {} };
  const newButton = { addEventListener() {} };
  const loadButton = {
    disabled: true,
    addEventListener(type, handler) { assert.equal(type, 'click'); loadClick = handler; }
  };
  const document = {
    title: 'Calder Bay',
    getElementById: id => ({
      'start-menu': menu, game, 'new-game': newButton, 'load-game': loadButton
    })[id]
  };
  mountStartMenu({
    document,
    createSession(options) { received = options.initialState; return createSession(options); },
    showCity(session) { assert.equal(session.snapshot().player.money, 27.35); },
    saveStore: { has: () => true, load: () => ({ state: saved }) }
  });
  assert.equal(loadButton.disabled, false);
  loadClick();
  assert.deepEqual(received, saved);
  assert.equal(menu.hidden, true);
  assert.equal(game.hidden, false);
});

test('New Game defers the city until arrival completes, while Load Game bypasses arrival', () => {
  for (const load of [false, true]) {
    const handlers = {};
    let complete, intros = 0, shown = 0, created = 0;
    const menu = { hidden: false }, game = { hidden: true, focus() {} };
    const document = { getElementById: id => ({ 'start-menu': menu, game }[id] || (['new-game', 'load-game'].includes(id) ? { addEventListener(type, fn) { handlers[id] = fn; } } : null)) };
    mountStartMenu({ document, createSession(options) { created++; return createSession(options); }, showCity() { shown++; }, saveStore: { has: () => true, load: () => ({ state: createInitialState() }) }, playIntro({ player, onComplete }) { intros++; assert.equal(player.name, 'Luca Bellini'); complete = onComplete; } });
    handlers[load ? 'load-game' : 'new-game']();
    assert.equal(intros, load ? 0 : 1);
    assert.equal(shown, load ? 1 : 0);
    if (!load) {
      assert.equal(game.hidden, true);
      handlers['new-game'](); assert.equal(created, 1);
      complete(); assert.equal(shown, 1); assert.equal(game.hidden, false);
    }
  }
});
