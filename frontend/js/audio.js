/**
 * ENGINE AUDIO MANAGER
 * Handles high-fidelity engine sounds with smooth gain ramping and pitch shifting.
 */
export class EngineAudio {
  constructor(engineType = 'v8') {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
    
    this.idleBuffer = null;
    this.revBuffer = null;
    
    this.idleSource = null;
    this.isStarted = false;
    this.isRevving = false;
    
    this.audioPaths = {
      v8: { idle: 'assets/sounds/v8_idle.mp3', rev: 'assets/sounds/v8_rev.mp3' },
      i6: { idle: 'assets/sounds/i6_idle.mp3', rev: 'assets/sounds/i6_rev.mp3' },
      i4: { idle: 'assets/sounds/i4_idle.mp3', rev: 'assets/sounds/i4_rev.mp3' }
    };
    
    this.loadEngineSounds(engineType);
  }

  async loadEngineSounds(type) {
    const paths = this.audioPaths[type] || this.audioPaths.v8;
    this.idleBuffer = await this.loadBuffer(paths.idle);
    this.revBuffer = await this.loadBuffer(paths.rev);
  }

  async loadBuffer(path) {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn(`Engine sound not found at ${path}. Using fallback simulation.`);
      return null;
    }
  }

  start() {
    if (this.isStarted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.isStarted = true;
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 1);

    if (this.idleBuffer) {
      this.idleSource = this.ctx.createBufferSource();
      this.idleSource.buffer = this.idleBuffer;
      this.idleSource.loop = true;
      this.idleSource.connect(this.gainNode);
      this.idleSource.start(0);
    }
  }

  stop() {
    if (!this.isStarted) return;
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    setTimeout(() => {
      if (this.idleSource) this.idleSource.stop();
      this.isStarted = false;
    }, 500);
  }

  rev() {
    if (!this.isStarted || this.isRevving || !this.revBuffer) return;
    this.isRevving = true;

    // Temporary Gain Boost for Rev
    const revSource = this.ctx.createBufferSource();
    revSource.buffer = this.revBuffer;
    
    const revGain = this.ctx.createGain();
    revGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    revGain.connect(this.ctx.destination);
    
    revSource.connect(revGain);
    revSource.start(0);

    // Modulation: Increase idle pitch slightly (fake RPM increase)
    if (this.idleSource) {
      this.idleSource.playbackRate.exponentialRampToValueAtTime(1.5, this.ctx.currentTime + 0.2);
      this.idleSource.playbackRate.exponentialRampToValueAtTime(1.0, this.ctx.currentTime + 1.2);
    }

    setTimeout(() => { this.isRevving = false; }, 1200);
  }
}
