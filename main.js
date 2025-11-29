// ---------------------------------------
// GLOBAL STATE
// ---------------------------------------
let tracks = {};
let gainNode = new Tone.Gain(1).toDestination();
let keyShiftSemitones = 0;
let tempoMult = 1;

// Track file mapping
const MIDI_FILES = {
  timeline: "midi/timeline.mid",
  arp: "midi/arp.mid",
  bass: "midi/bass.mid",
  bells: "Break the Mold Bells.mid",
  chords: "midi/chords.mid",
};

// ---------------------------------------
// LOAD ALL MIDI FILES
// ---------------------------------------
async function loadAllMIDI() {
  for (const key in MIDI_FILES) {
    const midiData = await fetch(MIDI_FILES[key]).then((r) => r.arrayBuffer());

    const midi = new Tone.Midi(midiData);
    const synth = new Tone.PolySynth(Tone.Synth).connect(gainNode);

    const part = new Tone.Part((time, note) => {
      // transpose note by slider semitones
      const transposed = Tone.Frequency(note.name).transpose(keyShiftSemitones);
      synth.triggerAttackRelease(
        transposed,
        note.duration,
        time,
        note.velocity
      );
    }, midi.tracks[0].notes).start(0);

    part.loop = true;
    part.loopEnd = midi.duration;

    tracks[key] = { part, synth, isPlaying: false };
  }
}

loadAllMIDI();

// -----------------------------------------------------
// BUTTON CLICK HANDLER (Start/Stop individual tracks)
// -----------------------------------------------------
document.querySelectorAll("button[data-track]").forEach((button) => {
  button.addEventListener("click", async () => {
    await Tone.start();

    const trackName = button.getAttribute("data-track");
    const track = tracks[trackName];

    if (!track) return;

    track.isPlaying = !track.isPlaying;

    if (track.isPlaying) {
      button.style.background = "#1b6";
      Tone.Transport.start();
    } else {
      button.style.background = "#333";
      track.part.stop();
    }
  });
});

// ---------------------------------------
// Tempo Control
// ---------------------------------------
document.getElementById("tempoSlider").addEventListener("input", (e) => {
  tempoMult = parseFloat(e.target.value);
  Tone.Transport.bpm.value = 120 * tempoMult;
});

// ---------------------------------------
// Gain Control
// ---------------------------------------
document.getElementById("gainSlider").addEventListener("input", (e) => {
  gainNode.gain.value = parseFloat(e.target.value);
});

// ---------------------------------------
// Key Shift Control
// ---------------------------------------
document.getElementById("keySlider").addEventListener("input", (e) => {
  keyShiftSemitones = parseInt(e.target.value);
});
