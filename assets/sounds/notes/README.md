# Musical Note Audio Files

This directory contains WAV audio files for musical notes used in the Ear Training game.

## Required Files

You need 36 WAV files covering 3 octaves (Octave 3, 4, and 5):

### Octave 3 (12 files)
- C3.wav, Cs3.wav, D3.wav, Ds3.wav, E3.wav, F3.wav
- Fs3.wav, G3.wav, Gs3.wav, A3.wav, As3.wav, B3.wav

### Octave 4 (12 files) - Most commonly used
- C4.wav, Cs4.wav, D4.wav, Ds4.wav, E4.wav, F4.wav
- Fs4.wav, G4.wav, Gs4.wav, A4.wav, As4.wav, B4.wav

### Octave 5 (12 files)
- C5.wav, Cs5.wav, D5.wav, Ds5.wav, E5.wav, F5.wav
- Fs5.wav, G5.wav, Gs5.wav, A5.wav, As5.wav, B5.wav

**Note**: "s" represents sharp (♯). For example, Cs4 = C♯4 (C sharp, octave 4)

## File Format Requirements

- **Format**: WAV (uncompressed)
- **Sample Rate**: 44100 Hz (CD quality) recommended
- **Bit Depth**: 16-bit or 24-bit
- **Channels**: Mono or Stereo
- **Duration**: 1-2 seconds per note
- **Volume**: Normalized to prevent clipping

## Where to Get Note Files

### Option 1: Record Your Own (Best Quality)
1. Use a guitar, piano, or synthesizer
2. Record each note cleanly
3. Export as WAV files
4. Name them according to the convention above

### Option 2: Download Free Samples

**Freesound.org** (Free, requires account)
- https://freesound.org/
- Search for "piano note C4" or "guitar note A4"
- Download individual notes
- Rename to match the naming convention

**Philharmonia Orchestra** (Free, high quality)
- https://philharmonia.co.uk/resources/sound-samples/
- Professional orchestral instrument samples
- Download individual notes
- Convert to WAV if needed

**University of Iowa Electronic Music Studios**
- http://theremin.music.uiowa.edu/MIS.html
- Free musical instrument samples
- High quality recordings

**Samples From Mars** (Some free packs)
- https://samplesfrommars.com/
- Look for free piano or synth packs

### Option 3: Generate with Software

**Audacity** (Free)
1. Download from https://www.audacityteam.org/
2. Generate → Tone
3. Set frequency for each note (see frequency table below)
4. Set duration to 1.5 seconds
5. Export as WAV
6. Repeat for all notes

**Online Tone Generator**
- https://www.szynalski.com/tone-generator/
- Generate each frequency
- Record with audio software
- Export as WAV

## Note Frequencies Reference

| Note | Octave 3 | Octave 4 | Octave 5 |
|------|----------|----------|----------|
| C    | 130.81 Hz | 261.63 Hz | 523.25 Hz |
| C♯   | 138.59 Hz | 277.18 Hz | 554.37 Hz |
| D    | 146.83 Hz | 293.66 Hz | 587.33 Hz |
| D♯   | 155.56 Hz | 311.13 Hz | 622.25 Hz |
| E    | 164.81 Hz | 329.63 Hz | 659.25 Hz |
| F    | 174.61 Hz | 349.23 Hz | 698.46 Hz |
| F♯   | 185.00 Hz | 369.99 Hz | 739.99 Hz |
| G    | 196.00 Hz | 392.00 Hz | 783.99 Hz |
| G♯   | 207.65 Hz | 415.30 Hz | 830.61 Hz |
| A    | 220.00 Hz | 440.00 Hz | 880.00 Hz |
| A♯   | 233.08 Hz | 466.16 Hz | 932.33 Hz |
| B    | 246.94 Hz | 493.88 Hz | 987.77 Hz |

## Quick Setup Guide

### Using Audacity (Recommended for Beginners)

1. **Install Audacity**
   - Download from https://www.audacityteam.org/
   - Install and open

2. **Generate First Note (C4)**
   - Go to: Generate → Tone
   - Waveform: Sine (for pure tone) or Piano (if available)
   - Frequency: 261.63 Hz
   - Amplitude: 0.8
   - Duration: 1.5 seconds
   - Click OK

3. **Export**
   - File → Export → Export as WAV
   - Save as `C4.wav` in this directory
   - Format: WAV (Microsoft) 16-bit PCM

4. **Repeat for All Notes**
   - Use the frequency table above
   - Generate and export each note
   - Name according to convention (C3.wav, Cs3.wav, etc.)

### Batch Processing Tips

If you have a MIDI keyboard or software:
1. Record all notes in one session
2. Use audio editing software to split into individual files
3. Normalize volume across all files
4. Export as WAV with consistent settings

## File Naming Convention

**Important**: File names are case-sensitive!

- Natural notes: `C4.wav`, `D4.wav`, `E4.wav`, etc.
- Sharp notes: `Cs4.wav`, `Ds4.wav`, `Fs4.wav`, etc.
- Use capital letters for note names
- Use lowercase 's' for sharp
- Include octave number

## Testing Your Files

After adding files:
1. Restart the Expo development server
2. Open the app
3. Go to Practice → Ear Training
4. Start a game
5. Listen for the note sounds

If you hear a generic beep instead of your note, check:
- File names match exactly (case-sensitive)
- Files are in WAV format
- Files are in the correct directory
- Restart the development server

## Fallback Behavior

If note files are missing:
- **Web**: Uses Web Audio API to synthesize notes (always works)
- **Mobile**: Falls back to online sound or logs to console

The app will still function, but local files provide:
- Better sound quality
- Faster playback
- Offline support
- More realistic instrument sounds

## Recommended Workflow

1. Start with Octave 4 (12 files) - most commonly used
2. Test the app to ensure they work
3. Add Octave 3 and 5 if needed
4. Use consistent instrument/timbre across all notes
5. Normalize volume levels

## File Size Considerations

- Each WAV file: ~100-300 KB
- Total for 36 files: ~4-10 MB
- Keep files under 500 KB each for faster loading
- Consider using 16-bit instead of 24-bit to reduce size

## Need Help?

If you're having trouble:
1. Check the console for error messages
2. Verify file names match exactly
3. Ensure files are valid WAV format
4. Try regenerating with Audacity
5. Test with just one file first (C4.wav)

---

**Note**: The app will work without these files (using synthesized sounds on web), but local files provide a much better user experience on mobile devices.
