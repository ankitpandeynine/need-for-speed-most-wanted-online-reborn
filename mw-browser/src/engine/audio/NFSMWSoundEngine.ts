/**
 * Need for Speed: Most Wanted (2005) - Web Audio Sound Engine
 * Synthesizes authentic BMW M3 GTR V8 engine harmonics, straight-cut transmission gear whine,
 * nitrous purge, tire screech, police sirens, and radio chatter.
 */

export class NFSMWSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Engine audio nodes
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private osc3: OscillatorNode | null = null;
  private gearWhineOsc: OscillatorNode | null = null;
  private gearWhineGain: GainNode | null = null;

  // Nitrous audio nodes
  private nosGain: GainNode | null = null;
  private nosNoiseSource: AudioBufferSourceNode | null = null;

  // Tire skid audio nodes
  private skidGain: GainNode | null = null;
  private skidFilter: BiquadFilterNode | null = null;

  // Police Siren nodes
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

  constructor() {
    // AudioContext is initialized on first user interaction to comply with browser autoplay policy
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupEngineSynth();
      this.setupGearWhine();
      this.setupNosSynth();
      this.setupSkidSynth();
      this.setupPoliceSiren();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API initialization failed:', e);
    }
  }

  private setupEngineSynth() {
    if (!this.ctx || !this.masterGain) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    // Multi-harmonic V8 rumble
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(110, this.ctx.currentTime);

    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'square';
    this.osc3.frequency.setValueAtTime(165, this.ctx.currentTime);

    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.osc3.connect(osc3Gain);

    // Lowpass filter for deep exhaust note
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    this.osc1.connect(filter);
    this.osc2.connect(filter);
    osc3Gain.connect(filter);

    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.osc1.start();
    this.osc2.start();
    this.osc3.start();
  }

  /**
   * The trademark sound of the BMW M3 GTR E46 is its straight-cut dog-box transmission
   * gear whine that rises sharply with vehicle speed!
   */
  private setupGearWhine() {
    if (!this.ctx || !this.masterGain) return;

    this.gearWhineGain = this.ctx.createGain();
    this.gearWhineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.gearWhineOsc = this.ctx.createOscillator();
    this.gearWhineOsc.type = 'sine';
    this.gearWhineOsc.frequency.setValueAtTime(400, this.ctx.currentTime);

    const whineFilter = this.ctx.createBiquadFilter();
    whineFilter.type = 'bandpass';
    whineFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    whineFilter.Q.setValueAtTime(5, this.ctx.currentTime);

    this.gearWhineOsc.connect(whineFilter);
    whineFilter.connect(this.gearWhineGain);
    this.gearWhineGain.connect(this.masterGain);

    this.gearWhineOsc.start();
  }

  private setupNosSynth() {
    if (!this.ctx || !this.masterGain) return;

    this.nosGain = this.ctx.createGain();
    this.nosGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // Procedural white noise buffer for continuous nitrous roar
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.nosNoiseSource = this.ctx.createBufferSource();
    this.nosNoiseSource.buffer = buffer;
    this.nosNoiseSource.loop = true;

    const nosFilter = this.ctx.createBiquadFilter();
    nosFilter.type = 'bandpass';
    nosFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    nosFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.nosNoiseSource.connect(nosFilter);
    nosFilter.connect(this.nosGain);
    this.nosGain.connect(this.masterGain);

    this.nosNoiseSource.start();
  }

  private setupSkidSynth() {
    if (!this.ctx || !this.masterGain) return;

    this.skidGain = this.ctx.createGain();
    this.skidGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const skidNoise = this.ctx.createBufferSource();
    skidNoise.buffer = buffer;
    skidNoise.loop = true;

    this.skidFilter = this.ctx.createBiquadFilter();
    this.skidFilter.type = 'bandpass';
    this.skidFilter.frequency.setValueAtTime(950, this.ctx.currentTime);
    this.skidFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    skidNoise.connect(this.skidFilter);
    this.skidFilter.connect(this.skidGain);
    this.skidGain.connect(this.masterGain);

    skidNoise.start();
  }

  private setupPoliceSiren() {
    if (!this.ctx || !this.masterGain) return;

    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.sirenOsc = this.ctx.createOscillator();
    this.sirenOsc.type = 'sawtooth';
    this.sirenOsc.frequency.setValueAtTime(700, this.ctx.currentTime);

    const sirenFilter = this.ctx.createBiquadFilter();
    sirenFilter.type = 'lowpass';
    sirenFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    this.sirenOsc.connect(sirenFilter);
    sirenFilter.connect(this.sirenGain);
    this.sirenGain.connect(this.masterGain);

    this.sirenOsc.start();
  }

  public update(params: {
    rpm: number;
    speedMph: number;
    isNitrousActive: boolean;
    isDrifting: boolean;
    isPoliceNear: boolean;
    policeDistance: number;
    isSpeedbreaker: boolean;
  }) {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const timeScale = params.isSpeedbreaker ? 0.45 : 1.0;

    // 1. Engine RPM sound calculation (idle 900 to 8500 redline)
    const baseFreq = (30 + (params.rpm / 8500) * 110) * timeScale;
    if (this.osc1 && this.osc2 && this.osc3) {
      this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.osc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.05);
      this.osc3.frequency.setTargetAtTime(baseFreq * 3, now, 0.05);
    }

    if (this.engineGain) {
      const loadVolume = 0.25 + (params.rpm / 8500) * 0.35 + (params.isNitrousActive ? 0.15 : 0);
      this.engineGain.gain.setTargetAtTime(loadVolume, now, 0.05);
    }

    // 2. Straight-cut transmission gear whine (rises with road speed)
    if (this.gearWhineOsc && this.gearWhineGain) {
      const whineFreq = (400 + params.speedMph * 14) * timeScale;
      this.gearWhineOsc.frequency.setTargetAtTime(whineFreq, now, 0.05);
      const whineGainVal = Math.min(0.28, Math.max(0.0, (params.speedMph - 15) / 160) * 0.25);
      this.gearWhineGain.gain.setTargetAtTime(whineGainVal, now, 0.05);
    }

    // 3. Nitrous roar
    if (this.nosGain) {
      const targetNosGain = params.isNitrousActive ? 0.38 : 0.0;
      this.nosGain.gain.setTargetAtTime(targetNosGain, now, 0.08);
    }

    // 4. Tire skid screech
    if (this.skidGain) {
      const targetSkid = params.isDrifting ? 0.32 : 0.0;
      this.skidGain.gain.setTargetAtTime(targetSkid, now, 0.06);
    }

    // 5. Police siren modulation (Wail / Yelp cycle)
    if (this.sirenGain && this.sirenOsc) {
      if (params.isPoliceNear) {
        // Modulate siren pitch between 650Hz and 1150Hz every 1.5 seconds
        const sirenCycle = Math.sin(now * 3.5);
        const sirenFreq = (900 + sirenCycle * 280) * timeScale;
        this.sirenOsc.frequency.setTargetAtTime(sirenFreq, now, 0.05);

        // Distance attenuation
        const distanceFactor = Math.max(0.0, 1.0 - params.policeDistance / 80);
        this.sirenGain.gain.setTargetAtTime(0.22 * distanceFactor, now, 0.1);
      } else {
        this.sirenGain.gain.setTargetAtTime(0.0, now, 0.2);
      }
    }
  }

  /**
   * Sound effect: Shift blowoff valve pop / exhaust backfire
   */
  public playGearShift() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Sound effect: Nitrous Purge hiss
   */
  public playNosPurge() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
  }

  public destroy() {
    try {
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
    } catch {
      // Ignored
    }
    this.isInitialized = false;
  }
}
