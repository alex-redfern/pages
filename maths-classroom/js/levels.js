// Question generators and level definitions.
// Every round is ROUND_SIZE questions. A question is either:
//   { kind: 'fact', op: '×' | '÷', a, b, answer }      — answered in one box
//   { kind: 'add' | 'sub' | 'smul' | 'bus', a, b, rem } — answered in a column grid

export const ROUND_SIZE = 20;
export const PASS_MARK = 16; // correct answers needed to move up a level

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nDigit = (n) => rnd(10 ** (n - 1), 10 ** n - 1);
export const digitAt = (num, place) => Math.floor(num / 10 ** place) % 10;
const len = (n) => String(n).length;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle, then nudge apart identical neighbours so the same question never appears twice in a row.
function spreadOut(qs, keyFn) {
  const a = shuffle(qs);
  for (let i = 1; i < a.length; i++) {
    if (keyFn(a[i]) === keyFn(a[i - 1])) {
      const j = a.findIndex((q, k) => k > i && keyFn(q) !== keyFn(a[i - 1]));
      if (j > -1) [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a;
}

function carries(a, b) {
  let c = 0, n = 0;
  for (let p = 0; p < 7; p++) {
    const s = digitAt(a, p) + digitAt(b, p) + c;
    c = s >= 10 ? 1 : 0;
    n += c;
  }
  return n;
}
function borrows(a, b) {
  let br = 0, n = 0;
  for (let p = 0; p < 7; p++) {
    const d = digitAt(a, p) - br - digitAt(b, p);
    br = d < 0 ? 1 : 0;
    n += br;
  }
  return n;
}

// ---------- Addition ----------
function addQ(nA, nB, mode) {
  for (let tries = 0; tries < 5000; tries++) {
    const a = nDigit(nA), b = nDigit(nB);
    if (a + b >= 1_000_000) continue;
    const c = carries(a, b);
    if (mode === 'none' && c > 0) continue;
    if (mode === 'carry' && c === 0) continue;
    return { kind: 'add', a, b };
  }
  return { kind: 'add', a: 10 ** (nA - 1), b: 10 ** (nB - 1) };
}

// ---------- Subtraction ----------
function withZeros(n) {
  // n-digit number with one or two zeros in the middle, e.g. 40,306
  const digits = String(nDigit(n)).split('');
  const spots = shuffle([...Array(n - 1).keys()].map((i) => i + 1)).slice(0, n > 4 ? 2 : 1);
  spots.forEach((s) => { if (s < n - 1 || Math.random() < 0.5) digits[s] = '0'; });
  return Number(digits.join(''));
}
function subQ(nA, nB, mode, zeros = false) {
  for (let tries = 0; tries < 5000; tries++) {
    const a = zeros ? withZeros(nA) : nDigit(nA);
    const b = nDigit(nB);
    if (b >= a) continue;
    const br = borrows(a, b);
    if (mode === 'none' && br > 0) continue;
    if (mode === 'borrow' && br === 0) continue;
    if (zeros && br < 2) continue;
    return { kind: 'sub', a, b };
  }
  return { kind: 'sub', a: 10 ** nA - 1, b: 10 ** (nB - 1) };
}

// ---------- Times tables ----------
// Build 20 fact questions. Half (or more) come from the "focus" tables, the rest from review tables.
// Pairs are often shown both ways round (3 × 4 and 4 × 3) in the same round.
function factRound(op, focus, review = []) {
  const pairs = (tables) => tables.flatMap((t) => [...Array(11).keys()].map((i) => [t, i + 2])); // ×2 … ×12
  const focusPairs = shuffle(pairs(focus));
  const reviewPairs = shuffle(pairs(review));
  const qs = [];
  const add = (t, n) => {
    if (op === '×') qs.push({ kind: 'fact', op: '×', a: t, b: n, answer: t * n });
    else qs.push({ kind: 'fact', op: '÷', a: t * n, b: t, answer: n });
  };
  const nFocus = review.length ? 13 : ROUND_SIZE;
  let fi = 0, ri = 0;
  while (qs.length < nFocus) {
    const [t, n] = focusPairs[fi++ % focusPairs.length];
    if (Math.random() < 0.5) add(t, n); else add(n, t);
    // sometimes add the inverse straight into the round too
    if (qs.length < nFocus && t !== n && Math.random() < 0.35) {
      if (Math.random() < 0.5) add(n, t); else add(t, n);
    }
  }
  while (qs.length < ROUND_SIZE && reviewPairs.length) {
    const [t, n] = reviewPairs[ri++ % reviewPairs.length];
    if (Math.random() < 0.5) add(t, n); else add(n, t);
  }
  return spreadOut(qs.slice(0, ROUND_SIZE), (q) => `${q.a}${q.op}${q.b}`);
}

// ---------- Short multiplication ----------
function smulQ(nA, minB = 2) {
  return { kind: 'smul', a: nDigit(nA), b: rnd(minB, 9) };
}

// ---------- Bus stop division ----------
function busQ(nD, remainders) {
  for (let tries = 0; tries < 5000; tries++) {
    const d = rnd(2, 9);
    let a = nDigit(nD);
    if (!remainders) a -= a % d;
    else if (a % d === 0 && Math.random() < 0.8) continue; // mostly have a remainder
    if (len(a) !== nD || a < d * 2) continue;
    return { kind: 'bus', a, b: d, rem: remainders };
  }
  return { kind: 'bus', a: 84, b: 4, rem: false };
}

const many = (fn) => () => Array.from({ length: ROUND_SIZE }, fn);

export const SUBJECTS = {
  add: {
    name: 'Addition', symbol: '+', colour: 'var(--add)',
    levels: [
      { label: '2 digits', make: many(() => addQ(2, 2, 'none')) },
      { label: '2 digits with carrying', make: many(() => addQ(2, 2, 'carry')) },
      { label: '3 digits', make: many(() => addQ(3, 3, 'none')) },
      { label: '3 digits with carrying', make: many(() => addQ(3, 3, 'carry')) },
      { label: '4 digits + 3 digits', make: many(() => addQ(4, 3, 'carry')) },
      { label: '4 digits', make: many(() => addQ(4, 4, 'carry')) },
      { label: '5 digits + 4 digits', make: many(() => addQ(5, 4, 'carry')) },
      { label: '5 digits', make: many(() => addQ(5, 5, 'carry')) },
      { label: '6 digits + 5 digits', make: many(() => addQ(6, 5, 'carry')) },
      { label: '6 digits', make: many(() => addQ(6, 6, 'carry')) },
    ],
  },
  sub: {
    name: 'Subtraction', symbol: '−', colour: 'var(--sub)',
    levels: [
      { label: '2 digits', make: many(() => subQ(2, 2, 'none')) },
      { label: '2 digits with exchanging', make: many(() => subQ(2, 2, 'borrow')) },
      { label: '3 digits', make: many(() => subQ(3, 3, 'none')) },
      { label: '3 digits with exchanging', make: many(() => subQ(3, 3, 'borrow')) },
      { label: '4 digits − 3 digits', make: many(() => subQ(4, 3, 'borrow')) },
      { label: '4 digits, with zeros', make: many(() => (Math.random() < 0.5 ? subQ(4, 4, 'borrow') : subQ(4, 3, 'borrow', true))) },
      { label: '5 digits − 4 digits', make: many(() => subQ(5, 4, 'borrow')) },
      { label: '5 digits', make: many(() => subQ(5, 5, 'borrow')) },
      { label: '6 digits − 5 digits', make: many(() => subQ(6, 5, 'borrow')) },
      { label: '6 digits, with zeros', make: many(() => (Math.random() < 0.5 ? subQ(6, 6, 'borrow') : subQ(6, 5, 'borrow', true))) },
    ],
  },
  mul: {
    name: 'Multiplication', symbol: '×', colour: 'var(--mul)',
    levels: [
      { label: '2, 5 and 10 times tables', make: () => factRound('×', [2, 5, 10]) },
      { label: '3 and 4 times tables', make: () => factRound('×', [3, 4], [2, 5, 10]) },
      { label: '8 times table', make: () => factRound('×', [8], [3, 4]) },
      { label: '6 times table', make: () => factRound('×', [6], [3, 4, 8]) },
      { label: '7 times table', make: () => factRound('×', [7], [6, 8]) },
      { label: '9 and 11 times tables', make: () => factRound('×', [9, 11], [6, 7]) },
      { label: '12 times table', make: () => factRound('×', [12], [6, 7, 8, 9]) },
      { label: 'All tables to 12 × 12', make: () => factRound('×', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) },
      { label: '2 digits × 1 digit', make: many(() => smulQ(2)) },
      { label: '3 digits × 1 digit', make: many(() => smulQ(3)) },
      { label: '4 digits × 1 digit', make: many(() => smulQ(4, 3)) },
    ],
  },
  div: {
    name: 'Division', symbol: '÷', colour: 'var(--div)',
    levels: [
      { label: 'Dividing by 2, 5 and 10', make: () => factRound('÷', [2, 5, 10]) },
      { label: 'Dividing by 3 and 4', make: () => factRound('÷', [3, 4], [2, 5, 10]) },
      { label: 'Dividing by 8', make: () => factRound('÷', [8], [3, 4]) },
      { label: 'Dividing by 6', make: () => factRound('÷', [6], [3, 4, 8]) },
      { label: 'Dividing by 7', make: () => factRound('÷', [7], [6, 8]) },
      { label: 'Dividing by 9 and 11', make: () => factRound('÷', [9, 11], [6, 7]) },
      { label: 'Dividing by 12', make: () => factRound('÷', [12], [6, 7, 8, 9]) },
      { label: 'All tables to 144 ÷ 12', make: () => factRound('÷', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) },
      { label: 'Bus stop: 2 digits', make: many(() => busQ(2, false)) },
      { label: 'Bus stop: 3 digits', make: many(() => busQ(3, false)) },
      { label: 'Bus stop: 4 digits', make: many(() => busQ(4, false)) },
      { label: 'Bus stop with remainders', make: many(() => busQ(pick([3, 4]), true)) },
    ],
  },
};

export function makeRound(subject, level) {
  const lv = SUBJECTS[subject].levels[Math.min(level, SUBJECTS[subject].levels.length) - 1];
  return lv.make();
}
