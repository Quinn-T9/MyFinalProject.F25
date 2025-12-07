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
let trackEnabled = {
  arpeggiator: false,
  bassLine: false,
  bells: false,
  blockChords: false,
};

// Tempo and Key
let defaultTempo = 111; // baseline for slider normalization
let currentTempo = defaultTempo; // active playback tempo
let keyShift = 0;

// MIDI storage
let midiData = {};
// Tone.Part storage
let trackParts = {};

// --------------------------
// Load MIDI Files
// --------------------------
async function loadAllMIDIs() {
  midiData.arpeggiator = await loadMIDI(midiFiles.arpeggiator);
  midiData.bassLine = await loadMIDI(midiFiles.bassLine);
  midiData.bells = await loadMIDI(midiFiles.bells);
  midiData.blockChords = await loadMIDI(midiFiles.blockChords);

  if (midiData.arpeggiator?.header?.tempos?.length > 0) {
    defaultTempo = midiData.arpeggiator.header.tempos[0].bpm || 111;
  }

  updateSliders();
}

async function loadMIDI(file) {
  try {
    return await Midi.fromUrl(file);
  } catch (error) {
    console.error("Error loading MIDI:", error);
    return null;
  }
}

// --------------------------
// Create Tone.Part for a MIDI track
// --------------------------
function createPart(trackName) {
  const midi = midiData[trackName];
  if (!midi) return null;

  const events = [];
  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      // Scale time and duration by currentTempo
      const tempoRatio = defaultTempo / currentTempo;
      events.push({
        time: note.time * tempoRatio,
        note: note.name,
        duration: note.duration * tempoRatio,
      });
    });
  });

  const part = new Tone.Part((time, value) => {
    // Apply key shift
    const shiftedMidi = Tone.Frequency(value.note).toMidi() + keyShift;
    const shiftedNote = Tone.Frequency(shiftedMidi, "midi").toNote();

    synth.triggerAttackRelease(shiftedNote, value.duration, time);
  }, events);

  part.loop = false;
  return part;
}

// --------------------------
// Start Selected Tracks
// --------------------------
function startSelectedMIDI() {
  stopPlayback(); // clear previous playback

  // Update currentTempo from slider
  const sliderValue = parseFloat(document.getElementById("tempoSlider").value);
  currentTempo = defaultTempo * sliderValue;
  Tone.Transport.bpm.value = currentTempo;

  // Create and start only enabled tracks
  Object.keys(trackEnabled).forEach((trackName) => {
    if (trackEnabled[trackName] && midiData[trackName]) {
      trackParts[trackName] = createPart(trackName);
      trackParts[trackName].start(0);
    }
  });

  Tone.Transport.start();
}

// --------------------------
// Stop Playback
// --------------------------
function stopPlayback() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Object.values(trackParts).forEach((part) => part.stop());
  synth.releaseAll();
  trackParts = {}; // clear parts
  // Do NOT reset tempo — slider remains at last BPM
}

// --------------------------
// Toggle Track
// --------------------------
function toggleTrack(trackName) {
  trackEnabled[trackName] = !trackEnabled[trackName];
  toggleButtonColor(`toggle${capitalize(trackName)}`, trackEnabled[trackName]);
}

function toggleButtonColor(id, active) {
  const btn = document.getElementById(id);
  btn.classList.toggle("active", active);
  btn.classList.toggle("inactive", !active);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --------------------------
// Sliders
// --------------------------
function updateSliders() {
  // Tempo slider normalized (default = 1)
  document.getElementById("tempoSlider").value = currentTempo / defaultTempo;
  document.getElementById("tempoValue").textContent = `${Math.round(
    currentTempo
  )} BPM`;

  document.getElementById("keySlider").value = keyShift;
  document.getElementById("keyValue").textContent = `${keyShift} semitones`;

  document.getElementById("gainSlider").value = 1;
  document.getElementById("gainValue").textContent = "1";
}

// Gain slider
document.getElementById("gainSlider").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  synth.volume.value = Tone.gainToDb(val);
  document.getElementById("gainValue").textContent = val.toFixed(2);
});

// Tempo slider — live, always dictates currentTempo
document.getElementById("tempoSlider").addEventListener("input", (e) => {
  const sliderValue = parseFloat(e.target.value);
  currentTempo = defaultTempo * sliderValue;
  Tone.Transport.bpm.rampTo(currentTempo, 0.1); // smooth tempo transition
  document.getElementById("tempoValue").textContent = `${Math.round(
    currentTempo
  )} BPM`;
});

// Key shift — affects future notes
document.getElementById("keySlider").addEventListener("input", (e) => {
  keyShift = parseInt(e.target.value);
  document.getElementById("keyValue").textContent = `${keyShift} semitones`;
});

// --------------------------
// Buttons
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

// --------------------------
// Load all MIDI files
// --------------------------
loadAllMIDIs();

//Generated with help from ChatGPT (November and December of 2025)
