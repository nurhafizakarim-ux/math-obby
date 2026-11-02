/**
 * Procedural Web Audio API Sound Synthesizer
 * Zero external audio files - 100% reliable and lightweight.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmTimer: number | null = null;
  private bgmGainNode: GainNode | null = null;
  private isBgmRunning: boolean = false;
  private bgmStep: number = 0;
  private nextNoteTime: number = 0;

  constructor() {
    // Try to load mute preference from localStorage
    try {
      this.isMuted = localStorage.getItem('math_obby_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('math_obby_muted', this.isMuted.toString());
    } catch {
      // ignore
    }
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.065, this.ctx.currentTime);
    }
    if (!this.isMuted && !this.isBgmRunning) {
      this.startBgm();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startBgm() {
    this.initCtx();
    if (!this.ctx) return;
    if (this.isBgmRunning) return;
    this.isBgmRunning = true;

    if (!this.bgmGainNode) {
      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.connect(this.ctx.destination);
    }
    this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.065, this.ctx.currentTime);

    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.bgmStep = 0;

    this.bgmTimer = window.setInterval(() => {
      this.scheduleBgmNotes();
    }, 50);
  }

  public stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.isBgmRunning = false;
  }

  private scheduleBgmNotes() {
    if (!this.ctx || !this.bgmGainNode) return;

    // Upbeat ~136 BPM 16th notes (stepDuration = 0.11s) for an energetic, rancak obby adventure!
    const stepDuration = 0.11;

    // Bass roots: C, G, Am, F
    const bassNotes = [
      65.41, // C2 (bar 0: steps 0..15)
      98.00, // G2 (bar 1: steps 16..31)
      110.00, // A2 (bar 2: steps 32..47)
      87.31  // F2 (bar 3: steps 48..63)
    ];

    // Chords for 16th arpeggios (C maj, G maj, A min, F maj)
    const arpeggios = [
      [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63], // C
      [246.94, 293.66, 392.00, 493.88, 587.33, 493.88, 392.00, 293.66], // G
      [220.00, 261.63, 329.63, 440.00, 523.25, 440.00, 329.63, 261.63], // Am
      [174.61, 220.00, 261.63, 349.23, 440.00, 349.23, 261.63, 220.00]  // F
    ];

    // Lively, catchy melodic hook that repeats every 4 bars
    const melodyMap: Record<number, number> = {
      0: 523.25,  // C5
      2: 523.25,  // C5
      4: 659.25,  // E5
      6: 783.99,  // G5
      8: 880.00,  // A5
      10: 783.99, // G5
      12: 659.25, // E5
      14: 587.33, // D5

      16: 587.33, // D5
      18: 587.33, // D5
      20: 783.99, // G5
      22: 698.46, // F5
      24: 659.25, // E5
      26: 587.33, // D5
      28: 493.88, // B4
      30: 587.33, // D5

      32: 880.00, // A5
      34: 880.00, // A5
      36: 1046.5, // C6
      38: 987.77, // B5
      40: 880.00, // A5
      42: 783.99, // G5
      44: 659.25, // E5
      46: 783.99, // G5

      48: 698.46, // F5
      50: 783.99, // G5
      52: 880.00, // A5
      54: 1046.5, // C6
      56: 987.77, // B5
      58: 880.00, // A5
      60: 783.99, // G5
      62: 987.77  // B5
    };

    while (this.nextNoteTime < this.ctx.currentTime + 0.15) {
      const step = this.bgmStep;
      const bar = Math.floor(step / 16);
      const stepInBar = step % 16;
      const t = this.nextNoteTime;

      // 1. Driving Synth Bass with syncopation (steps 0, 3, 6, 8, 10, 12, 14)
      const isBassStep = [0, 3, 6, 8, 10, 12, 14].includes(stepInBar);
      if (isBassStep) {
        const root = bassNotes[bar];
        // Octave jump on syncopated accents for dynamic funk groove
        const freq = (stepInBar === 3 || stepInBar === 10) ? root * 2 : root;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        // Lowpass filter for warm punchy bass
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t);
        filter.frequency.exponentialRampToValueAtTime(80, t + 0.18);

        g.gain.setValueAtTime(0.26, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.20);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.bgmGainNode);
        osc.start(t);
        osc.stop(t + 0.21);
      }

      // 2. Crisp 16th-note Arpeggios (lively background texture)
      const arpNotes = arpeggios[bar];
      const noteFreq = arpNotes[stepInBar % arpNotes.length];
      const oscArp = this.ctx.createOscillator();
      const gArp = this.ctx.createGain();
      oscArp.type = 'sine';
      oscArp.frequency.setValueAtTime(noteFreq, t);
      gArp.gain.setValueAtTime(0.07, t);
      gArp.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      oscArp.connect(gArp);
      gArp.connect(this.bgmGainNode);
      oscArp.start(t);
      oscArp.stop(t + 0.13);

      // 3. Energetic Lead Synth
      if (melodyMap[step]) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melodyMap[step], t);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(g);
        g.connect(this.bgmGainNode);
        osc.start(t);
        osc.stop(t + 0.29);
      }

      // 4. Rancak Arcade Beat: Punchy Kick Drum on quarter beats (0, 4, 8, 12)
      if (stepInBar % 4 === 0) {
        const oscKick = this.ctx.createOscillator();
        const gKick = this.ctx.createGain();
        oscKick.type = 'sine';
        oscKick.frequency.setValueAtTime(130, t);
        oscKick.frequency.exponentialRampToValueAtTime(38, t + 0.08);
        gKick.gain.setValueAtTime(0.24, t);
        gKick.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
        oscKick.connect(gKick);
        gKick.connect(this.bgmGainNode);
        oscKick.start(t);
        oscKick.stop(t + 0.11);
      }

      // 5. Snappy Snare / Clap on beats 4 & 12 + Hat ticks on odd 16th notes
      if (stepInBar === 4 || stepInBar === 12) {
        const oscSnare = this.ctx.createOscillator();
        const gSnare = this.ctx.createGain();
        oscSnare.type = 'square';
        oscSnare.frequency.setValueAtTime(950, t);
        oscSnare.frequency.exponentialRampToValueAtTime(220, t + 0.05);
        gSnare.gain.setValueAtTime(0.08, t);
        gSnare.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        oscSnare.connect(gSnare);
        gSnare.connect(this.bgmGainNode);
        oscSnare.start(t);
        oscSnare.stop(t + 0.07);
      } else if (stepInBar % 2 === 1) {
        // High hat tick
        const oscHat = this.ctx.createOscillator();
        const gHat = this.ctx.createGain();
        oscHat.type = 'square';
        oscHat.frequency.setValueAtTime(2200, t);
        oscHat.frequency.exponentialRampToValueAtTime(1400, t + 0.02);
        gHat.gain.setValueAtTime(0.03, t);
        gHat.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
        oscHat.connect(gHat);
        gHat.connect(this.bgmGainNode);
        oscHat.start(t);
        oscHat.stop(t + 0.025);
      }

      this.nextNoteTime += stepDuration;
      this.bgmStep = (this.bgmStep + 1) % 64;
    }
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playBoost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playShock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Electric buzzing shock: rapid modulated sawtooth + square
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 0.3);
    osc1.frequency.linearRampToValueAtTime(240, now + 0.5);

    osc2.frequency.setValueAtTime(280, now);
    osc2.frequency.linearRampToValueAtTime(95, now + 0.25);
    osc2.frequency.linearRampToValueAtTime(180, now + 0.5);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Chime notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(90, now + 0.35);

    osc2.frequency.setValueAtTime(145, now);
    osc2.frequency.linearRampToValueAtTime(88, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }

  public playWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playCheckpoint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.28);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
      { f: 880.00, d: 0.15 }, // A5
      { f: 1046.5, d: 0.60 }  // C6
    ];

    let t = now;
    melody.forEach(m => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m.f, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + m.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + m.d + 0.05);
      t += m.d;
    });
  }

  public playGateOpen() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // High-tech security servo whirr & access chime
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.2); // C6
    gain2.gain.setValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.52);
  }

  public playBridgeBuild() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Heavy metal clang & locking hydraulic click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playSteam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Pneumatic white-noise steam hiss
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.26);
  }

  public playLifeLost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playFireballHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playLaserZap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.22);

      gain.gain.setValueAtTime(0.2, now + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + 0.38);
    });
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundManager = new SoundManager();
