/**
 * AMBIENT AUDIO ENGINE
 * Atmospheric soundscapes for the deep-sea research theme
 * 
 * Adapted from music-playground for vanilla JS
 */

// Shared Web Audio context
let audioContext = null;
let masterGain = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function getMasterGain() {
  if (!masterGain) {
    const ctx = getAudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

// ============================================================================
// AMBIENCE - Background soundscapes
// ============================================================================

class Ambience {
  constructor() {
    this.layers = [];
    this.masterGain = getMasterGain();
    this.isPlaying = false;
  }

  async play(preset, options = {}) {
    await resumeAudioContext();
    
    const opts = {
      intensity: 0.5,
      depth: 2000,
      mystery: 0.3,
      interval: 5,
      fadeIn: 2,
      ...options
    };
    
    this.isPlaying = true;
    
    switch (preset) {
      case 'deepSea':
        this.createDeepSeaAmbience(opts);
        break;
      case 'rov':
        this.createROVAmbience(opts);
        break;
      case 'sonar':
        this.createSonarAmbience(opts);
        break;
      case 'bioluminescence':
        this.createBioluminescenceAmbience(opts);
        break;
      case 'hydrophone':
        this.createHydrophoneAmbience(opts);
        break;
      case 'discovery':
        this.createDiscoveryAmbience(opts);
        break;
      case 'tension':
        this.createTensionAmbience(opts);
        break;
    }
  }

  async addLayer(preset, options = {}) {
    await this.play(preset, options);
  }

  stop(fadeOut = 1) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    this.isPlaying = false;
    
    for (const layer of this.layers) {
      for (const gain of layer.gains) {
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + fadeOut);
      }
      
      setTimeout(() => {
        for (const osc of layer.oscillators) {
          try { osc.stop(); } catch {}
        }
        if (layer.noiseSource) {
          try { layer.noiseSource.stop(); } catch {}
        }
        for (const interval of layer.intervals) {
          clearInterval(interval);
        }
      }, fadeOut * 1000);
    }
    
    this.layers = [];
  }

  setVolume(volume) {
    const ctx = getAudioContext();
    this.masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  }

  // === DEEP SEA ===
  createDeepSeaAmbience(opts) {
    const ctx = getAudioContext();
    const layer = { name: 'deepSea', oscillators: [], gains: [], intervals: [] };
    
    // Lower frequency for deeper depths
    const baseFreq = Math.max(20, 60 - (opts.depth / 100));
    
    // Main drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = baseFreq;
    
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0;
    droneGain.gain.linearRampToValueAtTime(opts.intensity * 0.3, ctx.currentTime + opts.fadeIn);
    
    // Sub-bass layer
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = baseFreq / 2;
    
    const subGain = ctx.createGain();
    subGain.gain.value = 0;
    subGain.gain.linearRampToValueAtTime(opts.intensity * 0.2, ctx.currentTime + opts.fadeIn);
    
    // Slow LFO modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05;
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5;
    
    lfo.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency);
    
    droneOsc.connect(droneGain);
    subOsc.connect(subGain);
    droneGain.connect(this.masterGain);
    subGain.connect(this.masterGain);
    
    droneOsc.start();
    subOsc.start();
    lfo.start();
    
    layer.oscillators.push(droneOsc, subOsc, lfo);
    layer.gains.push(droneGain, subGain);
    
    this.addFilteredNoise(layer, opts.intensity * 0.1, 100, 400, opts.fadeIn);
    
    // Mystery elements
    if (opts.mystery > 0.2) {
      const mysteryInterval = setInterval(() => {
        if (!this.isPlaying) return;
        if (Math.random() < opts.mystery) {
          this.playMysteryTone(opts.intensity * 0.15);
        }
      }, 8000);
      layer.intervals.push(mysteryInterval);
    }
    
    this.layers.push(layer);
  }

  // === ROV ===
  createROVAmbience(opts) {
    const ctx = getAudioContext();
    const layer = { name: 'rov', oscillators: [], gains: [], intervals: [] };
    
    // Motor hum
    const motorOsc = ctx.createOscillator();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.value = 60;
    
    const motorFilter = ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 200;
    motorFilter.Q.value = 2;
    
    const motorGain = ctx.createGain();
    motorGain.gain.value = 0;
    motorGain.gain.linearRampToValueAtTime(opts.intensity * 0.15, ctx.currentTime + opts.fadeIn);
    
    // Secondary harmonic
    const motor2Osc = ctx.createOscillator();
    motor2Osc.type = 'triangle';
    motor2Osc.frequency.value = 120;
    
    const motor2Gain = ctx.createGain();
    motor2Gain.gain.value = 0;
    motor2Gain.gain.linearRampToValueAtTime(opts.intensity * 0.08, ctx.currentTime + opts.fadeIn);
    
    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(this.masterGain);
    
    motor2Osc.connect(motor2Gain);
    motor2Gain.connect(this.masterGain);
    
    motorOsc.start();
    motor2Osc.start();
    
    layer.oscillators.push(motorOsc, motor2Osc);
    layer.gains.push(motorGain, motor2Gain);
    
    // Servo sounds
    const servoInterval = setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.3) {
        this.playServoSound(opts.intensity * 0.2);
      }
    }, 4000);
    layer.intervals.push(servoInterval);
    
    this.layers.push(layer);
  }

  // === SONAR ===
  createSonarAmbience(opts) {
    const layer = { name: 'sonar', oscillators: [], gains: [], intervals: [] };
    
    const pingInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.playSonarPing(opts.intensity * 0.4);
    }, (opts.interval || 5) * 1000);
    
    layer.intervals.push(pingInterval);
    
    setTimeout(() => this.playSonarPing(opts.intensity * 0.4), 500);
    
    this.layers.push(layer);
  }

  // === BIOLUMINESCENCE ===
  createBioluminescenceAmbience(opts) {
    const ctx = getAudioContext();
    const layer = { name: 'bioluminescence', oscillators: [], gains: [], intervals: [] };
    
    const frequencies = [220, 330, 440, 554];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(opts.intensity * 0.08, ctx.currentTime + opts.fadeIn + i * 0.5);
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2 + i * 0.1;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = opts.intensity * 0.02;
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      lfo.start();
      
      layer.oscillators.push(osc, lfo);
      layer.gains.push(gain);
    });
    
    const shimmerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.4) {
        this.playShimmer(opts.intensity * 0.15);
      }
    }, 3000);
    layer.intervals.push(shimmerInterval);
    
    this.layers.push(layer);
  }

  // === HYDROPHONE ===
  createHydrophoneAmbience(opts) {
    const layer = { name: 'hydrophone', oscillators: [], gains: [], intervals: [] };
    
    this.addFilteredNoise(layer, opts.intensity * 0.15, 200, 2000, opts.fadeIn);
    
    const crackleInterval = setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.5) {
        this.playCrackle(opts.intensity * 0.1);
      }
    }, 2000);
    layer.intervals.push(crackleInterval);
    
    this.layers.push(layer);
  }

  // === DISCOVERY ===
  createDiscoveryAmbience(opts) {
    const ctx = getAudioContext();
    const layer = { name: 'discovery', oscillators: [], gains: [], intervals: [] };
    
    const tensionOsc = ctx.createOscillator();
    tensionOsc.type = 'sine';
    tensionOsc.frequency.value = 80;
    tensionOsc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 10);
    
    const tensionFilter = ctx.createBiquadFilter();
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.value = 300;
    
    const tensionGain = ctx.createGain();
    tensionGain.gain.value = 0;
    tensionGain.gain.linearRampToValueAtTime(opts.intensity * 0.2, ctx.currentTime + opts.fadeIn);
    
    const wonderOsc = ctx.createOscillator();
    wonderOsc.type = 'sine';
    wonderOsc.frequency.value = 440;
    
    const wonderGain = ctx.createGain();
    wonderGain.gain.value = 0;
    wonderGain.gain.linearRampToValueAtTime(opts.intensity * 0.1, ctx.currentTime + opts.fadeIn + 2);
    
    tensionOsc.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    tensionGain.connect(this.masterGain);
    
    wonderOsc.connect(wonderGain);
    wonderGain.connect(this.masterGain);
    
    tensionOsc.start();
    wonderOsc.start();
    
    layer.oscillators.push(tensionOsc, wonderOsc);
    layer.gains.push(tensionGain, wonderGain);
    
    this.layers.push(layer);
  }

  // === TENSION ===
  createTensionAmbience(opts) {
    const ctx = getAudioContext();
    const layer = { name: 'tension', oscillators: [], gains: [], intervals: [] };
    
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.value = 30;
    
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0;
    rumbleGain.gain.linearRampToValueAtTime(opts.intensity * 0.25, ctx.currentTime + opts.fadeIn);
    
    const dissonantOsc = ctx.createOscillator();
    dissonantOsc.type = 'sine';
    dissonantOsc.frequency.value = 233;
    
    const dissonantGain = ctx.createGain();
    dissonantGain.gain.value = 0;
    dissonantGain.gain.linearRampToValueAtTime(opts.intensity * 0.08, ctx.currentTime + opts.fadeIn + 3);
    
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    
    dissonantOsc.connect(dissonantGain);
    dissonantGain.connect(this.masterGain);
    
    rumbleOsc.start();
    dissonantOsc.start();
    
    layer.oscillators.push(rumbleOsc, dissonantOsc);
    layer.gains.push(rumbleGain, dissonantGain);
    
    this.layers.push(layer);
  }

  // === HELPERS ===
  addFilteredNoise(layer, volume, lowFreq, highFreq, fadeIn) {
    const ctx = getAudioContext();
    
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = highFreq;
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = lowFreq;
    
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
    
    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    
    layer.noiseSource = noise;
    layer.gains.push(gain);
  }

  playSonarPing(volume) {
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 2);
  }

  playMysteryTone(volume) {
    const ctx = getAudioContext();
    
    const frequencies = [55, 82.5, 110, 165];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 6);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 6);
  }

  playServoSound(volume) {
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 200 + Math.random() * 100;
    osc.frequency.linearRampToValueAtTime(150 + Math.random() * 50, ctx.currentTime + 0.3);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  playShimmer(volume) {
    const ctx = getAudioContext();
    
    const baseFreq = 800 + Math.random() * 400;
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * (1 + i * 0.5);
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(volume * (1 - i * 0.3), ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 1.5);
    }
  }

  playCrackle(volume) {
    const ctx = getAudioContext();
    
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.random();
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }
}

// ============================================================================
// SOUND EFFECTS - One-shot sounds
// ============================================================================

class SoundEffect {
  constructor(volume = 0.5) {
    this.masterGain = getMasterGain();
    this.volume = volume;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  async play(type) {
    await resumeAudioContext();
    
    switch (type) {
      case 'sonarPing': this.playSonarPing(); break;
      case 'sonarReturn': this.playSonarReturn(); break;
      case 'notification': this.playNotification(); break;
      case 'error': this.playError(); break;
      case 'success': this.playSuccess(); break;
      case 'click': this.playClick(); break;
      case 'hover': this.playHover(); break;
      case 'open': this.playOpen(); break;
      case 'close': this.playClose(); break;
      case 'discovery': this.playDiscovery(); break;
      case 'warning': this.playWarning(); break;
      case 'transmit': this.playTransmit(); break;
      case 'receive': this.playReceive(); break;
      case 'depth': this.playDepth(); break;
      case 'pressure': this.playPressure(); break;
      case 'creature': this.playCreature(); break;
    }
  }

  playSonarPing() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 2);
  }

  playSonarReturn() {
    setTimeout(() => {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }, 800);
  }

  playNotification() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [440, 554, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  playError() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.1);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.setValueAtTime(this.volume * 0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playSuccess() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }

  playClick() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playHover() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 600;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  playOpen() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playClose() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playDiscovery() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [261, 329, 392, 523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 1);
    });
  }

  playWarning() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 440;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.25, now + i * 0.3);
      gain.gain.setValueAtTime(0, now + i * 0.3 + 0.15);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.15);
    }
  }

  playTransmit() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1000 + Math.random() * 500;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.05);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    }
  }

  playReceive() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playDepth() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playPressure() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 40;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.2);
    gain.gain.linearRampToValueAtTime(0, now + 1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 1);
  }

  playCreature() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Eerie whale-like sound
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(120, now + 1.5);
    osc.frequency.exponentialRampToValueAtTime(180, now + 2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.3);
    gain.gain.setValueAtTime(this.volume * 0.2, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 2.5);
  }
}

// Export for use
window.AudioEngine = {
  Ambience,
  SoundEffect,
  resumeAudioContext
};
