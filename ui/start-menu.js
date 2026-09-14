// Keep the simulation uninitialized until the player starts or loads a game.
export function mountStartMenu({ document, createSession, showCity, saveStore = null, playIntro = null, onGameOpen = () => {} }) {
  const menu = document.getElementById('start-menu');
  const game = document.getElementById('game');
  const loadButton = document.getElementById('load-game');
  const saveButton = document.getElementById('save-game');
  const announcement = document.getElementById('announcement');
  const savePanel = document.getElementById('save-panel');
  const savePanelTitle = document.getElementById('save-panel-title');
  const closeSavePanel = document.getElementById('close-save-panel');
  const newSaveForm = document.getElementById('new-save-form');
  const saveName = document.getElementById('save-name');
  const saveList = document.getElementById('save-list');
  const saveEmpty = document.getElementById('save-panel-empty');
  const panelMessage = document.getElementById('save-panel-message');
  const importButton = document.getElementById('import-save');
  const importFile = document.getElementById('import-save-file');
  let session = null;
  let opening = false;
  const reveal = () => {
    showCity(session);
    game.hidden = false;
    document.title = 'Calder Bay — City';
    game.focus();
    onGameOpen();
  };
  const open = (initialState, withIntro = false) => {
    if (session || opening) return;
    opening = true;
    session = initialState === undefined ? createSession() : createSession({ initialState });
    menu.hidden = true;
    if (withIntro && playIntro) playIntro({ player: session.snapshot().player, onComplete: reveal });
    else reveal();
  };
  const restore = saved => {
    session = createSession({ initialState: saved.state });
    opening = false;
    menu.hidden = true;
    if (savePanel) savePanel.hidden = true;
    reveal();
  };
  const announce = message => {
    if (announcement) announcement.textContent = message;
    if (panelMessage) panelMessage.textContent = message;
  };
  const fileName = name => `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'calder-bay-save'}.json`;
  const download = slot => {
    const blob = new Blob([saveStore.export(slot.id)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName(slot.name);
    link.click();
    URL.revokeObjectURL(url);
    announce(`Exported “${slot.name}”.`);
  };
  const renderSaves = ({ canSave = false } = {}) => {
    if (!saveList || typeof saveStore?.list !== 'function') return;
    const slots = saveStore.list();
    saveList.replaceChildren();
    if (saveEmpty) saveEmpty.hidden = slots.length > 0;
    slots.forEach(slot => {
      const row = document.createElement('article');
      row.className = 'save-slot';
      const details = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = slot.name;
      const state = document.createElement('p');
      state.textContent = `${slot.state.player.name} · ${slot.state.calendar.label} · saved ${new Date(slot.savedAt).toLocaleString()}`;
      details.append(title, state);
      const actions = document.createElement('div');
      actions.className = 'save-slot-actions';
      const addAction = (label, handler, className = '') => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.className = className;
        button.addEventListener('click', handler);
        actions.append(button);
      };
      addAction('Load', () => restore(saveStore.load(slot.id)));
      if (canSave) addAction('Overwrite', () => {
        saveStore.save(session.snapshot(), { id: slot.id, name: slot.name });
        announce(`Updated “${slot.name}”.`);
        renderSaves({ canSave: true });
      });
      addAction('Export', () => download(slot));
      addAction('Delete', () => {
        saveStore.clear(slot.id);
        announce(`Deleted “${slot.name}”.`);
        renderSaves({ canSave });
        if (loadButton) loadButton.disabled = !saveStore.has();
      }, 'delete-save');
      row.append(details, actions);
      saveList.append(row);
    });
  };
  const showSavePanel = ({ canSave = false, title = 'Saved Games' } = {}) => {
    if (!savePanel || typeof saveStore?.list !== 'function') return false;
    if (savePanelTitle) savePanelTitle.textContent = title;
    if (newSaveForm) newSaveForm.hidden = !canSave;
    if (panelMessage) panelMessage.textContent = '';
    if (canSave && saveName) saveName.value = `${session.snapshot().player.name} — Save ${saveStore.list().length + 1}`;
    renderSaves({ canSave });
    savePanel.hidden = false;
    (canSave ? saveName : closeSavePanel)?.focus?.();
    return true;
  };
  document.getElementById('new-game').addEventListener('click', () => {
    open(undefined, true);
  });
  if (loadButton) {
    loadButton.disabled = !saveStore?.has();
    loadButton.addEventListener('click', () => {
      if (showSavePanel({ title: 'Load Game' })) return;
      try { open(saveStore.load().state); }
      catch (error) {
        loadButton.disabled = true;
        announce(error.message);
      }
    });
  }
  if (saveButton) saveButton.addEventListener('click', () => {
    if (!session || !saveStore) return;
    if (showSavePanel({ canSave: true, title: 'Save Game' })) return;
    saveStore.save(session.snapshot());
    saveButton.textContent = 'Game Saved';
    announce('Game saved in this browser.');
    setTimeout(() => { saveButton.textContent = 'Save Game'; }, 1200);
  });
  if (newSaveForm) newSaveForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const slot = saveStore.save(session.snapshot(), { name: saveName.value });
      announce(`Created “${slot.name}”.`);
      saveName.value = `${session.snapshot().player.name} — Save ${saveStore.list().length + 1}`;
      renderSaves({ canSave: true });
      if (loadButton) loadButton.disabled = false;
    } catch (error) { announce(error.message); }
  });
  closeSavePanel?.addEventListener('click', () => { savePanel.hidden = true; });
  savePanel?.addEventListener('click', event => { if (event.target === savePanel) savePanel.hidden = true; });
  document.addEventListener?.('keydown', event => {
    if (event.key === 'Escape' && savePanel && !savePanel.hidden) savePanel.hidden = true;
  });
  importButton?.addEventListener('click', () => importFile.click());
  importFile?.addEventListener('change', async () => {
    const file = importFile.files?.[0];
    if (!file) return;
    try {
      const imported = saveStore.import(await file.text(), { name: file.name.replace(/\.json$/i, '') || 'Imported save' });
      if (loadButton) loadButton.disabled = false;
      announce(`Imported “${imported.name}”.`);
      restore(imported);
    } catch (error) {
      announce(error.message);
      renderSaves({ canSave: Boolean(session) });
    } finally { importFile.value = ''; }
  });
}
