/**
 * Need for Speed: Most Wanted (2005) - EA Trax Soundtrack Service
 * Synthesizes and streams the legendary soundtrack of Most Wanted with Web Audio API.
 * Supports track shuffling, equalizer visualization, and dynamic in-game EA Trax banners.
 */

import { EATraxSong } from '../types';

export const EA_TRAX_PLAYLIST: EATraxSong[] = [
  {
    id: 'nine-thou',
    title: 'Nine Thou (Superstars Remix)',
    artist: 'Styles of Beyond',
    album: 'Megatryp',
    year: 2005,
    durationSec: 228,
    genre: 'Hip-Hop',
  },
  {
    id: 'decadence',
    title: 'Decadence',
    artist: 'Disturbed',
    album: 'Ten Thousand Fists',
    year: 2005,
    durationSec: 204,
    genre: 'Metal',
  },
  {
    id: 'blinded-in-chains',
    title: 'Blinded in Chains',
    artist: 'Avenged Sevenfold',
    album: 'City of Evil',
    year: 2005,
    durationSec: 394,
    genre: 'Metal',
  },
  {
    id: 'shapeshifter',
    title: 'Shapeshifter (feat. Styles of Beyond)',
    artist: 'Celldweller',
    album: 'Celldweller',
    year: 2005,
    durationSec: 219,
    genre: 'Electronic',
  },
  {
    id: 'skinnyman',
    title: 'Skinnyman',
    artist: 'Static-X',
    album: 'Start a War',
    year: 2005,
    durationSec: 220,
    genre: 'Metal',
  },
  {
    id: 'hand-of-blood',
    title: 'Hand of Blood',
    artist: 'Bullet for My Valentine',
    album: 'Hand of Blood EP',
    year: 2005,
    durationSec: 216,
    genre: 'Metal',
  },
  {
    id: 'under-my-wheels',
    title: "You'll Be Under My Wheels",
    artist: 'The Prodigy',
    album: 'Always Outnumbered, Never Outgunned',
    year: 2004,
    durationSec: 233,
    genre: 'Electronic',
  },
  {
    id: 'in-a-hood',
    title: 'In A Hood Near You',
    artist: 'Suni Clay',
    album: 'Most Wanted OST',
    year: 2005,
    durationSec: 238,
    genre: 'Hip-Hop',
  },
  {
    id: 'pursuit-theme',
    title: 'Condition Red (Pursuit Suite)',
    artist: 'Paul Linford',
    album: 'NFS: Most Wanted Original Score',
    year: 2005,
    durationSec: 275,
    genre: 'Score',
    interactivePursuitScore: true,
  },
];

export class EATraxService {
  private static instance: EATraxService;
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private beatInterval: number | null = null;
  private trackChangeListeners: Set<(song: EATraxSong, bannerVisible: boolean) => void> = new Set();
  private isBannerVisible: boolean = false;
  private bannerTimer: number | null = null;

  private constructor() {}

  public static getInstance(): EATraxService {
    if (!EATraxService.instance) {
      EATraxService.instance = new EATraxService();
    }
    return EATraxService.instance;
  }

  public init() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.55, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio for EA Trax unavailable:', e);
    }
  }

  public getCurrentTrack(): EATraxSong {
    return EA_TRAX_PLAYLIST[this.currentTrackIndex];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public play() {
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.startTrackSynthesizer();
    this.triggerBanner();
  }

  public pause() {
    this.isPlaying = false;
    this.stopTrackSynthesizer();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    this.stopTrackSynthesizer();
    this.currentTrackIndex = (this.currentTrackIndex + 1) % EA_TRAX_PLAYLIST.length;
    if (this.isPlaying) {
      this.startTrackSynthesizer();
    }
    this.triggerBanner();
  }

  public prevTrack() {
    this.stopTrackSynthesizer();
    this.currentTrackIndex = (this.currentTrackIndex - 1 + EA_TRAX_PLAYLIST.length) % EA_TRAX_PLAYLIST.length;
    if (this.isPlaying) {
      this.startTrackSynthesizer();
    }
    this.triggerBanner();
  }

  public selectTrack(index: number) {
    if (index < 0 || index >= EA_TRAX_PLAYLIST.length) return;
    this.stopTrackSynthesizer();
    this.currentTrackIndex = index;
    if (this.isPlaying) {
      this.startTrackSynthesizer();
    }
    this.triggerBanner();
  }

  public setVolume(volume0to1: number) {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume0to1)), this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Synthesizes rhythmic rock/electronic beats with basslines and guitar riffs
   * for the selected song genre using Web Audio API.
   */
  private startTrackSynthesizer() {
    if (!this.audioCtx || !this.masterGain) return;
    this.stopTrackSynthesizer();

    const track = this.getCurrentTrack();
    const bpm = track.genre === 'Metal' ? 152 : track.genre === 'Electronic' ? 140 : 128;
    const intervalMs = (60 / bpm) * 1000 / 2; // 8th notes

    let step = 0;
    const bassNotes = [55, 55, 65, 55, 73, 55, 82, 73]; // Heavy A/D minor riff

    this.beatInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.masterGain || !this.isPlaying) return;
      const t = this.audioCtx.currentTime;

      // 1. Kick Drum (steps 0, 4)
      if (step % 4 === 0) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.13);
      }

      // 2. Snare / Clack (steps 2, 6)
      if (step % 4 === 2) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.11);
      }

      // 3. Heavy Guitar/Bass Riff
      const noteFreq = bassNotes[step % bassNotes.length];
      const bassOsc = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bassOsc.type = track.genre === 'Metal' ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(noteFreq, t);

      // Lowpass distortion filter
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.genre === 'Metal' ? 950 : 600, t);
      filter.Q.setValueAtTime(4, t);

      bassGain.gain.setValueAtTime(0.28, t);
      bassGain.gain.exponentialRampToValueAtTime(0.02, t + 0.2);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(t);
      bassOsc.stop(t + 0.22);

      step++;
    }, intervalMs);
  }

  private stopTrackSynthesizer() {
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignored
      }
    });
    this.activeOscillators = [];
  }

  private triggerBanner() {
    this.isBannerVisible = true;
    this.notify();

    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
    }
    this.bannerTimer = window.setTimeout(() => {
      this.isBannerVisible = false;
      this.notify();
    }, 4500);
  }

  public subscribe(cb: (song: EATraxSong, bannerVisible: boolean) => void): () => void {
    this.trackChangeListeners.add(cb);
    cb(this.getCurrentTrack(), this.isBannerVisible);
    return () => this.trackChangeListeners.delete(cb);
  }

  private notify() {
    const song = this.getCurrentTrack();
    for (const cb of this.trackChangeListeners) {
      cb(song, this.isBannerVisible);
    }
  }
}
