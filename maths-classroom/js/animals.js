// Animal avatars, drawn as SVG in a 120×120 box.

const INK = '#2B2D42';
const eye = (x, y, r = 5.5) =>
  `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${INK}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.36}" fill="#fff"/>`;
const eyes = (y, gap = 14, r) => eye(60 - gap, y, r) + eye(60 + gap, y, r);
const cheeks = (y, gap = 26, c = '#FF8FA3') =>
  `<ellipse cx="${60 - gap}" cy="${y}" rx="7" ry="4.5" fill="${c}" opacity=".55"/><ellipse cx="${60 + gap}" cy="${y}" rx="7" ry="4.5" fill="${c}" opacity=".55"/>`;
const smile = (y, w = 8) => `<path d="M${60 - w} ${y} Q60 ${y + w * 0.9} ${60 + w} ${y}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const mirror = (svg) => `<g transform="translate(120 0) scale(-1 1)">${svg}</g>`;

export const ANIMALS = {
  wolf: {
    name: 'Wolf',
    svg: (() => {
      const ear = `<path d="M26 50 L30 8 L56 30 Z" fill="#7D8597"/><path d="M32 42 L34 18 L50 31 Z" fill="#F4ACB7"/>`;
      return `${ear}${mirror(ear)}
      <path d="M60 22 C88 22 102 42 102 62 L112 72 L100 76 L103 86 L89 84 C83 98 72 106 60 106 C48 106 37 98 31 84 L17 86 L20 76 L8 72 L18 62 C18 42 32 22 60 22Z" fill="#8D99AE"/>
      <path d="M60 30 L52 52 L60 60 L68 52Z" fill="#6C7689"/>
      <path d="M60 60 C76 60 86 72 86 84 C86 96 73 103 60 103 C47 103 34 96 34 84 C34 72 44 60 60 60Z" fill="#EDF2F4"/>
      ${eyes(54, 15)}
      <path d="M51 71 Q60 64 69 71 Q65 79 60 79 Q55 79 51 71Z" fill="${INK}"/>
      <path d="M60 79 L60 85 M51 87 Q60 94 69 87" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    })(),
  },
  penguin: {
    name: 'Penguin',
    svg: `<ellipse cx="60" cy="64" rx="45" ry="43" fill="${INK}"/>
      <path d="M60 18 Q66 8 74 12 Q66 14 64 22Z" fill="${INK}"/>
      <path d="M60 46 C66 32 94 34 94 62 C94 88 77 102 60 102 C43 102 26 88 26 62 C26 34 54 32 60 46Z" fill="#fff"/>
      ${eyes(62, 13)}
      ${cheeks(78, 24)}
      <path d="M50 74 Q60 68 70 74 L60 87Z" fill="#FFB703" stroke="#E09F00" stroke-width="1.5" stroke-linejoin="round"/>`,
  },
  fox: {
    name: 'Fox',
    svg: (() => {
      const ear = `<path d="M22 54 L26 6 L58 32 Z" fill="#F4845F"/><path d="M26 18 L26 6 L36 14Z" fill="${INK}"/><path d="M30 44 L31 20 L48 33 Z" fill="#FFE5D9"/>`;
      return `${ear}${mirror(ear)}
      <path d="M60 24 C90 24 104 46 104 66 C104 84 84 104 60 106 C36 104 16 84 16 66 C16 46 30 24 60 24Z" fill="#F4845F"/>
      <path d="M16 66 C30 66 48 74 60 106 C36 104 16 84 16 66Z M104 66 C90 66 72 74 60 106 C84 104 104 84 104 66Z" fill="#FFF3EB"/>
      ${eyes(58, 17)}
      <ellipse cx="60" cy="86" rx="7" ry="5" fill="${INK}"/>
      ${smile(93, 6)}`;
    })(),
  },
  owl: {
    name: 'Owl',
    svg: `<path d="M22 28 L40 36 L30 50Z M98 28 L80 36 L90 50Z" fill="#8C5E3C"/>
      <ellipse cx="60" cy="66" rx="42" ry="42" fill="#A47148"/>
      <path d="M30 82 Q60 110 90 82 Q86 104 60 106 Q34 104 30 82Z" fill="#E6CCB2"/>
      <circle cx="43" cy="56" r="17" fill="#FFF3D6"/><circle cx="77" cy="56" r="17" fill="#FFF3D6"/>
      ${eye(43, 56, 7.5)}${eye(77, 56, 7.5)}
      <path d="M54 66 L66 66 L60 78Z" fill="#FFB703" stroke="#E09F00" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M42 90 q4 4 8 0 M56 94 q4 4 8 0 M70 90 q4 4 8 0" stroke="#B08968" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  panda: {
    name: 'Panda',
    svg: `<circle cx="26" cy="30" r="16" fill="${INK}"/><circle cx="94" cy="30" r="16" fill="${INK}"/>
      <ellipse cx="60" cy="64" rx="46" ry="42" fill="#fff" stroke="#E5E5E5" stroke-width="2"/>
      <ellipse cx="42" cy="60" rx="12" ry="15" transform="rotate(-25 42 60)" fill="${INK}"/>
      <ellipse cx="78" cy="60" rx="12" ry="15" transform="rotate(25 78 60)" fill="${INK}"/>
      <circle cx="44" cy="58" r="4.6" fill="#fff"/><circle cx="76" cy="58" r="4.6" fill="#fff"/>
      <circle cx="45" cy="58" r="2.6" fill="${INK}"/><circle cx="75" cy="58" r="2.6" fill="${INK}"/>
      ${cheeks(80, 30)}
      <ellipse cx="60" cy="78" rx="7" ry="5" fill="${INK}"/>
      ${smile(86, 6)}`,
  },
  tiger: {
    name: 'Tiger',
    svg: `<circle cx="26" cy="32" r="15" fill="#F9A03F"/><circle cx="26" cy="32" r="8" fill="#FFE5D9"/>
      <circle cx="94" cy="32" r="15" fill="#F9A03F"/><circle cx="94" cy="32" r="8" fill="#FFE5D9"/>
      <ellipse cx="60" cy="64" rx="46" ry="42" fill="#F9A03F"/>
      <path d="M60 24 L55 38 L60 44 L65 38Z M44 27 L44 40 L49 36Z M76 27 L76 40 L71 36Z" fill="${INK}"/>
      <path d="M14 58 L30 62 L14 66Z M16 76 L30 74 L18 84Z M106 58 L90 62 L106 66Z M104 76 L90 74 L102 84Z" fill="${INK}"/>
      <path d="M60 64 C80 64 86 76 86 86 C86 98 72 104 60 104 C48 104 34 98 34 86 C34 76 40 64 60 64Z" fill="#FFF8F0"/>
      ${eyes(56, 16)}
      <path d="M52 74 Q60 69 68 74 Q64 81 60 81 Q56 81 52 74Z" fill="#E56B6F"/>
      <path d="M60 81 L60 86 M52 88 Q56 92 60 88 Q64 92 68 88" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  rabbit: {
    name: 'Rabbit',
    svg: `<ellipse cx="42" cy="26" rx="11" ry="26" transform="rotate(-10 42 26)" fill="#E9E3DA"/>
      <ellipse cx="42" cy="28" rx="5.5" ry="18" transform="rotate(-10 42 28)" fill="#F7B9C4"/>
      <ellipse cx="78" cy="26" rx="11" ry="26" transform="rotate(10 78 26)" fill="#E9E3DA"/>
      <ellipse cx="78" cy="28" rx="5.5" ry="18" transform="rotate(10 78 28)" fill="#F7B9C4"/>
      <ellipse cx="60" cy="72" rx="42" ry="37" fill="#F4EFE8"/>
      ${eyes(66, 15)}
      ${cheeks(82, 26)}
      <path d="M55 78 Q60 74 65 78 Q60 84 55 78Z" fill="#F28AA0"/>
      <path d="M60 82 L60 87 M53 87 Q60 92 67 87" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="55.5" y="89" width="9" height="8" rx="2" fill="#fff" stroke="#ccc"/>`,
  },
  frog: {
    name: 'Frog',
    svg: `<circle cx="38" cy="38" r="18" fill="#6BBF59"/><circle cx="82" cy="38" r="18" fill="#6BBF59"/>
      <ellipse cx="60" cy="72" rx="50" ry="36" fill="#6BBF59"/>
      <circle cx="38" cy="38" r="11" fill="#fff"/><circle cx="82" cy="38" r="11" fill="#fff"/>
      ${eye(39, 39, 6)}${eye(81, 39, 6)}
      ${cheeks(80, 32)}
      <path d="M32 78 Q60 100 88 78" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="54" cy="64" r="2" fill="#3E7C32"/><circle cx="66" cy="64" r="2" fill="#3E7C32"/>`,
  },
  koala: {
    name: 'Koala',
    svg: `<circle cx="22" cy="44" r="22" fill="#A5A5A5"/><circle cx="22" cy="46" r="13" fill="#F1F1F1"/>
      <circle cx="98" cy="44" r="22" fill="#A5A5A5"/><circle cx="98" cy="46" r="13" fill="#F1F1F1"/>
      <ellipse cx="60" cy="66" rx="42" ry="40" fill="#B8B8B8"/>
      ${eyes(58, 17)}
      ${cheeks(80, 28)}
      <ellipse cx="60" cy="74" rx="11" ry="14" fill="${INK}"/>
      <ellipse cx="57" cy="68" rx="3" ry="4" fill="#5A5C75"/>
      ${smile(94, 6)}`,
  },
  hedgehog: {
    name: 'Hedgehog',
    svg: `<path d="M60 10 L68 22 L80 14 L82 28 L96 24 L92 38 L106 40 L98 52 L110 60 L98 68 L106 80 L92 82 L94 96 L80 92 L76 106 L60 100 L44 106 L40 92 L26 96 L28 82 L14 80 L22 68 L10 60 L22 52 L14 40 L28 38 L24 24 L38 28 L40 14 L52 22Z" fill="#7F5539"/>
      <ellipse cx="60" cy="68" rx="32" ry="30" fill="#EDC9A3"/>
      <path d="M44 42 Q60 30 76 42" stroke="#7F5539" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${eyes(62, 12, 5)}
      ${cheeks(78, 20)}
      <ellipse cx="60" cy="78" rx="6" ry="4.5" fill="${INK}"/>
      ${smile(85, 5)}`,
  },
};

export function animalSVG(key, cls = '') {
  const a = ANIMALS[key] || ANIMALS.wolf;
  return `<svg class="animal ${cls}" viewBox="0 0 120 120" aria-hidden="true">${a.svg}</svg>`;
}
