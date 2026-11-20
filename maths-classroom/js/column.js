// Column-method layouts: addition, subtraction, short multiplication and bus stop division.
// A layout is a list of rows; each row is a list of cells. Answer boxes are checked;
// "scratch" boxes (carries / exchanges) are there to help and are never marked.

import { digitAt } from './levels.js';
import { tr, trList } from './i18n.js';

const PLACE_SHORT = ['O', 'T', 'H', 'Th', 'TTh', 'HTh', 'M'];
const placeName = (p) => tr(PLACE_NAME[p]);
export const PLACE_NAME = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
const len = (n) => String(n).length;

export function answerOf(q) {
  switch (q.kind) {
    case 'add': return q.a + q.b;
    case 'sub': return q.a - q.b;
    case 'smul': return q.a * q.b;
    case 'bus': return Math.floor(q.a / q.b);
    default: return q.answer;
  }
}

// Builds the grid. Returns { rows, inputs: {id: {expected, optional, place}}, order: [ids], start }
export function buildLayout(q) {
  const inputs = {};
  const order = [];
  const rows = [];
  const ans = answerOf(q);

  const answerCell = (id, digit, optional, place) => {
    inputs[id] = { expected: String(digit), optional, place };
    order.push(id);
    return { t: 'in', id };
  };

  if (q.kind === 'add' || q.kind === 'sub' || q.kind === 'smul') {
    const W = q.kind === 'sub' ? len(q.a) : q.kind === 'add' ? Math.max(len(q.a), len(q.b)) + 1 : len(q.a) + 1;
    const placeOf = (j) => W - 1 - j; // grid column j → place value
    const cols = (fn) => [...Array(W).keys()].map((j) => fn(placeOf(j)));
    const numRow = (n, op) => [op ? { t: 'op', v: op } : { t: 'empty' }, ...cols((p) => (p < len(n) ? { t: 'digit', v: digitAt(n, p), place: p } : { t: 'empty' }))];
    const ansLen = len(ans);

    rows.push({ cls: 'head', cells: [{ t: 'empty' }, ...cols((p) => ({ t: 'head', v: trList('PLACE_SHORT', PLACE_SHORT)[p] }))] });

    if (q.kind === 'sub') {
      rows.push({ cls: 'scratch-row', label: 'exchange', cells: [{ t: 'empty' }, ...cols((p) => (p < len(q.a) ? { t: 'scratch', id: 'x' + p } : { t: 'empty' }))] });
      const top = numRow(q.a);
      top.forEach((c) => { if (c.t === 'digit') { c.t = 'strike'; c.id = 's' + c.place; } });
      rows.push({ cls: 'num', cells: top });
      rows.push({ cls: 'num', cells: numRow(q.b, '−') });
    } else if (q.kind === 'add') {
      rows.push({ cls: 'num', cells: numRow(q.a) });
      rows.push({ cls: 'num', cells: numRow(q.b, '+') });
      rows.push({ cls: 'scratch-row', label: 'carry', cells: [{ t: 'empty' }, ...cols((p) => (p >= 1 ? { t: 'scratch', id: 'c' + p } : { t: 'empty' }))] });
    } else {
      rows.push({ cls: 'num', cells: numRow(q.a) });
      rows.push({ cls: 'num', cells: numRow(q.b, '×') });
    }

    rows.push({ cls: 'answer', cells: [{ t: 'empty' }, ...cols((p) => answerCell('a' + p, digitAt(ans, p), p >= ansLen, p))] });
    // typing goes right → left, so put the ones first
    order.sort((x, y) => inputs[x].place - inputs[y].place);

    if (q.kind === 'smul') {
      rows.push({ cls: 'scratch-row', label: 'carry', cells: [{ t: 'empty' }, ...cols((p) => (p >= 1 ? { t: 'scratch', id: 'c' + p } : { t: 'empty' }))] });
    }
    return { rows, inputs, order, start: order[0], kind: q.kind };
  }

  if (q.kind === 'bus') {
    const D = String(q.a);
    const L = D.length;
    const Q = String(ans).padStart(L, '0');
    const firstNonZero = Q.search(/[1-9]/);
    const top = [{ t: 'empty' }];
    for (let i = 0; i < L; i++) top.push(answerCell('q' + i, Q[i], i < firstNonZero, i));
    if (q.rem) {
      top.push({ t: 'remlabel', v: 'r' });
      const r = q.a % q.b;
      inputs.r = { expected: String(r), optional: r === 0, place: L };
      order.push('r');
      top.push({ t: 'in', id: 'r' });
    }
    rows.push({ cls: 'quotient', cells: top });
    const shelter = [{ t: 'divisor', v: q.b }];
    for (let i = 0; i < L; i++) shelter.push({ t: 'dividend', v: D[i], first: i === 0, scratch: i > 0 ? 'k' + i : null });
    rows.push({ cls: 'shelter', cells: shelter });
    return { rows, inputs, order, start: order[0], kind: 'bus' };
  }
  throw new Error('Unknown question kind ' + q.kind);
}

// Returns { complete, wrong: [ids] }. complete=false means a required box is still empty.
export function checkLayout(layout, values) {
  const wrong = [];
  let complete = true;
  for (const [id, info] of Object.entries(layout.inputs)) {
    const v = values[id] ?? '';
    if (info.optional) {
      if (v !== '' && v !== info.expected) wrong.push(id);
    } else if (v === '') {
      complete = false;
    } else if (v !== info.expected) {
      wrong.push(id);
    }
  }
  return { complete, wrong };
}

// Which column to talk about when something's wrong: the first wrong box in working order.
export function placeWord(layout, wrong) {
  const first = layout.order.find((id) => wrong.includes(id));
  if (!first) return '';
  if (layout.kind === 'bus') return tr(first === 'r' ? 'the remainder' : 'the answer');
  return tr('the {place} column', { place: placeName(layout.inputs[first].place) });
}

// A gentle hint about the box the child is working on. Explains the step, doesn't give the digit.
export function hintFor(q, layout, activeId) {
  const id = layout.inputs[activeId] ? activeId : layout.order[0];
  const info = layout.inputs[id];

  if (q.kind === 'add') {
    const p = info.place;
    const mod = 10 ** p;
    const carryIn = Math.floor(((q.a % mod) + (q.b % mod)) / mod);
    const a = digitAt(q.a, p), b = digitAt(q.b, p);
    const name = placeName(p);
    if (p >= len(q.a) && p >= len(q.b)) {
      return carryIn ? tr("There's nothing left to add in the {name} except the 1 you carried.", { name }) : tr("There's nothing to add in the {name} column, so you can leave this box empty.", { name });
    }
    const parts = [a];
    if (p < len(q.b)) parts.push(b);
    if (carryIn) parts.push(tr('{n} carried', { n: carryIn }));
    return tr('In the {name}: {sum} = ? If the answer is 10 or more, write the ones digit here and carry the 1 to the next column.', { name, sum: parts.join(' + ') });
  }

  if (q.kind === 'sub') {
    const p = info.place;
    const mod = 10 ** p;
    const borrowIn = q.a % mod < q.b % mod ? 1 : 0;
    const a = digitAt(q.a, p), b = digitAt(q.b, p);
    const name = placeName(p);
    let pre = '';
    let top = a;
    if (borrowIn) {
      if (a === 0) { pre = tr("This 0 had to exchange from the next column first (making 10), then gave 1 away, so it's now 9.") + ' '; top = 9; }
      else { pre = tr("The {a} in the {name} gave 1 away to the column on its right, so it's now {now}.", { a, name, now: a - 1 }) + ' '; top = a - 1; }
    }
    if (top < b) return pre + tr("In the {name}: {top} − {b} won't work, so exchange 1 from the next column along. Now it's {top10} − {b} = ?", { name, top, b, top10: top + 10 });
    return pre + tr('In the {name}: {top} − {b} = ?', { name, top, b });
  }

  if (q.kind === 'smul') {
    const p = info.place;
    const mod = 10 ** p;
    const carryIn = Math.floor(((q.a % mod) * q.b) / mod);
    const name = placeName(p);
    if (p >= len(q.a)) return carryIn ? tr('Nothing left to multiply. Just write the {n} you carried.', { n: carryIn }) : tr('Nothing left to multiply, so you can leave this box empty.');
    const a = digitAt(q.a, p);
    return [
      tr('In the {name}: {a} × {b} = ?', { name, a, b: q.b }),
      carryIn ? tr('Then add the {n} you carried.', { n: carryIn }) : '',
      tr('Write the ones digit here and carry the tens to the next column.'),
    ].filter(Boolean).join(' ');
  }

  if (q.kind === 'bus') {
    if (id === 'r') return tr("What's left over at the very end? That's the remainder.");
    const i = info.place;
    const D = String(q.a);
    const before = i === 0 ? 0 : Number(D.slice(0, i)) % q.b;
    const running = before * 10 + Number(D[i]);
    const carried = before ? ' ' + tr("(that's the {c} you carried and the {d})", { c: before, d: D[i] }) : '';
    if (running < q.b) return tr('How many {b}s go into {n}{carried}? None! Write 0 (or leave it empty at the start) and carry the {n} over to the next digit.', { b: q.b, n: running, carried });
    return tr('How many {b}s go into {n}{carried}? Write that above, and carry anything left over to the next digit.', { b: q.b, n: running, carried });
  }

  // ages 5–7: adding and taking away
  if (q.op === '+') {
    if (q.dots) return tr('Count all the dots, starting from 1.');
    const [big, small] = q.a >= q.b ? [q.a, q.b] : [q.b, q.a];
    if (big < 10 && big + small > 10) return tr("Make 10 first! {big} + {need} = 10. Then add the {left} that's left.", { big, need: 10 - big, left: small - (10 - big) });
    if (small === 0) return tr("Adding 0 doesn't change anything!");
    const seq = Array.from({ length: Math.min(small, 3) }, (_, k) => big + k + 1);
    return tr('Start at {big} and count on {small}: {seq}', { big, small, seq: seq.join(', ') + (small > 3 ? '…' : '') });
  }
  if (q.op === '−') {
    if (q.dots) return tr("Count the dots that aren't crossed out.");
    const ones = q.a % 10;
    if (q.a > 10 && q.a < 20 && q.b < 10 && q.b > ones) return tr('Take away {ones} to get to 10 first. Then take away {more} more.', { ones, more: q.b - ones });
    if (q.b === q.a) return tr('Taking everything away leaves nothing!');
    const seq = Array.from({ length: Math.min(q.b, 3) }, (_, k) => q.a - k - 1);
    return tr('Start at {a} and count back {b}: {seq}', { a: q.a, b: q.b, seq: seq.join(', ') + (q.b > 3 ? '…' : '') });
  }

  // times-table facts
  if (q.op === '×') {
    const [count, step] = q.a <= q.b ? [q.a, q.b] : [q.b, q.a];
    const seq = Array.from({ length: Math.min(count - 1, 4) }, (_, k) => step * (k + 1));
    return tr("{count} lots of {step}. Count up in {step}s: {seq}… keep going until you've counted {count}.", { count, step, seq: seq.join(', ') });
  }
  const seq = Array.from({ length: 4 }, (_, k) => q.b * (k + 1));
  return tr('How many {b}s make {a}? Count up in {b}s: {seq}… and count how many steps it takes.', { a: q.a, b: q.b, seq: seq.join(', ') });
}
