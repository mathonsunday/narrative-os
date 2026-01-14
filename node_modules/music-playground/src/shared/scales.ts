// Musical scales and frequency helpers

// Note frequencies for octave 4 (middle octave)
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
};

// Scale intervals (semitones from root)
export const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

// Get frequency for a note name and octave
export function noteToFrequency(note: string, octave: number = 4): number {
  const baseFreq = NOTE_FREQUENCIES[note];
  if (!baseFreq) return 440; // Default to A4
  
  const octaveDiff = octave - 4;
  return baseFreq * Math.pow(2, octaveDiff);
}

// Get frequency from MIDI note number
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Get a scale starting from a root note
export function getScaleFrequencies(
  rootNote: string,
  scaleName: string,
  octave: number = 4,
  numOctaves: number = 2
): number[] {
  const scale = SCALES[scaleName] || SCALES.major;
  const frequencies: number[] = [];
  
  for (let oct = 0; oct < numOctaves; oct++) {
    for (const interval of scale) {
      const midiNote = noteToMidi(rootNote, octave + oct) + interval;
      frequencies.push(midiToFrequency(midiNote));
    }
  }
  
  return frequencies;
}

// Convert note name to MIDI number
export function noteToMidi(note: string, octave: number = 4): number {
  const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}

// Get note name from MIDI number
export function midiToNote(midiNote: number): { note: string; octave: number } {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const note = notes[midiNote % 12];
  return { note, octave };
}

// Quantize a frequency to the nearest note in a scale
export function quantizeToScale(
  frequency: number,
  rootNote: string,
  scaleName: string
): number {
  const scaleFreqs = getScaleFrequencies(rootNote, scaleName, 2, 6);
  
  let closest = scaleFreqs[0];
  let minDiff = Math.abs(frequency - closest);
  
  for (const freq of scaleFreqs) {
    const diff = Math.abs(frequency - freq);
    if (diff < minDiff) {
      minDiff = diff;
      closest = freq;
    }
  }
  
  return closest;
}

// Map a value (0-1) to a frequency range
export function mapToFrequency(
  value: number,
  minFreq: number = 100,
  maxFreq: number = 2000
): number {
  // Use exponential mapping for more natural pitch perception
  const minLog = Math.log2(minFreq);
  const maxLog = Math.log2(maxFreq);
  const logFreq = minLog + value * (maxLog - minLog);
  return Math.pow(2, logFreq);
}
