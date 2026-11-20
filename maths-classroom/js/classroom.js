// The classroom scene (1000 × 600) and every object that can be earned.
// Each item has a box [x, y, w, h] used to show it on its own as a reward card.
// `needs` means it sits on another item, so it's only offered once that item is in the room.

import { tr } from './i18n.js';

const FONT = `font-family="Chalkboard SE, Comic Sans MS, ui-rounded, sans-serif"`;

export const BASE_SCENE = `
  <rect width="1000" height="390" fill="#FDF0D5"/>
  <rect y="380" width="1000" height="220" fill="#DDB892"/>
  <path d="M0 430 H1000 M0 490 H1000 M0 556 H1000" stroke="#C9A27E" stroke-width="3"/>
  <path d="M120 380 L80 430 M360 430 L340 490 M700 490 L720 556 M900 380 L930 430 M560 380 L560 430 M220 490 L190 556 M450 556 L440 600 M840 556 L860 600" stroke="#C9A27E" stroke-width="3"/>
  <rect y="370" width="1000" height="14" fill="#B08968"/>
  <rect x="50" y="70" width="180" height="190" rx="6" fill="#BDE0FE" stroke="#fff" stroke-width="10"/>
  <ellipse cx="110" cy="120" rx="34" ry="14" fill="#fff"/><ellipse cx="130" cy="110" rx="22" ry="14" fill="#fff"/>
  <ellipse cx="185" cy="200" rx="24" ry="10" fill="#fff" opacity=".85"/>
  <path d="M140 70 V260 M50 165 H230" stroke="#fff" stroke-width="8"/>
  <rect x="40" y="258" width="200" height="12" rx="3" fill="#fff"/>`;

const bunting = (() => {
  const cols = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF'];
  let s = `<path d="M0 14 Q250 44 500 14 Q750 44 1000 14" stroke="#8C5E3C" stroke-width="3" fill="none"/>`;
  for (let i = 0, x = 25; x < 1000; x += 50, i++) {
    const t = (x % 500) / 500;
    const y = 14 + 60 * t * (1 - t);
    s += `<path d="M${x - 17} ${y} L${x + 17} ${y} L${x} ${y + 30}Z" fill="${cols[i % cols.length]}"/>`;
  }
  return s;
})();

const book = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>`;

const pupilDesk = (dx, dy, chair) => `
  <rect x="${400 + dx}" y="${404 + dy}" width="150" height="14" rx="4" fill="#D4A373" stroke="#A9764A" stroke-width="3"/>
  <rect x="${410 + dx}" y="${418 + dy}" width="8" height="66" fill="#8D99AE"/>
  <rect x="${532 + dx}" y="${418 + dy}" width="8" height="66" fill="#8D99AE"/>
  <rect x="${445 + dx}" y="${440 + dy}" width="62" height="34" rx="8" fill="${chair}"/>
  <rect x="${440 + dx}" y="${472 + dy}" width="72" height="12" rx="4" fill="${chair}"/>
  <rect x="${446 + dx}" y="${484 + dy}" width="6" height="30" fill="#6C757D"/>
  <rect x="${500 + dx}" y="${484 + dy}" width="6" height="30" fill="#6C757D"/>`;

export const ITEMS = [
  // ---- On the wall ----
  { id: 'bunting', name: 'Bunting', box: [0, 0, 1000, 70], svg: bunting },
  {
    id: 'whiteboard', name: 'Whiteboard', box: [292, 56, 316, 196],
    // a getter, so the writing on the board follows the chosen language
    get svg() {
      return `<rect x="300" y="64" width="300" height="170" rx="6" fill="#fff" stroke="#9AA5B1" stroke-width="8"/>
      <rect x="330" y="236" width="240" height="9" rx="3" fill="#9AA5B1"/>
      <rect x="350" y="230" width="30" height="7" rx="2" fill="#4D96FF"/><rect x="390" y="230" width="30" height="7" rx="2" fill="#FF6B6B"/>
      <text x="330" y="125" font-size="38" fill="#4D96FF" ${FONT}>3 × 4 = 12</text>
      <text x="330" y="185" font-size="30" fill="#FF6B6B" ${FONT}>${tr('Great work!')}</text>`;
    },
  },
  {
    id: 'clock', name: 'Clock', box: [622, 56, 76, 76],
    svg: `<circle cx="660" cy="94" r="31" fill="#fff" stroke="#E56B6F" stroke-width="6"/>
      <path d="M660 70 V75 M660 113 V118 M636 94 H641 M679 94 H684" stroke="#2B2D42" stroke-width="3" stroke-linecap="round"/>
      <path d="M660 94 V76 M660 94 L674 101" stroke="#2B2D42" stroke-width="4" stroke-linecap="round"/>
      <circle cx="660" cy="94" r="3.5" fill="#2B2D42"/>`,
  },
  {
    id: 'map', name: 'World map', box: [714, 62, 172, 112],
    svg: `<rect x="720" y="68" width="160" height="100" rx="3" fill="#A9DEF9" stroke="#8C5E3C" stroke-width="5"/>
      <path d="M735 85 q15 -8 30 2 q8 14 -4 22 q-6 10 -12 22 q-10 -6 -8 -20 q-12 -10 -6 -26Z" fill="#6BCB77"/>
      <path d="M790 82 q14 -6 24 0 q20 -2 34 8 q4 12 -12 16 q-6 18 -20 22 q-8 -10 -12 -22 q-14 -6 -14 -24Z" fill="#6BCB77"/>
      <path d="M850 132 q12 -4 18 4 q-2 12 -14 12 q-8 -6 -4 -16Z" fill="#6BCB77"/>`,
  },
  {
    id: 'calendar', name: 'Calendar', box: [894, 60, 82, 100],
    svg: `<rect x="900" y="70" width="70" height="84" rx="4" fill="#fff" stroke="#ccc" stroke-width="2"/>
      <rect x="900" y="70" width="70" height="22" rx="4" fill="#FF6B6B"/>
      <circle cx="915" cy="68" r="4" fill="#666"/><circle cx="955" cy="68" r="4" fill="#666"/>
      ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${906 + c * 12}" y="${99 + r * 13}" width="8" height="8" rx="1.5" fill="${r === 2 && c === 3 ? '#FFD93D' : '#E9ECEF'}"/>`).join('')).join('')}`,
  },
  {
    id: 'ttposter', name: 'Times tables poster', box: [634, 138, 82, 112],
    svg: `<rect x="640" y="144" width="70" height="100" rx="3" fill="#FFD6A5" stroke="#E09F00" stroke-width="4"/>
      <text x="675" y="170" font-size="20" text-anchor="middle" fill="#9C4A00" ${FONT}>× 12</text>
      ${[0, 1, 2, 3, 4].map((r) => `<rect x="652" y="${180 + r * 11}" width="${46 - (r % 2) * 10}" height="5" rx="2" fill="#E09F00" opacity=".6"/>`).join('')}`,
  },
  {
    id: 'art', name: 'Art display', box: [718, 182, 262, 96],
    svg: `<path d="M722 192 Q850 214 978 192" stroke="#8C5E3C" stroke-width="2.5" fill="none"/>
      <rect x="738" y="200" width="56" height="66" fill="#fff" stroke="#ddd" stroke-width="2" transform="rotate(-4 766 233)"/>
      <circle cx="766" cy="226" r="12" fill="#FFD93D"/><path d="M748 256 L766 238 L784 256Z" fill="#6BCB77"/>
      <rect x="822" y="206" width="56" height="66" fill="#fff" stroke="#ddd" stroke-width="2"/>
      <rect x="836" y="236" width="28" height="24" fill="#FF6B6B"/><path d="M832 238 L850 220 L868 238Z" fill="#8C5E3C"/>
      <rect x="906" y="200" width="56" height="66" fill="#fff" stroke="#ddd" stroke-width="2" transform="rotate(4 934 233)"/>
      <circle cx="934" cy="228" r="8" fill="#FFD93D"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${934 + 13 * Math.cos((a * Math.PI) / 180)}" cy="${228 + 13 * Math.sin((a * Math.PI) / 180)}" r="7" fill="#C77DFF"/>`).join('')}
      <path d="M934 242 V262" stroke="#6BCB77" stroke-width="3"/>
      <rect x="762" y="196" width="8" height="10" fill="#E09F00"/><rect x="846" y="202" width="8" height="10" fill="#E09F00"/><rect x="930" y="196" width="8" height="10" fill="#E09F00"/>`,
  },
  {
    id: 'hangingplant', name: 'Hanging plant', box: [234, 0, 62, 168],
    svg: `<path d="M265 0 V92 M265 60 L246 92 M265 60 L284 92" stroke="#8C5E3C" stroke-width="2"/>
      <path d="M243 92 H287 L281 120 H249Z" fill="#E07A5F"/>
      <path d="M250 116 q-8 20 -2 42 M262 118 q-4 18 2 34 M276 116 q10 18 4 44" stroke="#40916C" stroke-width="3" fill="none"/>
      ${[[248, 130], [246, 150], [263, 140], [264, 156], [280, 132], [283, 152], [255, 100], [272, 98]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.5" fill="#52B788" transform="rotate(${(x * 7) % 60 - 30} ${x} ${y})"/>`).join('')}`,
  },
  {
    id: 'rainbow', name: 'Rainbow window', box: [60, 80, 160, 100],
    svg: ['#FF6B6B', '#FFB347', '#FFD93D', '#6BCB77', '#4D96FF'].map((c, i) => `<path d="M${76 + i * 9} 170 A${64 - i * 9} ${64 - i * 9} 0 0 1 ${204 - i * 9} 170" stroke="${c}" stroke-width="9" fill="none"/>`).join(''),
  },

  // ---- Against the wall ----
  {
    id: 'bookshelf', name: 'Bookshelf', box: [36, 264, 170, 160],
    svg: `<rect x="40" y="270" width="160" height="150" rx="4" fill="#9C6644"/>
      <rect x="50" y="280" width="140" height="60" fill="#7F5539"/><rect x="50" y="350" width="140" height="60" fill="#7F5539"/>
      ${book(54, 290, 14, 50, '#FF6B6B')}${book(70, 296, 12, 44, '#4D96FF')}${book(84, 288, 16, 52, '#FFD93D')}${book(102, 298, 12, 42, '#6BCB77')}${book(116, 292, 14, 48, '#C77DFF')}<rect x="134" y="320" width="50" height="12" rx="2" fill="#FFB347" transform="rotate(-8 134 320)"/>
      ${book(54, 362, 16, 48, '#4D96FF')}${book(72, 358, 12, 52, '#FFB347')}${book(86, 366, 14, 44, '#FF6B6B')}${book(102, 360, 16, 50, '#6BCB77')}${book(120, 364, 12, 46, '#FFD93D')}${book(134, 358, 14, 52, '#C77DFF')}${book(150, 366, 16, 44, '#4D96FF')}`,
  },
  {
    id: 'tallplant', name: 'Big plant', box: [208, 286, 82, 138],
    svg: `${[[-30, 330], [30, 330], [-60, 350], [60, 350], [0, 315], [-15, 345], [15, 345]].map(([r, y]) => `<ellipse cx="250" cy="${y}" rx="11" ry="34" fill="${r % 20 ? '#40916C' : '#52B788'}" transform="rotate(${r} 250 375)"/>`).join('')}
      <path d="M224 370 H276 L270 420 H230Z" fill="#E07A5F"/><rect x="220" y="366" width="60" height="10" rx="3" fill="#C8553D"/>`,
  },
  {
    id: 'easel', name: 'Easel', box: [292, 250, 108, 196],
    svg: `<path d="M318 262 L302 440 M374 262 L390 440 M346 256 L346 430" stroke="#9C6644" stroke-width="7" stroke-linecap="round"/>
      <rect x="306" y="262" width="80" height="92" fill="#fff" stroke="#ddd" stroke-width="2"/>
      <rect x="306" y="262" width="80" height="60" fill="#BDE0FE"/><circle cx="364" cy="282" r="10" fill="#FFD93D"/>
      <path d="M306 330 Q330 300 352 326 Q370 308 386 322 V354 H306Z" fill="#6BCB77"/>
      <rect x="300" y="354" width="92" height="7" rx="2" fill="#9C6644"/>`,
  },
  {
    id: 'teacherdesk', name: "Teacher's desk", box: [596, 296, 238, 130],
    svg: `<rect x="612" y="316" width="206" height="106" fill="#B07D56"/>
      <rect x="600" y="300" width="230" height="18" rx="5" fill="#9C6644"/>
      <rect x="626" y="330" width="70" height="36" rx="3" fill="#C08E66"/><rect x="626" y="374" width="70" height="36" rx="3" fill="#C08E66"/>
      <circle cx="661" cy="348" r="4" fill="#7F5539"/><circle cx="661" cy="392" r="4" fill="#7F5539"/>`,
  },
  {
    id: 'fishtank', name: 'Fish tank', box: [850, 266, 140, 158],
    svg: `<rect x="860" y="340" width="120" height="82" rx="4" fill="#6D597A"/><rect x="872" y="352" width="96" height="58" rx="3" fill="#7E6B8F"/>
      <rect x="856" y="272" width="128" height="70" rx="5" fill="#9BF6FF" stroke="#457B9D" stroke-width="4"/>
      <path d="M872 340 q-4 -20 4 -36 M880 340 q6 -16 0 -30" stroke="#40916C" stroke-width="4" fill="none"/>
      <path d="M910 302 q14 -10 26 0 q-12 10 -26 0Z M936 302 l10 -7 v14Z" fill="#FFB347"/>
      <path d="M950 324 q10 -7 18 0 q-8 7 -18 0Z M968 324 l7 -5 v10Z" fill="#FF6B6B"/>
      <circle cx="904" cy="290" r="3" fill="#fff" opacity=".8"/><circle cx="900" cy="282" r="2" fill="#fff" opacity=".8"/>`,
  },

  // ---- On the floor ----
  {
    id: 'rug', name: 'Rug', box: [256, 460, 488, 124],
    svg: `<ellipse cx="500" cy="522" rx="240" ry="58" fill="#E5989B"/><ellipse cx="500" cy="522" rx="210" ry="44" fill="none" stroke="#FFCDB2" stroke-width="6" stroke-dasharray="14 10"/>`,
  },
  { id: 'desk1', name: 'Desk and chair', box: [396, 398, 158, 120], svg: pupilDesk(0, 0, '#4EA8DE') },
  { id: 'desk2', name: 'Another desk and chair', box: [611, 414, 158, 120], svg: pupilDesk(215, 16, '#F28482') },
  {
    id: 'beanbag', name: 'Beanbag', box: [96, 440, 160, 120],
    svg: `<path d="M110 548 Q96 500 130 470 Q170 438 214 466 Q256 496 246 542 Q234 560 176 560 Q122 562 110 548Z" fill="#90BE6D"/>
      <path d="M140 500 Q170 488 200 500" stroke="#6A994E" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'tent', name: 'Reading tent', box: [836, 400, 156, 192],
    svg: `<path d="M914 410 L840 586 H988Z" fill="#FFD166"/>
      <path d="M914 410 L866 586 H890Z M914 410 L938 586 H962Z" fill="#EF476F"/>
      <path d="M914 470 L888 586 H940Z" fill="#7B4B2A"/>
      <path d="M914 410 V396" stroke="#7B4B2A" stroke-width="3"/><path d="M914 396 L934 402 L914 408Z" fill="#06D6A0"/>`,
  },
  {
    id: 'globe', name: 'Globe', box: [632, 230, 64, 72], needs: 'teacherdesk',
    svg: `<path d="M650 298 H678 L672 288 H656Z" fill="#6C757D"/><path d="M664 288 V284" stroke="#6C757D" stroke-width="4"/>
      <path d="M638 260 A26 26 0 0 0 690 260" stroke="#ADB5BD" stroke-width="4" fill="none"/>
      <circle cx="664" cy="260" r="22" fill="#4D96FF"/>
      <path d="M652 248 q8 -6 14 2 q-2 10 -10 10 q-6 -4 -4 -12Z M670 262 q8 -2 10 6 q-6 8 -12 4Z" fill="#6BCB77"/>`,
  },
  {
    id: 'pencils', name: 'Pencil pot', box: [764, 252, 44, 50], needs: 'teacherdesk',
    svg: `<path d="M778 280 L774 256 M786 280 L788 252 M794 280 L800 258" stroke-width="5" stroke-linecap="round" stroke="#FFD93D"/>
      <path d="M774 256 l-1 -5 M788 252 v-5 M800 258 l2 -5" stroke="#2B2D42" stroke-width="3" stroke-linecap="round"/>
      <rect x="772" y="276" width="30" height="24" rx="3" fill="#4D96FF"/>`,
  },
  {
    id: 'apple', name: 'Apple', box: [720, 270, 36, 32], needs: 'teacherdesk',
    svg: `<circle cx="737" cy="288" r="12" fill="#E63946"/><path d="M737 277 V270" stroke="#7F5539" stroke-width="3"/>
      <path d="M738 274 q8 -6 12 0 q-6 4 -12 0Z" fill="#6BCB77"/><circle cx="732" cy="284" r="3" fill="#fff" opacity=".6"/>`,
  },
  {
    id: 'hamster', name: 'Class hamster', box: [64, 214, 122, 58], needs: 'bookshelf',
    svg: `<rect x="70" y="222" width="110" height="48" rx="8" fill="#fff" opacity=".5" stroke="#ADB5BD" stroke-width="3"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${84 + i * 14} 224 V268" stroke="#ADB5BD" stroke-width="2"/>`).join('')}
      <circle cx="152" cy="250" r="16" fill="none" stroke="#FF6B6B" stroke-width="4"/>
      <ellipse cx="104" cy="258" rx="16" ry="11" fill="#E9A15C"/><circle cx="114" cy="252" r="2" fill="#2B2D42"/><circle cx="98" cy="248" r="4" fill="#F7B9C4"/>`,
  },
  {
    id: 'laptop', name: 'Laptop', box: [426, 362, 92, 44], needs: 'desk1',
    svg: `<rect x="440" y="368" width="64" height="36" rx="3" fill="#495057"/><rect x="445" y="372" width="54" height="27" fill="#A9DEF9"/>
      <path d="M454 388 l6 -6 l6 4 l8 -8 l8 6" stroke="#4D96FF" stroke-width="3" fill="none"/>
      <rect x="430" y="402" width="84" height="5" rx="2" fill="#6C757D"/>`,
  },
  {
    id: 'lamp', name: 'Desk lamp', box: [686, 346, 70, 76], needs: 'desk2',
    svg: `<rect x="692" y="414" width="34" height="7" rx="3" fill="#7209B7"/>
      <path d="M709 414 L700 384 L726 362" stroke="#7209B7" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M716 352 L744 364 L734 384Z" fill="#B5179E"/><circle cx="740" cy="382" r="5" fill="#FFF3B0"/>`,
  },
  {
    id: 'backpack', name: 'Backpack', box: [344, 500, 64, 74],
    svg: `<path d="M360 512 q16 -16 32 0" stroke="#3A86FF" stroke-width="5" fill="none"/>
      <rect x="348" y="508" width="56" height="62" rx="16" fill="#3A86FF"/><rect x="358" y="534" width="36" height="26" rx="8" fill="#5E9BFF"/>
      <path d="M362 534 H390" stroke="#FFD93D" stroke-width="3"/>`,
  },
  {
    id: 'rocket', name: 'Model rocket', box: [32, 424, 76, 150],
    svg: `<path d="M70 430 Q92 470 88 540 H52 Q48 470 70 430Z" fill="#F1FAEE" stroke="#ADB5BD" stroke-width="2"/>
      <path d="M70 430 Q80 446 84 460 H56 Q60 446 70 430Z" fill="#E63946"/>
      <circle cx="70" cy="490" r="9" fill="#4D96FF" stroke="#457B9D" stroke-width="3"/>
      <path d="M52 520 L36 556 L54 548Z M88 520 L104 556 L86 548Z" fill="#E63946"/><path d="M60 540 L70 570 L80 540Z" fill="#FFB347"/>`,
  },
  {
    id: 'dino', name: 'Toy dinosaur', box: [262, 500, 84, 66],
    svg: `<path d="M276 552 Q270 520 296 516 Q320 512 326 524 Q332 508 342 510 Q348 516 340 530 Q338 552 330 552Z" fill="#06D6A0"/>
      <rect x="284" y="548" width="10" height="16" rx="3" fill="#06D6A0"/><rect x="314" y="548" width="10" height="16" rx="3" fill="#06D6A0"/>
      <path d="M276 540 L264 548 L278 552Z" fill="#06D6A0"/><circle cx="338" cy="516" r="2" fill="#2B2D42"/>
      <path d="M294 516 l4 -8 l4 8 M306 514 l4 -8 l4 8" fill="#FFD166"/>`,
  },
  {
    id: 'cushions', name: 'Cushions', box: [290, 532, 420, 56], needs: 'rug',
    svg: `<ellipse cx="330" cy="560" rx="36" ry="20" fill="#9B5DE5"/><ellipse cx="330" cy="556" rx="24" ry="10" fill="#B983FF"/>
      <ellipse cx="670" cy="560" rx="36" ry="20" fill="#F15BB5"/><ellipse cx="670" cy="556" rx="24" ry="10" fill="#FF85C8"/>`,
  },
  {
    id: 'paints', name: 'Paint pots', box: [296, 426, 76, 34], needs: 'easel',
    svg: `${[['#FF6B6B', 300], ['#FFD93D', 324], ['#4D96FF', 348]].map(([c, x]) => `<rect x="${x}" y="436" width="20" height="20" rx="3" fill="#fff" stroke="#ccc"/><rect x="${x + 2}" y="432" width="16" height="8" rx="2" fill="${c}"/>`).join('')}`,
  },
  {
    id: 'books', name: 'Pile of books', box: [756, 534, 80, 58],
    svg: `${book(762, 576, 66, 13, '#FF6B6B')}${book(768, 563, 58, 13, '#4D96FF')}${book(760, 550, 62, 13, '#FFD93D')}${book(770, 538, 50, 12, '#6BCB77')}`,
  },
  {
    id: 'balls', name: 'Basket of balls', box: [568, 520, 90, 72],
    svg: `<circle cx="594" cy="548" r="14" fill="#FF6B6B"/><circle cx="620" cy="540" r="16" fill="#FFD93D"/><circle cx="640" cy="552" r="12" fill="#4D96FF"/>
      <path d="M574 552 H654 L646 590 H582Z" fill="#C8A27E"/><path d="M584 562 H644 M588 576 H640" stroke="#9C6644" stroke-width="3"/>`,
  },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export function itemSVG(item, cls = '') {
  const [x, y, w, h] = item.box;
  return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${item.svg}</svg>`;
}

// Full classroom with everything the player owns. `fresh` gets a little pop animation.
export function classroomSVG(owned, avatarSVGInner, fresh) {
  const set = new Set(owned);
  const parts = ITEMS.filter((i) => set.has(i.id)).map((i) => `<g class="${i.id === fresh ? 'fresh' : ''}" style="transform-origin:${i.box[0] + i.box[2] / 2}px ${i.box[1] + i.box[3]}px">${i.svg}</g>`);
  return `<svg class="classroom-svg" viewBox="0 0 1000 600" role="img" aria-label="${tr('Your classroom')}">
    ${BASE_SCENE}${parts.join('')}
    <svg x="440" y="470" width="120" height="120" viewBox="0 0 120 120">${avatarSVGInner}</svg>
  </svg>`;
}

// Three things to choose from: unowned, and whatever they sit on is already in the room.
export function rewardChoices(owned) {
  const set = new Set(owned);
  const open = ITEMS.filter((i) => !set.has(i.id) && (!i.needs || set.has(i.needs)));
  for (let i = open.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [open[i], open[j]] = [open[j], open[i]];
  }
  return open.slice(0, 3);
}
