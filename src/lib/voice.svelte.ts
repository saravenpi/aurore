const MAX_CHARS = 220;
const BASE_PITCH = 1.18;
const BASE_FREQ = 540;
const FREQ_SPREAD = 320;
const BLIP_MIN_MS = 55;
const BLIP_MAX_MS = 75;
const CHAR_STEP_MS = 122;
const SPACE_PAUSE_MS = 90;
const PUNCT_PAUSE_MS = 170;
const ATTACK_MS = 6;
const PEAK_GAIN = 0.16;
const VOWELS = "aeiouy";
const PUNCT = ".,!?;:";

type Blip = {
  at: number;
  freq: number;
  durMs: number;
  gain: number;
};

class Voice {
  speaking = $state(false);
  level = $state(0);
  muted = $state(false);

  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private raf = 0;
  private targetLevel = 0;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
    }
    void this.ctx.resume();
    return this.ctx;
  }

  speak(text: string): void {
    if (this.muted) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    this.stop();

    const ctx = this.ensureCtx();
    const source = trimmed.slice(0, MAX_CHARS);

    const blips: Blip[] = [];
    let cursorMs = 30;

    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      const lower = ch.toLowerCase();

      if (ch === " " || ch === "\n" || ch === "\t" || ch === "\r") {
        cursorMs += SPACE_PAUSE_MS;
        continue;
      }

      if (PUNCT.includes(ch)) {
        cursorMs += PUNCT_PAUSE_MS;
        continue;
      }

      const isLetter = lower >= "a" && lower <= "z";
      const isDigit = ch >= "0" && ch <= "9";
      if (!isLetter && !isDigit) {
        cursorMs += SPACE_PAUSE_MS;
        continue;
      }

      const code = isLetter
        ? lower.charCodeAt(0) - 97
        : ch.charCodeAt(0) - 48 + 10;
      const span = isLetter ? 26 : 36;
      const norm = code / span;

      const isVowel = VOWELS.includes(lower);
      const jitter = ((i * 73) % 47) / 47 - 0.5;

      let freq = (BASE_FREQ + norm * FREQ_SPREAD + jitter * 60) * BASE_PITCH;
      if (isVowel) freq *= 0.86;

      const durMs = isVowel ? BLIP_MAX_MS : BLIP_MIN_MS + ((i * 31) % 12);
      const gain = PEAK_GAIN * (isVowel ? 1 : 0.9);

      blips.push({ at: cursorMs, freq, durMs, gain });
      cursorMs += CHAR_STEP_MS + (isVowel ? 18 : 0);
    }

    if (blips.length === 0) return;

    this.speaking = true;
    this.targetLevel = 0;
    this.startLevelLoop();

    const now = ctx.currentTime;
    for (const blip of blips) {
      const start = now + blip.at / 1000;
      const end = start + blip.durMs / 1000;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(blip.freq, start);
      osc.frequency.linearRampToValueAtTime(blip.freq * 0.94, end);

      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(blip.gain, start + ATTACK_MS / 1000);
      env.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
      this.oscillators.push(osc);

      const peakNorm = Math.min(1, 0.6 + blip.gain / PEAK_GAIN * 0.4);
      this.timers.push(
        setTimeout(() => {
          this.targetLevel = peakNorm;
        }, blip.at),
      );
      this.timers.push(
        setTimeout(() => {
          this.targetLevel = 0;
        }, blip.at + blip.durMs),
      );
    }

    const last = blips[blips.length - 1];
    const totalMs = last.at + last.durMs + 60;
    this.timers.push(
      setTimeout(() => {
        this.finish();
      }, totalMs),
    );
  }

  stop(): void {
    for (const osc of this.oscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        void 0;
      }
    }
    this.oscillators = [];

    for (const t of this.timers) clearTimeout(t);
    this.timers = [];

    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    this.targetLevel = 0;
    this.level = 0;
    this.speaking = false;
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.muted && this.speaking) this.stop();
  }

  private finish(): void {
    this.oscillators = [];
    this.targetLevel = 0;
    this.speaking = false;
    this.timers = this.timers.filter(Boolean);
  }

  private startLevelLoop(): void {
    if (this.raf) return;
    const tick = () => {
      const diff = this.targetLevel - this.level;
      this.level += diff * (diff > 0 ? 0.6 : 0.18);
      if (this.level < 0.001) this.level = 0;

      if (!this.speaking && this.level === 0) {
        this.raf = 0;
        return;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}

export const voice = new Voice();
