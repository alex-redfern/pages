// Saves everything in the browser's storage. One record holds all players.
//
// ⚠️ Keep KEY the same forever: changing it would make existing players disappear.
// New fields must be optional — normalise() fills in defaults for older saves.

const KEY = 'critter-classroom-v1';
const AUTO_BACKUP_KEY = KEY + '-autobackup';
const BROKEN_KEY = KEY + '-unreadable';

function blank() {
  return { version: 1, players: [], lastPlayer: null };
}

// Fill in anything an older save might be missing, without removing anything.
function normalise(d) {
  d.players.forEach((p) => {
    p.band = p.band === 'young' ? 'young' : 'older'; // age group; players from before this existed are 8–10
    p.levels = { add: 1, sub: 1, mul: 1, div: 1, yadd: 1, ysub: 1, ...(p.levels || {}) };
    p.items = Array.isArray(p.items) ? p.items : [];
    p.history = Array.isArray(p.history) ? p.history : [];
    p.best = p.best || {};
    p.settings = { timer: false, sound: true, ...(p.settings || {}) };
  });
  return d;
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { return blank(); }
  if (raw == null) return blank();
  try {
    const d = JSON.parse(raw);
    if (d && Array.isArray(d.players)) return normalise(d);
  } catch { /* fall through */ }
  // Something's wrong with the saved data. Keep a copy rather than overwriting it.
  try { localStorage.setItem(BROKEN_KEY, raw); } catch { /* ignore */ }
  return blank();
}

let data = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save progress', e);
  }
}

// Once a day, keep a copy of progress as it was when the game was opened.
function autoBackup() {
  if (!data.players.length) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const prev = JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY) || 'null');
    if (prev && prev.day === today) return;
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify({ day: today, data }));
  } catch { /* ignore */ }
}
autoBackup();

export function autoBackupInfo() {
  try {
    const b = JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY) || 'null');
    return b && b.data && Array.isArray(b.data.players) ? { day: b.day, players: b.data.players.length } : null;
  } catch { return null; }
}

export function restoreAutoBackup() {
  const b = JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY));
  data = normalise(b.data);
  save();
}

// Ask the browser not to clear our storage when space is low (helps on iPad).
export function requestPersistence() {
  try { navigator.storage?.persist?.(); } catch { /* not supported */ }
}

export const players = () => data.players;
export const getPlayer = (id) => data.players.find((p) => p.id === id);
export const lastPlayerId = () => data.lastPlayer;
export function setLastPlayer(id) { data.lastPlayer = id; save(); }

export function createPlayer(name, animal, band) {
  const p = normalise({ players: [{
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name, animal, band,
    created: new Date().toISOString(),
  }] }).players[0];
  data.players.push(p);
  data.lastPlayer = p.id;
  save();
  return p;
}

export function deletePlayer(id) {
  data.players = data.players.filter((p) => p.id !== id);
  if (data.lastPlayer === id) data.lastPlayer = null;
  save();
}

export function exportJSON() {
  return JSON.stringify(data, null, 2);
}

export function importJSON(text) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.players)) throw new Error('That file doesn\'t look like a Critter Classroom backup.');
  data = normalise(d);
  save();
}
