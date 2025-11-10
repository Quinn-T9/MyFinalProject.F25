const ctx = new AudioContext();

const osc = new OscillatorNode(ctx, { frequency: 100 });
osc.connect(ctx.destination);
osc.start();
document.querySelector("button").onclick = () => ctx.resume;

//idea: define each of the 12 midi notes by note name
//then write out one part in midi notes with an identifying number
//this sequence will be placed into an ARRAY for easy storage, access, and repeatability

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
