/**
 * Command Generator
 * 
 * Generates practice commands for the user.
 * Intelligently selects notes, strings, and frets.
 * 
 * Why: Centralized command logic with anti-repetition.
 * Pattern: Stateful service tracking recent commands.
 */

type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
type GuitarString = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

export interface PracticeCommand {
  id: string;
  note: NoteName;
  octave: number;
  string: GuitarString;
  fret: number;
  spokenText: string;
}

// Fretboard mapping: [string][fret] = note
const FRETBOARD: Record<GuitarString, NoteName[]> = {
  E2: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
  A2: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
  D3: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
  G3: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
  B3: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  E4: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
};

const ALL_STRINGS: GuitarString[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

class CommandGenerator {
  private recentCommands: PracticeCommand[] = [];
  private maxRecentHistory = 5;

  /**
   * Generate a new practice command
   */
  generate(allowedFrets: number[] = [0, 1, 2, 3, 4, 5]): PracticeCommand {
    // Select random string and fret (avoiding recent selections)
    const string = this.selectString(ALL_STRINGS);
    const fret = allowedFrets[Math.floor(Math.random() * allowedFrets.length)];
    
    // Get note from fretboard
    const note = FRETBOARD[string][fret];
    const octave = this.getOctave(string, fret);

    const command: PracticeCommand = {
      id: this.generateId(),
      note,
      octave,
      string,
      fret,
      spokenText: this.generateSpokenText(note, string, fret),
    };

    // Track recent commands to avoid repetition
    this.recentCommands.push(command);
    if (this.recentCommands.length > this.maxRecentHistory) {
      this.recentCommands.shift();
    }

    return command;
  }

  /**
   * Select a string, avoiding recent selections
   */
  private selectString(allowedStrings: GuitarString[]): GuitarString {
    const recentStrings = this.recentCommands.map(cmd => cmd.string);
    const availableStrings = allowedStrings.filter(
      str => !recentStrings.slice(-2).includes(str)
    );

    const strings = availableStrings.length > 0 ? availableStrings : allowedStrings;
    return strings[Math.floor(Math.random() * strings.length)];
  }

  /**
   * Calculate octave based on string and fret
   */
  private getOctave(string: GuitarString, fret: number): number {
    const baseOctave = parseInt(string[1]);
    const semitonesUp = fret;
    const octaveIncrease = Math.floor(semitonesUp / 12);
    
    return baseOctave + octaveIncrease;
  }

  /**
   * Generate spoken instruction text
   */
  private generateSpokenText(note: NoteName, string: GuitarString, fret: number): string {
    const stringName = this.getStringName(string);
    
    if (fret === 0) {
      return `Play ${note} on the ${stringName} string, open`;
    }
    
    return `Play ${note} on the ${stringName} string, fret ${fret}`;
  }

  /**
   * Get friendly string name for TTS
   */
  private getStringName(string: GuitarString): string {
    const names: Record<GuitarString, string> = {
      E2: 'low E',
      A2: 'A',
      D3: 'D',
      G3: 'G',
      B3: 'B',
      E4: 'high E',
    };
    return names[string];
  }

  /**
   * Generate unique command ID
   */
  private generateId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear recent command history
   */
  clearHistory(): void {
    this.recentCommands = [];
  }
}

export const commandGenerator = new CommandGenerator();
