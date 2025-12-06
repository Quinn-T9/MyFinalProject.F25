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
const synth = new Tone.PolySynth().toDestination();
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

// Active scheduled events and voices
let scheduledEvents = [];
let activeVoices = [];

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
// Playback Logic
// --------------------------
function startSelectedMIDI() {
  if (arpeggiatorEnabled && arpeggiatorMidi) playMIDI(arpeggiatorMidi);
  if (bassLineEnabled && bassLineMidi) playMIDI(bassLineMidi);
  if (bellsEnabled && bellsMidi) playMIDI(bellsMidi);
  if (blockChordsEnabled && blockChordsMidi) playMIDI(blockChordsMidi);
}

function playMIDI(midi) {
  const now = Tone.now();
  const tempoRatio = defaultTempo / currentTempo;

  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      // Apply key shift
      const shiftedMidi = note.midi + keyShift;
      const shiftedName = Tone.Frequency(shiftedMidi, "midi").toNote();

      // Scale time and duration
      const time = now + note.time * tempoRatio;
      const duration = note.duration * tempoRatio;

      // Trigger the note with attack + release
      const voice = synth.triggerAttackRelease(shiftedName, duration, time);

      // Track this voice so stopPlayback can cancel it
      activeVoices.push(voice);

      // Keep a scheduled event reference so we can clear it on Stop
      const eventId = Tone.Transport.scheduleOnce(() => {},
      note.time * tempoRatio);
      scheduledEvents.push(eventId);
    });
  });
}

// --------------------------
// Stop Playback
// --------------------------
function stopPlayback() {
  // Cancel all scheduled events
  scheduledEvents.forEach((id) => Tone.Transport.clear(id));
  scheduledEvents = [];

  // Stop all currently playing notes
  activeVoices.forEach((voice) => {
    try {
      synth.triggerRelease(voice);
    } catch {}
  });
  activeVoices = [];

  // Also hard-stop synth envelopes as safety
  synth.releaseAll();
}

// --------------------------
// UI Button Toggles
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
// UI Sliders
// --------------------------
function updateSliders() {
  document.getElementById("tempoSlider").value = defaultTempo / 120;
  document.getElementById("tempoValue").textContent = `${defaultTempo} BPM`;

  document.getElementById("keySlider").value = 0;
  document.getElementById("keyValue").textContent = `0 semitones`;

  document.getElementById("gainSlider").value = 1;
  document.getElementById("gainValue").textContent = "1";
}

// Gain
document.getElementById("gainSlider").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  synth.volume.value = Tone.gainToDb(val);
  document.getElementById("gainValue").textContent = val.toFixed(2);
});

// Tempo
document.getElementById("tempoSlider").addEventListener("input", (e) => {
  currentTempo = parseFloat(e.target.value) * 120;
  document.getElementById("tempoValue").textContent = `${Math.round(
    currentTempo
  )} BPM`;
});

// Key Shift
document.getElementById("keySlider").addEventListener("input", (e) => {
  keyShift = parseInt(e.target.value);
  document.getElementById("keyValue").textContent = `${keyShift} semitones`;
});

// --------------------------
// Start & Stop Buttons
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
