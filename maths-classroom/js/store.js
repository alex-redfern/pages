// Saves everything in the iPad's browser storage. One record holds all players.

const KEY = 'critter-classroom-v1';

function blank() {
  return { version: 1, players: [], lastPlayer: null };
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.players)) return d;
  } catch { /* storage unavailable or corrupt: start fresh */ }
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

// Ask the browser not to clear our storage when space is low (helps on iPad).
export function requestPersistence() {
  try { navigator.storage?.persist?.(); } catch { /* not supported */ }
}

export const players = () => data.players;
export const getPlayer = (id) => data.players.find((p) => p.id === id);
export const lastPlayerId = () => data.lastPlayer;
export function setLastPlayer(id) { data.lastPlayer = id; save(); }

export function createPlayer(name, animal) {
  const p = {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name, animal,
    created: new Date().toISOString(),
    levels: { add: 1, sub: 1, mul: 1, div: 1 },
    items: [],
    history: [],
    best: {},
    settings: { timer: false, sound: true },
  };
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
  data = d;
  save();
}
