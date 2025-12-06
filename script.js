// --------------------------
// MIDI File Paths
// --------------------------
const midiFiles = {
  arpeggiator: "assets/BtM Arp.mid",
  bassLine: "assets/BtM Bass.mid",
  bells: "assets/Break the Mold Bells.mid",
  blockChords: "assets/BtM Choir.mid",
};

// --------------------------
// Tone.js Setup
// --------------------------
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const reverb = new Tone.Reverb().toDestination();
synth.connect(reverb);

// Track state
let arpeggiatorEnabled = false;
let bassLineEnabled = false;
let bellsEnabled = false;
let blockChordsEnabled = false;

// Tempo + Key
let defaultTempo = 111;
let currentTempo = defaultTempo;
let keyShift = 0;

// Store Tone.Part objects for each track
let trackParts = {};

// --------------------------
// Load MIDI Files
// --------------------------
async function loadMIDI(file) {
  try {
    const midi = await Midi.fromUrl(file);
    return midi;
  } catch (error) {
    console.error("Error loading MIDI:", error);
    return null;
  }
}

let arpeggiatorMidi, bassLineMidi, bellsMidi, blockChordsMidi;

Promise.all([
  loadMIDI(midiFiles.arpeggiator).then((m) => (arpeggiatorMidi = m)),
  loadMIDI(midiFiles.bassLine).then((m) => (bassLineMidi = m)),
  loadMIDI(midiFiles.bells).then((m) => (bellsMidi = m)),
  loadMIDI(midiFiles.blockChords).then((m) => (blockChordsMidi = m)),
]).then(() => {
  if (arpeggiatorMidi?.header?.tempos?.length > 0) {
    defaultTempo = arpeggiatorMidi.header.tempos[0].bpm;
    currentTempo = defaultTempo;
  }
  updateSliders();
});

// --------------------------
// Create a Tone.Part from a MIDI Track
// --------------------------
function createPartFromMIDI(midi) {
  const events = [];

  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      events.push({
        time: note.time, // original MIDI time
        note: note.name,
        duration: note.duration, // original MIDI duration
      });
    });
  });

  const part = new Tone.Part((time, value) => {
    // Apply current key shift dynamically
    const shiftedMidi = Tone.Frequency(value.note).toMidi() + keyShift;
    const shiftedNote = Tone.Frequency(shiftedMidi, "midi").toNote();

    // Apply current tempo scaling
    const tempoRatio = defaultTempo / currentTempo;
    synth.triggerAttackRelease(shiftedNote, value.duration * tempoRatio, time);
  }, events);

  part.loop = false;
  return part;
}

// --------------------------
// Start Selected Tracks
// --------------------------
function startSelectedMIDI() {
  // Stop previous parts before starting new ones
  stopPlayback();

  // Clear previous trackParts
  trackParts = {};

  if (arpeggiatorEnabled && arpeggiatorMidi) {
    trackParts.arpeggiator = createPartFromMIDI(arpeggiatorMidi);
    trackParts.arpeggiator.start(0);
  }
  if (bassLineEnabled && bassLineMidi) {
    trackParts.bassLine = createPartFromMIDI(bassLineMidi);
    trackParts.bassLine.start(0);
  }
  if (bellsEnabled && bellsMidi) {
    trackParts.bells = createPartFromMIDI(bellsMidi);
    trackParts.bells.start(0);
  }
  if (blockChordsEnabled && blockChordsMidi) {
    trackParts.blockChords = createPartFromMIDI(blockChordsMidi);
    trackParts.blockChords.start(0);
  }

  Tone.Transport.start();
}

// --------------------------
// Stop Playback
// --------------------------
function stopPlayback() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Object.values(trackParts).forEach((part) => part.stop());
  trackParts = {};
  synth.releaseAll();
}

// --------------------------
// Track Toggle
// --------------------------
function toggleTrack(track) {
  switch (track) {
    case "arpeggiator":
      arpeggiatorEnabled = !arpeggiatorEnabled;
      toggleButtonColor("toggleArpeggiator", arpeggiatorEnabled);
      break;
    case "bassLine":
      bassLineEnabled = !bassLineEnabled;
      toggleButtonColor("toggleBassLine", bassLineEnabled);
      break;
    case "bells":
      bellsEnabled = !bellsEnabled;
      toggleButtonColor("toggleBells", bellsEnabled);
      break;
    case "blockChords":
      blockChordsEnabled = !blockChordsEnabled;
      toggleButtonColor("toggleBlockChords", blockChordsEnabled);
      break;
  }
}

function toggleButtonColor(id, active) {
  const btn = document.getElementById(id);
  btn.classList.toggle("active", active);
  btn.classList.toggle("inactive", !active);
}

// --------------------------
// Sliders
// --------------------------
function updateSliders() {
  document.getElementById("tempoSlider").value = defaultTempo / 120;
  document.getElementById("tempoValue").textContent = `${defaultTempo} BPM`;

  document.getElementById("keySlider").value = 0;
  document.getElementById("keyValue").textContent = `0 semitones`;

  document.getElementById("gainSlider").value = 1;
  document.getElementById("gainValue").textContent = "1";
}

// Gain slider
document.getElementById("gainSlider").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  synth.volume.value = Tone.gainToDb(val);
  document.getElementById("gainValue").textContent = val.toFixed(2);
});

// Tempo slider
document.getElementById("tempoSlider").addEventListener("input", (e) => {
  currentTempo = parseFloat(e.target.value) * 120;
  document.getElementById("tempoValue").textContent = `${Math.round(
    currentTempo
  )} BPM`;
  // Already scheduled notes use this new tempo ratio for future notes
});

// Key shift slider
document.getElementById("keySlider").addEventListener("input", (e) => {
  keyShift = parseInt(e.target.value);
  document.getElementById("keyValue").textContent = `${keyShift} semitones`;
  // Future notes will use this key shift
});

// --------------------------
// Start / Stop Buttons
// --------------------------
document.getElementById("startBtn").addEventListener("click", async () => {
  await Tone.start();
  Tone.context.resume();
  startSelectedMIDI();
});

document.getElementById("stopBtn").addEventListener("click", () => {
  stopPlayback();
});

// Track buttons
document
  .getElementById("toggleArpeggiator")
  .addEventListener("click", () => toggleTrack("arpeggiator"));
document
  .getElementById("toggleBassLine")
  .addEventListener("click", () => toggleTrack("bassLine"));
document
  .getElementById("toggleBells")
  .addEventListener("click", () => toggleTrack("bells"));
document
  .getElementById("toggleBlockChords")
  .addEventListener("click", () => toggleTrack("blockChords"));
