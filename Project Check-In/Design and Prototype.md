+------------------------------------------------------------+
| Client (Frontend) |
|------------------------------------------------------------|
| HTML5 UI |
| - Play / Pause Button |
| - Key Signature Control (Dropdown / Slider) |
| - Gain Control (Volume Slider) |
| - Tempo Control (Slider) |
| |
| Web Audio Module |
| - AudioContext |
| - AudioBufferSourceNode |
| - GainNode (for volume control) |
| - PlaybackRate (for tempo control) |
| - Pitch Shift (for key control) |
| |
| Fetch API → Communicates with Backend for song data |
+------------------------------------------------------------+

+------------------------------------------------------------+
| Database |
|------------------------------------------------------------|
| Tables: |
| - users |
| - songs |
| - playback_settings |
+------------------------------------------------------------+
Generated with help from ChatGPT (Nov 3 2025)

INDEX ROUGH IDEA

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Web Audio Song Player</title>
  <style>
    body { font-family: sans-serif; text-align: center; margin-top: 50px; }
    .control { margin: 10px; }
  </style>
</head>
<body>
  <h1>🎵 Simple Web Audio Player</h1>

<button id="playBtn">Play</button>

  <div class="control">
    <label>Gain:</label>
    <input type="range" id="gainSlider" min="0" max="2" value="1" step="0.01">
  </div>
  <div class="control">
    <label>Tempo:</label>
    <input type="range" id="tempoSlider" min="0.5" max="2" value="1" step="0.01">
  </div>
  <div class="control">
    <label>Key Shift (semitones):</label>
    <input type="range" id="keySlider" min="-12" max="12" value="0" step="1">
  </div>

  <script>
    let audioCtx, source, gainNode;
    let isPlaying = false;
    let buffer, playbackRate = 1.0, gainValue = 1.0, keyShift = 0;

    async function loadAudio(url) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioCtx.decodeAudioData(arrayBuffer);
    }

    async function startPlayback() {
      if (!audioCtx) audioCtx = new AudioContext();
      if (!buffer) buffer = await loadAudio('song.mp3'); // your audio file

      source = audioCtx.createBufferSource();
      gainNode = audioCtx.createGain();

      // Basic pitch and tempo adjustment
      source.playbackRate.value = playbackRate * Math.pow(2, keyShift / 12);
      gainNode.gain.value = gainValue;

      source.buffer = buffer;
      source.connect(gainNode).connect(audioCtx.destination);
      source.start(0);
      isPlaying = true;
    }

    document.getElementById('playBtn').addEventListener('click', () => {
      if (!isPlaying) startPlayback();
    });

    document.getElementById('gainSlider').addEventListener('input', e => {
      gainValue = parseFloat(e.target.value);
      if (gainNode) gainNode.gain.value = gainValue;
    });

    document.getElementById('tempoSlider').addEventListener('input', e => {
      playbackRate = parseFloat(e.target.value);
      if (source) source.playbackRate.value = playbackRate * Math.pow(2, keyShift / 12);
    });

    document.getElementById('keySlider').addEventListener('input', e => {
      keyShift = parseInt(e.target.value);
      if (source) source.playbackRate.value = playbackRate * Math.pow(2, keyShift / 12);
    });
  </script>
</body>
</html>

NOTE: this doesn't have the customization themes I made from the week 10 lab as a stylistic guide.
