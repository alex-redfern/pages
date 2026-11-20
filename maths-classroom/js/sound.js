// Gentle sounds made in the browser — no audio files needed.

let ctx = null;
let enabled = true;

export function setSound(on) { enabled = on; }

// iPad only allows audio after a tap, so this is called from tap handlers.
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sounds = {
  tap: () => tone(660, 0, 0.06, 'sine', 0.05),
  correct: () => { tone(784, 0, 0.18); tone(1047, 0.1, 0.3); },
  tryAgain: () => { tone(392, 0, 0.18, 'triangle', 0.12); tone(349, 0.12, 0.25, 'triangle', 0.1); },
  levelUp: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.35, 'sine', 0.15)),
  reward: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.4, 'triangle', 0.12)),
};
