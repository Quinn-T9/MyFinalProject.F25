const ctx = new AudioContext();

const osc = new OscillatorNode(ctx, { frequency: 100 });
osc.connect(ctx.destination);
osc.start();
document.querySelector("button").onclick = () => ctx.resume;

//idea: define each of the 12 midi notes by note name
//then write out one part in midi notes with an identifying number
//this sequence will be placed into an ARRAY for easy storage, access, and repeatability

//------------START TOGGLE EXPERIMENTS---------------
let toggleRow = document.querySelector("#toggleRow");

for (let i = 0; i < 16; i++) {
  toggleRow.innerHTML += `<input class="rowOne" type="checkbox" />`;
  console.log(i);
}

let togs = document.querySelectorAll(".rowOne");
console.log(togs);

let counter = 0;
setInterval(() => {
  counter = counter % 16;
  if (togs[counter].checked) {
    console.log(Math.random());
  }
  counter++;
}, 250);
//----------------END TOGGLE EXPERIMENTS--------------
//----------------START MIDI DECODER------------------
const midi = await Midi.fromUrl(
  "/Users/quinnterry/Documents/CPM/MyFinalProject.F25/Break the Mold Bells.mid"
);
//the file name decoded from the first track
const name = midi.name;
//get the tracks
midi.tracks.forEach((track) => {
  //tracks have notes and controlChanges

  //notes are an array
  const notes = track.notes;
  notes.forEach((note) => {
    console.log[(note.midi, note.time, note.duration, note.name)];
  });

  //the control changes are an object
  //the keys are the CC number
  track.controlChanges[64];
  //they are also aliased to the CC number's common name (if it has one)
  track.controlChanges.sustain.forEach((cc) => {
    // cc.ticks, cc.value, cc.time
  });

  //the track also has a channel and instrument
  //track.instrument.name
});

// write the output
fs.writeFileSync("output.mid", new Buffer(midi.toArray()));
//----------------END MIDI DECODER------------------

//UNDERLYING ARPEGGIATOR: easiest to demonstrate here because there are no differing note durations, every note is the same length

//D #C A D | #C A D #C | A D #C A | D #C A E (first 16 notes, all sixteenths in duration)
//#C A E #C | A E #C A | E #C A E | #C A E #C
//A E #C A | E #C A E | #C A #F #C | A #F #C A
//E #C #G E | #C #G E B | #G E B #G | E B #G E

//BLOCK CHORDS: all four notes played at the same time, switches every measure
//D #F A D | #C E A #C | B E #G B | -OFF-

//BELL PART: all on upbeats
//x E x D | x #C x B | x D x #C | x B x A
//x B x A | x #G x #F | x #G x A | x B x #C
//x E x D | x #C x B | x D x #C | x B x A
//x B x #F | x #F x #G | x #G x #G | x #G x A

//BASS: notes listed with length in quarter notes following
//(D, 2)(D, 0.75)(D, 0.75)(A, 2.5)(A, 0.75)(A, 0.75)(A, 0.5)
//(E, 1)(E, 1)(E, 0.5)(E, 1)(E, 1)(E, 0.5)(E, 0.5)(E, 0.5)(#G, 0.5)(B, 0.5)(E, 0.5)(E, 0.5)
