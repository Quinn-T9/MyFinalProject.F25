// MIDI files paths (to be replaced with actual paths)
const midiFiles = {
  arpeggiator: "assets/BtM Arp.mid",
  bassLine: "assets/BtM Bass.mid",
  bells: "assets/Break the Mold Bells.mid",
  blockChords: "assets/BtM Choir.mid",
};

// Initialize Tone.js components
const synth = new Tone.PolySynth().toDestination();
const reverb = new Tone.Reverb().toDestination();
synth.connect(reverb);

// State variables for each MIDI track
let arpeggiatorEnabled = false;
let bassLineEnabled = false;
let bellsEnabled = false;
let blockChordsEnabled = false;

// Default tempo and key signature (based on MIDI)
let defaultTempo = 111; // Default tempo from the MIDI files
let defaultKeySignature = 0; // Default key signature (A Major)

// Load MIDI files asynchronously
async function loadMIDI(file) {
  try {
    // Use Tone.Midi to parse the arrayBuffer (this is the updated approach)
    const midi = await new Midi.fromUrl(file);
    return midi; // Return the parsed MIDI data
  } catch (error) {
    console.error("Error loading MIDI file:", error);
    return null; // Return null in case of failure
  }
}

// MIDI file containers
let arpeggiatorMidi, bassLineMidi, bellsMidi, blockChordsMidi;

// Load MIDI files into memory
Promise.all([
  loadMIDI(midiFiles.arpeggiator).then((midi) => (arpeggiatorMidi = midi)),
  loadMIDI(midiFiles.bassLine).then((midi) => (bassLineMidi = midi)),
  loadMIDI(midiFiles.bells).then((midi) => (bellsMidi = midi)),
  loadMIDI(midiFiles.blockChords).then((midi) => (blockChordsMidi = midi)),
]).then(() => {
  // Set default tempo and key signature based on the first MIDI file (arpeggiator)
  if (arpeggiatorMidi) {
    defaultTempo = arpeggiatorMidi.header.tempos[0].bpm || 111; // Default to 111 if not available
    defaultKeySignature = 0; // A Major (no key shift)
    updateSliders();
  }
});

// Function to start playback of selected MIDI tracks
function startSelectedMIDI() {
  if (arpeggiatorEnabled && arpeggiatorMidi) {
    playMIDI(arpeggiatorMidi);
  }
  if (bassLineEnabled && bassLineMidi) {
    playMIDI(bassLineMidi);
  }
  if (bellsEnabled && bellsMidi) {
    playMIDI(bellsMidi);
  }
  if (blockChordsEnabled && blockChordsMidi) {
    playMIDI(blockChordsMidi);
  }
}

// Play MIDI notes using Tone.js PolySynth
function playMIDI(midi) {
  const now = Tone.now();
  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      synth.triggerAttackRelease(note.name, note.duration, now + note.time);
    });
  });
}

// Toggle function for each MIDI track
function toggleTrack(trackName) {
  switch (trackName) {
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

// Change button color based on active/inactive state
function toggleButtonColor(buttonId, isActive) {
  const button = document.getElementById(buttonId);
  if (isActive) {
    button.classList.add("active");
    button.classList.remove("inactive");
  } else {
    button.classList.add("inactive");
    button.classList.remove("active");
  }
}

// Update the slider and displayed value
function updateSliders() {
  document.getElementById("tempoSlider").value = defaultTempo / 120; // Set tempo slider (normalized)
  document.getElementById("keySlider").value = defaultKeySignature; // Set key signature slider (A Major)
  document.getElementById("gainSlider").value = 1; // Set the default gain to 1

  // Display initial values
  document.getElementById("tempoValue").textContent = `${defaultTempo} BPM`;
  document.getElementById(
    "keyValue"
  ).textContent = `${defaultKeySignature} semitones (A Major)`;
}

// Event listener for the "Start Selections" button
document.getElementById("startBtn").addEventListener("click", () => {
  Tone.start(); // Ensure that Tone.js context is started after user gesture
  Tone.context.resume(); // Explicitly resume the AudioContext

  startSelectedMIDI();
});

// Event listeners for MIDI track toggle buttons
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

// Slider controls with updated value display
document.getElementById("gainSlider").addEventListener("input", (e) => {
  const gainValue = parseFloat(e.target.value);
  document.getElementById("gainValue").textContent = gainValue.toFixed(2);
  synth.volume.value = Tone.gainToDb(gainValue);
});

document.getElementById("tempoSlider").addEventListener("input", (e) => {
  const tempoValue = parseFloat(e.target.value) * 120; // Convert back to actual BPM
  document.getElementById("tempoValue").textContent = `${Math.round(
    tempoValue
  )} BPM`;
  Tone.Transport.bpm.value = tempoValue; // Set the tempo value in Tone.js
});

document.getElementById("keySlider").addEventListener("input", (e) => {
  const keyShiftValue = parseInt(e.target.value);
  document.getElementById(
    "keyValue"
  ).textContent = `${keyShiftValue} semitones (A Major)`;
  synth.set({ pitchShift: keyShiftValue });
});
