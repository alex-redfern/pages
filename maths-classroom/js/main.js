import { SUBJECTS, makeRound, BANDS, bandOf, subjectsFor, passMarkOf } from './levels.js';
import { buildLayout, checkLayout, hintFor, placeWord, answerOf } from './column.js';
import { ANIMALS, animalSVG } from './animals.js';
import { ITEMS, ITEM_BY_ID, itemSVG, classroomSVG, rewardChoices } from './classroom.js';
import * as store from './store.js';
import { sounds, unlockAudio, setSound } from './sound.js';
import { tr, trList, plural, LANGS, getLang, setLang, locale } from './i18n.js';

const app = document.getElementById('app');
let actions = {};
let player = null;
let R = null; // the round in progress
let timerHandle = null;
const session = { rounds: 0, questions: 0 };

const NAME_IDEAS = {
  wolf: ['Luna', 'Howl', 'Storm', 'Shadow'],
  penguin: ['Pip', 'Waddles', 'Splash', 'Pebble'],
  fox: ['Rusty', 'Ember', 'Foxy', 'Saffron'],
  owl: ['Hoot', 'Professor', 'Willow', 'Olive'],
  panda: ['Bamboo', 'Mochi', 'Poppy', 'Bao'],
  tiger: ['Stripes', 'Tigger', 'Blaze', 'Sunny'],
  rabbit: ['Clover', 'Bun', 'Thumper', 'Daisy'],
  frog: ['Ribbit', 'Hopper', 'Lily', 'Kermie'],
  koala: ['Gumnut', 'Snuggles', 'Kip', 'Bluey'],
  hedgehog: ['Spike', 'Prickles', 'Conker', 'Hazel'],
};
const PRAISE = ['Brilliant!', 'Super work!', "You've got it!", 'Spot on!', 'Fantastic!', 'Great thinking!', 'Yes! Well done!', 'Smashing it!', 'Wonderful!', 'Nailed it!'];
const COLUMN_PRAISE = ['Great column work!', 'Lovely careful working!', 'Every column right!', 'Brilliant method!'];
const GREETINGS = ['What shall we practise today?', 'Ready to learn something new?', 'Lovely to see you!', 'Your brain is getting stronger every day!'];
const FACT_OOPS = ['Not quite. Have another go!', 'Nearly! Try once more.', 'Have another think. Tap 💡 if you want a hint.'];
const COLUMN_OOPS = ['Nearly! Have another look at {where}.', 'So close. Check {where}.', 'Almost there! Have another look at {where}.'];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtNum = (n) => Number(n).toLocaleString(locale());
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// ---------- Light / dark ----------
// The choice is kept on this device under its own key, separate from progress.
const THEME_KEY = 'critter-classroom-theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const isDark = () => (document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light')) === 'dark';
function syncThemeColour() {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark() ? '#1A1C29' : '#FFF8EC');
}
function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
  syncThemeColour();
  sounds.tap();
}
const themeButton = () => isDark()
  ? `<button class="btn toggle" data-act="theme" aria-label="${tr('Switch to light mode')}">☀️<span class="lbl"> ${tr('Light')}</span></button>`
  : `<button class="btn toggle" data-act="theme" aria-label="${tr('Switch to dark mode')}">🌙<span class="lbl"> ${tr('Dark')}</span></button>`;

// ---------- Language ----------
const langButton = () => `<button class="btn toggle" data-act="lang" aria-label="${tr('Language')}">${LANGS[getLang()].flag}<span class="lbl"> ${LANGS[getLang()].label}</span></button>`;
function chooseLanguage(redrawScreen) {
  sounds.tap();
  const acts = {};
  Object.keys(LANGS).forEach((k) => { acts['lang-' + k] = () => { setLang(k); redrawScreen(); }; });
  modal(`<p><strong>${tr('Language')}</strong></p>
    <div class="lang-list">${Object.entries(LANGS).map(([k, l]) => `<button class="btn lang-btn ${k === getLang() ? 'on' : 'ghost'}" data-act="lang-${k}"><span class="flag">${l.flag}</span> ${l.label}</button>`).join('')}</div>
    <div class="modal-btns"><button class="btn ghost" data-act="close">${tr('Cancel')}</button></div>`, acts);
}
syncThemeColour();
darkQuery.addEventListener?.('change', syncThemeColour);

function render(html, acts, cls = '') {
  stopTimer();
  app.className = cls;
  app.innerHTML = html;
  actions = acts;
  window.scrollTo(0, 0);
}

app.addEventListener('click', (e) => {
  unlockAudio();
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) fn(el, e);
});

function modal(html, acts) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    close();
    acts[el.dataset.act]?.();
  });
}

// ================= Player select =================
function showPlayers() {
  const list = store.players();
  render(`
    <div class="screen center">
      <div class="corner">${langButton()}${themeButton()}</div>
      <h1 class="title">Critter <span>Classroom</span></h1>
      <p class="subtitle">${tr("Who's playing today?")}</p>
      <div class="player-grid">
        ${list.map((p) => `
          <button class="player-card" data-act="choose" data-id="${p.id}">
            ${animalSVG(p.animal)}
            <span class="pname">${esc(p.name)}</span>
            <span class="pmeta">${plural(p.items.length, '{n} classroom thing', '{n} classroom things')}</span>
          </button>`).join('')}
        <button class="player-card new" data-act="new">
          <span class="plus">＋</span>
          <span class="pname">${tr('New player')}</span>
        </button>
      </div>
      <button class="grownups" id="grownups"><span class="fill"></span>${tr('Grown-ups (press and hold)')}</button>
    </div>`, {
    choose: (el) => { player = store.getPlayer(el.dataset.id); store.setLastPlayer(player.id); setSound(player.settings.sound); showHome(); },
    new: () => showCreate(),
    theme: () => { toggleTheme(); showPlayers(); },
    lang: () => chooseLanguage(showPlayers),
  });
  holdToOpen(document.getElementById('grownups'), showParents);
}

function holdToOpen(btn, fn) {
  let t = null;
  const start = (e) => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(() => { btn.classList.remove('holding'); fn(); }, 2000); };
  const stop = () => { clearTimeout(t); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

// ================= New player =================
function showCreate(chosen = null, band = null) {
  const backTo = store.players().length ? showPlayers : null;
  render(`
    <div class="screen">
      <div class="topbar">
        ${backTo ? `<button class="btn ghost" data-act="back">← ${tr('Back')}</button>` : '<span></span>'}
        <h2>${tr('Make your character')}</h2><span></span>
      </div>
      <p class="step">1. ${tr('Pick an animal')}</p>
      <div class="animal-grid">
        ${Object.entries(ANIMALS).map(([k, a]) => `
          <button class="animal-pick ${k === chosen ? 'chosen' : ''}" data-act="animal" data-k="${k}">
            ${animalSVG(k)}<span>${tr(a.name)}</span>
          </button>`).join('')}
      </div>
      <p class="step">2. ${tr('How old are you?')}</p>
      <div class="chips ages">
        ${Object.entries(BANDS).map(([k, b]) => `<button class="chip age ${k === band ? 'chosen' : ''}" data-act="age" data-b="${k}">${tr(b.ask)}</button>`).join('')}
      </div>
      <div class="name-step ${chosen ? '' : 'disabled'}">
        <p class="step">3. ${tr('Give {your} a name', { your: tr(chosen ? `your ${ANIMALS[chosen].name.toLowerCase()}` : 'your animal') })}</p>
        <div class="name-row">
          <input id="name" maxlength="16" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${tr('Type a name…')}" ${chosen ? '' : 'disabled'}>
          <button class="btn big go" data-act="go" id="go" disabled>${tr("Let's go!")}</button>
        </div>
        ${chosen ? `<div class="chips">${trList('NAMES_' + chosen, NAME_IDEAS[chosen]).map((n) => `<button class="chip" data-act="idea" data-n="${n}">${n}</button>`).join('')}</div>` : ''}
      </div>
    </div>`, {
    back: () => backTo(),
    animal: (el) => { sounds.tap(); redraw(el.dataset.k, band); },
    age: (el) => { sounds.tap(); redraw(chosen, el.dataset.b); },
    idea: (el) => { const inp = document.getElementById('name'); inp.value = el.dataset.n; inp.dispatchEvent(new Event('input')); },
    go: () => {
      const name = document.getElementById('name').value.trim();
      if (!name || !chosen || !band) return;
      player = store.createPlayer(name, chosen, band);
      store.requestPersistence();
      setSound(true);
      sounds.levelUp();
      showHome('welcome');
    },
  });
  const inp = document.getElementById('name');
  const go = document.getElementById('go');
  inp.addEventListener('input', () => { go.disabled = !inp.value.trim() || !chosen || !band; });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !go.disabled) { inp.blur(); actions.go(); } });
}

// Re-draw the new-player screen without losing the name typed so far.
function redraw(chosen, band) {
  const prev = document.getElementById('name')?.value || '';
  showCreate(chosen, band);
  const inp = document.getElementById('name');
  inp.value = prev;
  inp.dispatchEvent(new Event('input'));
}

// ================= Home =================
// greeting: 'welcome' for a brand-new player, otherwise a friendly line picked at random.
function showHome(greeting) {
  const lv = player.levels;
  const hello = greeting === 'welcome'
    ? tr('Welcome to Critter Classroom! Pick something to practise. Every round you finish adds something new to your classroom.')
    : pick(trList('GREETINGS', GREETINGS));
  render(`
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost" data-act="switch" aria-label="${tr('Change player')}">⇄<span class="lbl"> ${tr('Change player')}</span></button>
        <span></span>
        <div class="toggles">
          <button class="btn toggle ${player.settings.timer ? 'on' : ''}" data-act="timer" aria-label="${tr(player.settings.timer ? 'Timer on' : 'Timer off')}">⏱<span class="lbl"> ${tr(player.settings.timer ? 'Timer on' : 'Timer off')}</span></button>
          <button class="btn toggle ${player.settings.sound ? 'on' : ''}" data-act="sound" aria-label="${tr(player.settings.sound ? 'Sound on' : 'Sound off')}">${player.settings.sound ? '🔊' : '🔇'}<span class="lbl"> ${tr(player.settings.sound ? 'Sound on' : 'Sound off')}</span></button>
          ${langButton()}
          ${themeButton()}
        </div>
      </div>
      <div class="hello">
        ${animalSVG(player.animal, 'bob')}
        <div class="bubble big">
          <strong>${tr('Hi, {name}!', { name: esc(player.name) })}</strong><br>${esc(hello)}
        </div>
      </div>
      <div class="subject-grid">
        ${subjectsFor(player).map(([k, s]) => {
          const level = lv[k] || 1;
          const max = s.levels.length;
          const shown = Math.min(level, max);
          return `
          <button class="subject" style="--c:${s.colour}" data-act="play" data-s="${k}">
            <span class="sym">${s.symbol}</span>
            <span class="sname">${tr(s.name)}</span>
            <span class="slevel">${tr('Level {n}: {label}', { n: shown + (level > max ? ' ⭐' : ''), label: tr(s.levels[shown - 1].label) })}</span>
            <span class="dots">${s.levels.map((_, i) => `<i class="${i < level - 1 ? 'done' : i === level - 1 ? 'now' : ''}"></i>`).join('')}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="classroom-btn" data-act="room">
        <span class="mini-room">${classroomSVG(player.items, ANIMALS[player.animal].svg)}</span>
        <span><strong>${tr('My classroom')}</strong><br>${tr('{n} of {total} things collected', { n: player.items.length, total: ITEMS.length })}</span>
      </button>
    </div>`, {
    switch: () => showPlayers(),
    timer: () => { player.settings.timer = !player.settings.timer; store.save(); showHome(greeting); },
    sound: () => { player.settings.sound = !player.settings.sound; setSound(player.settings.sound); store.save(); sounds.tap(); showHome(greeting); },
    theme: () => { toggleTheme(); showHome(greeting); },
    lang: () => chooseLanguage(() => showHome(greeting)),
    play: (el) => startRound(el.dataset.s),
    room: () => showClassroom(),
  });
}

// ================= A round =================
function startRound(subject) {
  const s = SUBJECTS[subject];
  const level = Math.min(player.levels[subject] || 1, s.levels.length);
  const questions = makeRound(subject, level);
  R = { subject, level, questions, size: questions.length, i: 0, results: [], start: Date.now() };
  render(`
    <div class="round" style="--c:${s.colour}">
      <div class="topbar round-top">
        <button class="btn ghost" data-act="quit">✕ ${tr('Stop')}</button>
        <div class="progress" id="progress"></div>
        <div class="timer" id="timer">${player.settings.timer ? '0:00' : ''}</div>
      </div>
      <div class="round-main">
        <div class="work">
          <div class="coach">${animalSVG(player.animal, 'bob')}<div class="bubble" id="bubble"></div></div>
          <div class="question" id="question"></div>
        </div>
        <div class="pad" id="pad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key" data-act="key" data-k="${n}">${n}</button>`).join('')}
          <button class="key back" data-act="key" data-k="back" aria-label="${tr('Delete')}">⌫</button>
          <button class="key" data-act="key" data-k="0">0</button>
          <button class="key hint" data-act="hint">💡<small>${tr('Hint')}</small></button>
          <button class="key check" id="check" data-act="check">${tr('Check')}</button>
        </div>
      </div>
    </div>`, {
    quit: () => modal(`<p>${tr('Stop this round?')}</p><p class="muted">${tr("You'll get a new classroom thing when you finish a round.")}</p>
      <div class="modal-btns"><button class="btn" data-act="stay">${tr('Keep going')}</button><button class="btn ghost" data-act="leave">${tr('Stop')}</button></div>`,
      { leave: () => showHome() }),
    key: (el) => pressKey(el.dataset.k),
    cell: (el) => {
      if (R.phase !== 'answer') return;
      R.active = el.dataset.id;
      if (R.layout.inputs[R.active]) R.lastAnswerCell = R.active;
      paintQuestion();
    },
    strike: (el) => { if (R.phase !== 'answer') return; const id = el.dataset.id; R.strikes[id] = !R.strikes[id]; paintQuestion(); },
    hint: () => { if (R.phase !== 'answer') return; say(hintFor(R.q, R.layout, R.active), 'hint'); },
    check: () => checkAnswer(),
    next: () => nextQuestion(),
  }, 'is-round');
  if (player.settings.timer) {
    timerHandle = setInterval(() => {
      const t = document.getElementById('timer');
      if (t) t.textContent = fmtTime(Math.round((Date.now() - R.start) / 1000));
    }, 1000);
  }
  loadQuestion();
}

function stopTimer() { if (timerHandle) clearInterval(timerHandle); timerHandle = null; }

function loadQuestion() {
  const q = R.questions[R.i];
  R.q = q;
  R.values = {};
  R.strikes = {};
  R.wrong = new Set();
  R.attempts = 0;
  R.phase = 'answer';
  R.revealed = false;
  R.lastAnswerCell = null;
  if (q.kind === 'fact') {
    R.layout = { kind: 'fact', inputs: { f: { expected: String(q.answer) } }, order: ['f'] };
    R.active = 'f';
  } else {
    R.layout = buildLayout(q);
    R.active = R.layout.start;
  }
  R.maxTries = q.kind === 'fact' ? 2 : 3;
  const intro = {
    fact: q.dots ? tr('Count the dots to help you!') : '',
    add: tr('Add each column, starting with the ones on the right.'),
    sub: tr('Subtract each column, starting with the ones. Tap a top digit to cross it out when you exchange.'),
    smul: tr('Multiply each digit, starting with the ones on the right.'),
    bus: tr('Bus stop! Work from left to right.'),
  }[q.kind];
  say(R.i === 0 || q.kind !== 'fact' ? intro || tr('Question {i} of {n}. Take your time.', { i: R.i + 1, n: R.size }) : '', 'calm');
  paintProgress();
  paintQuestion();
}

function say(msg, mood = 'calm') {
  const b = document.getElementById('bubble');
  if (!b) return;
  b.className = `bubble ${mood}`;
  b.textContent = msg;
  b.style.visibility = msg ? 'visible' : 'hidden';
}

function paintProgress() {
  const el = document.getElementById('progress');
  el.innerHTML = Array.from({ length: R.size }, (_, i) => {
    const r = R.results[i];
    const cls = r ? (r.ok ? 'ok' : 'seen') : i === R.i ? 'now' : '';
    return `<i class="${cls}"></i>`;
  }).join('');
}

function cellClasses(id) {
  const c = [];
  if (R.phase === 'answer' && R.active === id) c.push('active');
  if (R.wrong.has(id)) c.push('wrong');
  if (R.phase !== 'answer' && R.layout.inputs[id]) c.push(R.revealed ? 'revealed' : 'right');
  return c.join(' ');
}

function paintQuestion() {
  const q = R.q;
  const el = document.getElementById('question');
  if (q.kind === 'fact') {
    const v = R.values.f || '';
    el.innerHTML = `<div class="fact-wrap"><div class="fact">
      <span>${q.a} ${q.op} ${q.b} =</span>
      <button class="c in fact-box ${cellClasses('f')}" data-act="cell" data-id="f">${esc(v)}</button>
    </div>${q.dots ? countersHTML(q) : ''}</div>`;
  } else {
    el.innerHTML = gridHTML(R.layout);
  }
  const check = document.getElementById('check');
  if (R.phase === 'answer') {
    check.textContent = tr('Check');
    check.dataset.act = 'check';
    check.classList.remove('next');
  } else {
    check.textContent = R.i === R.size - 1 ? tr('Finish') : `${tr('Next')} →`;
    check.dataset.act = 'next';
    check.classList.add('next');
  }
  document.getElementById('pad').classList.toggle('locked', R.phase !== 'answer');
}

// Dots to count for the earliest 5–7 levels. Taking away crosses out the dots being taken.
function countersHTML(q) {
  const group = (n, crossFrom = n, cls = '') => {
    const dots = Array.from({ length: n }, (_, i) => `<i class="${i >= crossFrom ? 'x' : ''}"></i>`);
    const fives = [];
    for (let i = 0; i < dots.length; i += 5) fives.push(`<span class="five">${dots.slice(i, i + 5).join('')}</span>`);
    return `<span class="grp ${cls}">${fives.join('')}</span>`;
  };
  const inner = q.op === '+'
    ? `${group(q.a, q.a, 'ga')}<span class="plus">+</span>${group(q.b, q.b, 'gb')}`
    : group(q.a, q.a - q.b, 'ga');
  return `<div class="counters" aria-hidden="true">${inner}</div>`;
}

function gridHTML(layout) {
  const v = (id) => esc(R.values[id] ?? '');
  const cell = (c) => {
    switch (c.t) {
      case 'head': return `<div class="c head">${c.v}</div>`;
      case 'digit': return `<div class="c digit">${c.v}</div>`;
      case 'op': return `<div class="c op">${c.v}</div>`;
      case 'strike': return `<button class="c digit strike-btn ${R.strikes[c.id] ? 'struck' : ''}" data-act="strike" data-id="${c.id}">${c.v}</button>`;
      case 'in': return `<button class="c in ${cellClasses(c.id)}" data-act="cell" data-id="${c.id}">${v(c.id)}</button>`;
      case 'scratch': return `<div class="c"><button class="scratch ${R.active === c.id && R.phase === 'answer' ? 'active' : ''}" data-act="cell" data-id="${c.id}">${v(c.id)}</button></div>`;
      case 'remlabel': return `<div class="c op rem">r</div>`;
      case 'divisor': return `<div class="c digit divisor">${c.v}</div>`;
      case 'dividend': return `<div class="c digit dividend ${c.first ? 'first' : ''}">${c.scratch ? `<button class="mini ${R.active === c.scratch && R.phase === 'answer' ? 'active' : ''}" data-act="cell" data-id="${c.scratch}">${v(c.scratch)}</button>` : ''}${c.v}</div>`;
      default: return `<div class="c"></div>`;
    }
  };
  const cols = layout.rows[0].cells.length * (layout.kind === 'bus' ? 1.3 : 1);
  const rows = layout.rows.reduce((n, r) => n + (/head|scratch/.test(r.cls) ? 0.6 : 1), 0);
  return `<div class="grid kind-${layout.kind}" style="--cols:${cols};--rows:${rows}">${layout.rows.map((row) => {
    const cells = row.cells.map(cell);
    if (row.label) cells[0] = `<div class="c row-label">${tr(row.label)}</div>`;
    return `<div class="g-row r-${row.cls}">${cells.join('')}</div>`;
  }).join('')}</div>`;
}

function pressKey(k) {
  if (R.phase !== 'answer') return;
  sounds.tap();
  const id = R.active;
  const isScratch = !R.layout.inputs[id];
  if (R.q.kind === 'fact') {
    const cur = R.values.f || '';
    R.values.f = k === 'back' ? cur.slice(0, -1) : (cur + k).slice(0, 4);
    R.wrong.delete('f');
    paintQuestion();
    return;
  }
  const order = R.layout.order;
  if (k === 'back') {
    if (R.values[id]) { delete R.values[id]; }
    else if (!isScratch) {
      const prev = order[order.indexOf(id) - 1];
      if (prev) { R.active = prev; delete R.values[prev]; R.wrong.delete(prev); }
    }
    R.wrong.delete(id);
  } else {
    R.values[id] = k;
    R.wrong.delete(id);
    if (isScratch) {
      R.active = R.lastAnswerCell || R.layout.start; // hop back to where they were working
    } else {
      const next = order[order.indexOf(id) + 1];
      if (next) R.active = next;
    }
  }
  if (!isScratch) R.lastAnswerCell = R.active;
  paintQuestion();
}

function checkAnswer() {
  if (R.phase !== 'answer') return;
  const q = R.q;
  let wrong = [];
  if (q.kind === 'fact') {
    const v = R.values.f || '';
    if (!v) { say(tr('Type your answer on the number pad first.'), 'calm'); return; }
    if (Number(v) !== q.answer) wrong = ['f'];
  } else {
    const res = checkLayout(R.layout, R.values);
    if (!res.complete && !res.wrong.length) { say(tr('There are still some empty boxes to fill in.'), 'calm'); return; }
    if (!res.complete) {
      // empty boxes count as "have another look" too
      Object.entries(R.layout.inputs).forEach(([id, info]) => { if (!info.optional && !(R.values[id] ?? '')) res.wrong.push(id); });
    }
    wrong = res.wrong;
  }
  R.attempts++;

  if (!wrong.length) {
    R.phase = 'done';
    R.results[R.i] = { ok: true, tries: R.attempts };
    sounds.correct();
    say(q.kind === 'fact' || Math.random() < 0.5 ? pick(trList('PRAISE', PRAISE)) : pick(trList('COLUMN_PRAISE', COLUMN_PRAISE)), 'happy');
    paintQuestion();
    paintProgress();
    bounceCoach();
    if (q.kind === 'fact') R.autoNext = setTimeout(() => { if (R && R.phase === 'done' && R.q === q) nextQuestion(); }, 1100);
    return;
  }

  if (R.attempts >= R.maxTries) {
    // show the answer kindly and move on
    R.phase = 'done';
    R.revealed = true;
    R.wrong = new Set();
    R.results[R.i] = { ok: false, tries: R.attempts };
    if (q.kind === 'fact') R.values.f = String(q.answer);
    else Object.entries(R.layout.inputs).forEach(([id, info]) => { R.values[id] = info.optional && info.expected === '0' ? '' : info.expected; });
    sounds.tryAgain();
    say(q.kind === 'fact'
      ? tr("It's {sum} = {answer}. You'll remember it next time!", { sum: `${q.a} ${q.op} ${q.b}`, answer: q.answer })
      : tr("Here's the answer: {answer}. Have a look at how it works, then try the next one.", { answer: `${fmtNum(answerOf(q))}${q.kind === 'bus' && q.rem && q.a % q.b ? ` r ${q.a % q.b}` : ''}` }), 'calm');
    paintQuestion();
    paintProgress();
    return;
  }

  R.wrong = new Set(wrong);
  sounds.tryAgain();
  if (q.kind === 'fact') {
    say(pick(trList('FACT_OOPS', FACT_OOPS)), 'oops');
  } else {
    const where = placeWord(R.layout, wrong);
    R.active = R.layout.order.find((id) => wrong.includes(id)) || R.active;
    say(tr(pick(trList('COLUMN_OOPS', COLUMN_OOPS)), { where }), 'oops');
  }
  paintQuestion();
}

function bounceCoach() {
  const c = document.querySelector('.coach .animal');
  if (!c) return;
  c.classList.remove('jump');
  void c.offsetWidth;
  c.classList.add('jump');
}

function nextQuestion() {
  clearTimeout(R.autoNext);
  if (R.i < R.size - 1) {
    R.i++;
    loadQuestion();
  } else {
    finishRound();
  }
}

// ================= Results & reward =================
function finishRound() {
  stopTimer();
  const correct = R.results.filter((r) => r && r.ok).length;
  const secs = Math.round((Date.now() - R.start) / 1000);
  const s = SUBJECTS[R.subject];
  const max = s.levels.length;
  const before = player.levels[R.subject] || 1;
  const passMark = passMarkOf(R.subject);
  const passed = correct >= passMark;
  if (passed && before <= max) player.levels[R.subject] = before + 1;
  player.history.push({ date: new Date().toISOString(), subject: R.subject, level: R.level, correct, total: R.size, secs });

  let timeMsg = '';
  if (player.settings.timer) {
    const key = `${R.subject}-${R.level}`;
    const best = player.best[key];
    if (!best || secs < best) {
      player.best[key] = secs;
      timeMsg = '⏱ ' + (best ? tr('{t}: you beat your own best of {best}!', { t: fmtTime(secs), best: fmtTime(best) }) : tr("{t}: that's your first time for this level.", { t: fmtTime(secs) }));
    } else {
      timeMsg = '⏱ ' + tr('{t}. Your best is {best}.', { t: fmtTime(secs), best: fmtTime(best) });
    }
  }
  store.save();
  session.rounds++;
  session.questions += R.size;

  const stars = correct >= R.size * 0.9 ? 3 : correct >= R.size * 0.7 ? 2 : 1;
  let levelMsg;
  if (passed && before < max) levelMsg = '🎉 ' + tr("You've moved up to <strong>Level {n}: {label}</strong>!", { n: before + 1, label: tr(s.levels[before].label) });
  else if (passed) levelMsg = '🌟 ' + tr("You've mastered every level of {subject}. Amazing!", { subject: tr(s.name).toLowerCase() });
  else levelMsg = tr("You need {pass} right to move up. Let's practise Level {level} a bit more. You're getting stronger every round!", { pass: passMark, level: R.level });
  const choices = rewardChoices(player.items);
  const breakMsg = session.rounds % 2 === 0 ? `<p class="break">${tr("You've done {n} questions today. Maybe time for a break? Your classroom will be waiting.", { n: session.questions })}</p>` : '';

  if (passed) sounds.levelUp(); else sounds.reward();

  render(`
    <div class="screen center results" style="--c:${s.colour}">
      <div class="results-top">
        ${animalSVG(player.animal, 'jump-loop')}
        <div>
          <h2>${tr('Round complete!')}</h2>
          <p class="score">${tr('You got <strong>{c}</strong> out of {n}', { c: correct, n: R.size })}</p>
          <p class="stars">${'★'.repeat(stars)}<span>${'★'.repeat(3 - stars)}</span></p>
        </div>
      </div>
      <p class="level-msg">${levelMsg}</p>
      ${timeMsg ? `<p class="time-msg">${timeMsg}</p>` : ''}
      ${breakMsg}
      ${choices.length ? `
        <h3>${tr('Choose something new for your classroom')}</h3>
        <div class="reward-grid">
          ${choices.map((it) => `<button class="reward" data-act="reward" data-id="${it.id}">${itemSVG(it)}<span>${tr(it.name)}</span></button>`).join('')}
        </div>` : `<h3>${tr('Your classroom is complete!')} 🎉</h3><button class="btn big" data-act="home">${tr('Back home')}</button>`}
    </div>`, {
    reward: (el) => {
      player.items.push(el.dataset.id);
      store.save();
      sounds.reward();
      showClassroom(el.dataset.id);
    },
    home: () => showHome(),
  });
}

// ================= Classroom =================
function showClassroom(fresh = null) {
  render(`
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost" data-act="home">← ${tr('Home')}</button>
        <h2>${tr("{name}'s classroom", { name: esc(player.name) })}</h2>
        <span class="muted">${tr('{n} of {total}', { n: player.items.length, total: ITEMS.length })}</span>
      </div>
      ${fresh ? `<p class="new-item">✨ ${tr('New in your classroom: <strong>{item}</strong>!', { item: tr(ITEM_BY_ID[fresh].name) })}</p>` : ''}
      <div class="classroom">${classroomSVG(player.items, ANIMALS[player.animal].svg, fresh)}</div>
      ${!player.items.length ? `<p class="muted center-text">${tr('Your classroom is empty for now. Finish a round to choose your first thing!')}</p>` : ''}
      ${fresh ? `<div class="center-text"><button class="btn big" data-act="home">${tr('Back home')}</button></div>` : ''}
    </div>`, { home: () => showHome() });
}

// ================= Grown-ups =================
function showParents() {
  const list = store.players();
  const fmtDate = (iso) => new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
  const auto = store.autoBackupInfo();
  render(`
    <div class="screen parents">
      <div class="topbar">
        <button class="btn ghost" data-act="back">← ${tr('Done')}</button>
        <h2>${tr('Grown-ups')}</h2><span></span>
      </div>
      <p class="muted">${tr('Progress is saved on this device only. Safari and a Home Screen icon keep separate progress, and so do the iPad and iPhone. To move a player across, save a backup file here, then use "Restore from backup" on the other one.')}</p>
      <div class="parent-actions">
        <button class="btn" data-act="export">⬇︎ ${tr('Save a backup file')}</button>
        <button class="btn ghost" data-act="import">⬆︎ ${tr('Restore from backup')}</button>
        ${auto ? `<button class="btn ghost" data-act="autoRestore">↺ ${tr('Go back to {day}', { day: fmtDate(auto.day) })}</button>` : ''}
        <input type="file" id="importFile" accept=".json,application/json" hidden>
      </div>
      ${list.length ? '' : `<p>${tr('No players yet.')}</p>`}
      ${list.map((p) => {
        const recent = p.history.slice(-10).reverse();
        return `
        <section class="parent-card">
          <header>${animalSVG(p.animal)}<div><h3>${esc(p.name)}</h3><span class="muted">${plural(p.history.length, '{n} round played', '{n} rounds played')} · ${plural(p.items.length, '{n} classroom thing', '{n} classroom things')}</span></div>
            <button class="btn ghost danger" data-act="del" data-id="${p.id}">${tr('Delete')}</button></header>
          <div class="band-row"><span class="muted">${tr('Questions for')}</span>
            <div class="seg">${Object.entries(BANDS).map(([k, b]) => `<button class="btn seg-btn ${bandOf(p) === k ? 'on' : 'ghost'}" data-act="band" data-id="${p.id}" data-b="${k}">${tr(b.label)}</button>`).join('')}</div>
          </div>
          <div class="lv-table">
            ${subjectsFor(p).map(([k, s]) => {
              const lvl = p.levels[k] || 1;
              const shown = Math.min(lvl, s.levels.length);
              return `<div class="lv-row"><span class="lv-name" style="color:${s.colour}">${tr(s.name)}</span>
                <span class="lv-label">${tr('Level {n}: {label}', { n: shown, label: tr(s.levels[shown - 1].label) })}${lvl > s.levels.length ? ` (${tr('mastered')})` : ''}</span>
                <button class="btn small" data-act="lvl" data-id="${p.id}" data-s="${k}" data-d="-1">−</button>
                <button class="btn small" data-act="lvl" data-id="${p.id}" data-s="${k}" data-d="1">+</button></div>`;
            }).join('')}
          </div>
          ${recent.length ? `<table class="hist"><tr><th>${tr('Date')}</th><th>${tr('Subject')}</th><th>${tr('Level')}</th><th>${tr('Score')}</th><th>${tr('Time')}</th></tr>
            ${recent.map((h) => `<tr><td>${fmtDate(h.date)}</td><td>${SUBJECTS[h.subject] ? tr(SUBJECTS[h.subject].name) : h.subject}</td><td>${h.level}</td><td>${h.correct}/${h.total}</td><td>${fmtTime(h.secs)}</td></tr>`).join('')}</table>` : `<p class="muted">${tr('No rounds played yet.')}</p>`}
        </section>`;
      }).join('')}
    </div>`, {
    back: () => showPlayers(),
    lvl: (el) => {
      const p = store.getPlayer(el.dataset.id);
      const max = SUBJECTS[el.dataset.s].levels.length + 1;
      p.levels[el.dataset.s] = Math.max(1, Math.min(max, (p.levels[el.dataset.s] || 1) + Number(el.dataset.d)));
      store.save();
      showParents();
    },
    // Switching age group only changes which subjects are shown. Levels for both groups are kept.
    band: (el) => {
      const p = store.getPlayer(el.dataset.id);
      p.band = el.dataset.b;
      store.save();
      showParents();
    },
    del: (el) => {
      const p = store.getPlayer(el.dataset.id);
      modal(`<p>${tr('Delete <strong>{name}</strong> and all their progress?', { name: esc(p.name) })}</p><p class="muted">${tr("This can't be undone (unless you have a backup file).")}</p>
        <div class="modal-btns"><button class="btn" data-act="no">${tr('Keep')}</button><button class="btn danger" data-act="yes">${tr('Delete')}</button></div>`,
        { yes: () => { store.deletePlayer(p.id); showParents(); } });
    },
    export: () => {
      const blob = new Blob([store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `critter-classroom-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },
    import: () => document.getElementById('importFile').click(),
    autoRestore: () => modal(`<p>${tr('Put all progress back to how it was when the game was first opened on {day}?', { day: fmtDate(auto.day) })}</p><p class="muted">${tr('Anything played since then will be lost. This is only for if something has gone wrong.')}</p>
      <div class="modal-btns"><button class="btn ghost" data-act="no">${tr('Cancel')}</button><button class="btn" data-act="yes">${tr('Go back')}</button></div>`,
      { yes: () => { store.restoreAutoBackup(); showParents(); } }),
  });
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    modal(`<p>${tr('Replace all the progress on this device with the backup?')}</p>
      <div class="modal-btns"><button class="btn ghost" data-act="no">${tr('Cancel')}</button><button class="btn" data-act="yes">${tr('Replace')}</button></div>`, {
      yes: () => {
        try { store.importJSON(text); showParents(); }
        catch (err) { modal(`<p>${esc(tr(err.message))}</p><div class="modal-btns"><button class="btn" data-act="ok">${tr('OK')}</button></div>`, {}); }
      },
    });
  });
}

// ================= Start =================
function boot() {
  const last = store.getPlayer(store.lastPlayerId());
  if (!store.players().length) showCreate();
  else if (last && store.players().length === 1) { player = last; setSound(player.settings.sound); showHome(); }
  else showPlayers();
}
boot();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
