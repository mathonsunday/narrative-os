// Sample-based instrument player
// Uses Soundfont for high-quality instrument samples

import { getAudioContext, getMasterGain } from '../shared/audio-context';
import Soundfont from 'soundfont-player';
import type { InstrumentName, Player } from 'soundfont-player';

export type InstrumentType = InstrumentName;

// Common instruments for quick access
export const INSTRUMENTS = {
  piano: 'acoustic_grand_piano' as InstrumentName,
  electricPiano: 'electric_piano_1' as InstrumentName,
  organ: 'drawbar_organ' as InstrumentName,
  guitar: 'acoustic_guitar_nylon' as InstrumentName,
  electricGuitar: 'electric_guitar_clean' as InstrumentName,
  bass: 'acoustic_bass' as InstrumentName,
  electricBass: 'electric_bass_finger' as InstrumentName,
  strings: 'string_ensemble_1' as InstrumentName,
  violin: 'violin' as InstrumentName,
  cello: 'cello' as InstrumentName,
  flute: 'flute' as InstrumentName,
  trumpet: 'trumpet' as InstrumentName,
  saxophone: 'alto_sax' as InstrumentName,
  marimba: 'marimba' as InstrumentName,
  vibraphone: 'vibraphone' as InstrumentName,
  bells: 'tubular_bells' as InstrumentName,
  pad: 'pad_2_warm' as InstrumentName,
};

export class Sampler {
  private instrument: Player | null = null;
  private instrumentName: InstrumentName;
  private loading: boolean = false;
  private outputNode: GainNode;
  private activeNotes: Map<number, { stop: () => void }> = new Map();
  
  constructor(instrumentName: InstrumentName = INSTRUMENTS.piano) {
    this.instrumentName = instrumentName;
    
    const ctx = getAudioContext();
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.7;
    this.outputNode.connect(getMasterGain());
  }
  
  connect(destination: AudioNode): void {
    this.outputNode.disconnect();
    this.outputNode.connect(destination);
  }
  
  // Load an instrument (must be called before playing)
  async loadInstrument(name?: InstrumentName): Promise<void> {
    if (name) {
      this.instrumentName = name;
    }
    
    if (this.loading) return;
    this.loading = true;
    
    try {
      const ctx = getAudioContext();
      this.instrument = await Soundfont.instrument(ctx, this.instrumentName, {
        soundfont: 'MusyngKite',
        destination: this.outputNode,
      });
      console.log(`Loaded instrument: ${this.instrumentName}`);
    } catch (error) {
      console.error(`Failed to load instrument: ${this.instrumentName}`, error);
    } finally {
      this.loading = false;
    }
  }
  
  // Check if instrument is loaded
  isLoaded(): boolean {
    return this.instrument !== null;
  }
  
  // Check if instrument is loading
  isLoading(): boolean {
    return this.loading;
  }
  
  // Play a note by MIDI number
  playNote(midiNote: number, startTime?: number, duration: number = 0.5, velocity: number = 0.7): void {
    if (!this.instrument) {
      console.warn('Instrument not loaded. Call loadInstrument() first.');
      return;
    }
    
    const ctx = getAudioContext();
    const time = startTime ?? ctx.currentTime;
    
    this.instrument.play(midiNote.toString(), time, {
      duration,
      gain: velocity,
    });
  }
  
  // Play a note by frequency (converts to nearest MIDI note)
  playNoteByFrequency(frequency: number, startTime?: number, duration: number = 0.5, velocity: number = 0.7): void {
    const midiNote = Math.round(12 * Math.log2(frequency / 440) + 69);
    this.playNote(midiNote, startTime, duration, velocity);
  }
  
  // Start a sustained note (for real-time playing)
  startNote(midiNote: number, velocity: number = 0.7): number {
    if (!this.instrument) {
      console.warn('Instrument not loaded. Call loadInstrument() first.');
      return -1;
    }
    
    const noteObj = this.instrument.play(midiNote.toString(), undefined, {
      gain: velocity,
    });
    
    const voiceId = midiNote * 1000 + Math.random() * 100;
    this.activeNotes.set(voiceId, noteObj);
    
    return voiceId;
  }
  
  // Start a note by frequency
  startNoteByFrequency(frequency: number, velocity: number = 0.7): number {
    const midiNote = Math.round(12 * Math.log2(frequency / 440) + 69);
    return this.startNote(midiNote, velocity);
  }
  
  // Release a sustained note
  releaseNote(voiceId: number): void {
    const note = this.activeNotes.get(voiceId);
    if (note) {
      note.stop();
      this.activeNotes.delete(voiceId);
    }
  }
  
  // Change instrument
  async setInstrument(name: InstrumentName): Promise<void> {
    this.stopAll();
    this.instrument = null;
    await this.loadInstrument(name);
  }
  
  // Get current instrument name
  getInstrumentName(): InstrumentName {
    return this.instrumentName;
  }
  
  // Stop all playing notes
  stopAll(): void {
    this.activeNotes.forEach(note => {
      try {
        note.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeNotes.clear();
    
    if (this.instrument) {
      this.instrument.stop();
    }
  }
}

// Get list of available instruments
export function getAvailableInstruments(): { name: string; value: InstrumentName }[] {
  return Object.entries(INSTRUMENTS).map(([name, value]) => ({
    name: name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value,
  }));
}
