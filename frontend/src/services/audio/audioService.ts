/**
 * Audio Service
 * Pure Web Audio API synthesis for Emergency Siren and Simulated Calls.
 * Requires 0 network requests, 0 external audio files, and works completely offline.
 */

class AudioService {
  private audioCtx: AudioContext | null = null;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenActive = false;
  private isMuted = false;
  private volumeLevel = 1.0;

  private ringtoneInterval: number | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    return this.audioCtx;
  }

  /**
   * Starts emergency dual-frequency piercing siren sound.
   * Modulated between 700Hz and 1200Hz.
   * Returns: { success: boolean; error?: string }
   */
  public async startSiren(): Promise<{ success: boolean; error?: string }> {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (this.isSirenActive) {
        return { success: true };
      }

      // Gain master
      this.sirenGain = ctx.createGain();
      this.sirenGain.gain.setValueAtTime(this.isMuted ? 0 : this.volumeLevel, ctx.currentTime);
      this.sirenGain.connect(ctx.destination);

      // Carrier Oscillator 1: Sawtooth wave for high penetration
      this.sirenOsc1 = ctx.createOscillator();
      this.sirenOsc1.type = 'sawtooth';
      this.sirenOsc1.frequency.setValueAtTime(850, ctx.currentTime);

      // Carrier Oscillator 2: Square wave harmonic
      this.sirenOsc2 = ctx.createOscillator();
      this.sirenOsc2.type = 'square';
      this.sirenOsc2.frequency.setValueAtTime(854, ctx.currentTime); // Slight detune for dissonance

      // Low Frequency Oscillator (LFO) to sweep carrier frequency up and down (1.5 Hz siren cycle)
      this.lfo = ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(1.5, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(350, ctx.currentTime); // sweep ±350Hz (500Hz to 1200Hz)

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.sirenOsc1.frequency);
      lfoGain.connect(this.sirenOsc2.frequency);

      this.sirenOsc1.connect(this.sirenGain);
      this.sirenOsc2.connect(this.sirenGain);

      this.sirenOsc1.start();
      this.sirenOsc2.start();
      this.lfo.start();

      this.isSirenActive = true;
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AudioContext initialisation failed';
      return { success: false, error: msg };
    }
  }

  /**
   * Stops the siren immediately and cleans up audio nodes.
   */
  public stopSiren(): void {
    try {
      if (this.sirenOsc1) {
        this.sirenOsc1.stop();
        this.sirenOsc1.disconnect();
        this.sirenOsc1 = null;
      }
      if (this.sirenOsc2) {
        this.sirenOsc2.stop();
        this.sirenOsc2.disconnect();
        this.sirenOsc2 = null;
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo = null;
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
        this.sirenGain = null;
      }
    } catch {
      // Ignore cleanup error
    } finally {
      this.isSirenActive = false;
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.sirenGain && this.audioCtx) {
      this.sirenGain.gain.setValueAtTime(muted ? 0 : this.volumeLevel, this.audioCtx.currentTime);
    }
  }

  public setVolume(vol: number): void {
    this.volumeLevel = Math.max(0, Math.min(1, vol));
    if (this.sirenGain && this.audioCtx && !this.isMuted) {
      this.sirenGain.gain.setValueAtTime(this.volumeLevel, this.audioCtx.currentTime);
    }
  }

  public getSirenStatus(): { isPlaying: boolean; isMuted: boolean; audioBlocked: boolean; volume: number } {
    const isSuspended = this.audioCtx?.state === 'suspended';
    return {
      isPlaying: this.isSirenActive,
      isMuted: this.isMuted,
      audioBlocked: isSuspended,
      volume: this.volumeLevel
    };
  }

  /**
   * Plays a simulated phone ringtone burst sequence (offline).
   */
  public startRingtone(): void {
    this.stopRingtone();
    const playBurst = () => {
      try {
        const ctx = this.getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1); // US standard ringtone chord

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch {
        // audio policy fallback
      }
    };

    playBurst();
    this.ringtoneInterval = window.setInterval(playBurst, 3000);
  }

  public stopRingtone(): void {
    if (this.ringtoneInterval !== null) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }
}

export const audioService = new AudioService();
