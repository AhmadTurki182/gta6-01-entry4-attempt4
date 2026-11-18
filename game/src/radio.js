// Radio: 3 procedural stations, WebAudio only, no audio files.
export const RADIO_STATIONS = [
  { id: 0, name: "CORAL FM 88.1", genre: "Sunset Pop", bpm: 112, wave: "triangle", base: 220 },
  { id: 1, name: "TIDE 101.7", genre: "Bay Bass", bpm: 96, wave: "sawtooth", base: 110 },
  { id: 2, name: "LIGHTHOUSE 95.3", genre: "Night Jazz", bpm: 76, wave: "sine", base: 164.81 },
];
export class Radio {
  constructor() { this.station = 0; this.ctx = null; this.playing = false; this.step = 0; this.timer = null; this.muted = false; }
  current() { return RADIO_STATIONS[this.station]; }
  next() { this.station = (this.station + 1) % RADIO_STATIONS.length; this.step = 0; return this.current(); }
  ensure() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
  }
  start() {
    this.ensure(); if (!this.ctx || this.playing) return;
    this.playing = true;
    const tick = () => {
      if (!this.playing || this.muted || !this.ctx) return;
      if (this.ctx.state !== "running") { this.timer = setTimeout(tick, 500); return; }
      const st = this.current();
      const scale = [0, 3, 5, 7, 10, 12];
      const note = scale[this.step % scale.length];
      const freq = st.base * Math.pow(2, note / 12);
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = st.wave; o.frequency.value = freq;
      g.gain.setValueAtTime(0.05, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + 0.3);
      this.step++;
      this.timer = setTimeout(tick, 60000 / st.bpm / 2);
    };
    tick();
  }
  stop() { this.playing = false; if (this.timer) clearTimeout(this.timer); }
}
