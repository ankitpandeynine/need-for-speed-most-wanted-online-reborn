// AudioRing's first 16 uint32 words are atomics; stereo float PCM follows.
// Only the host producer writes PCM, publishing complete blocks with Write.
// This consumer never repeats an old ring lap if the producer stops.
class RecompPCM extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const {memory, address} = options.processorOptions;
    this.control = new Uint32Array(memory, address, 16);
    this.pcm = new Float32Array(memory, address + 64, Atomics.load(this.control, 8) * 2);
    this.mask = Atomics.load(this.control, 8) - 1;
    this.capture = null;
    this.port.onmessage = event => {
      if (event.data?.type === "capture") {
        const frames = Math.min(sampleRate * 15, Math.max(0, event.data.frames | 0));
        this.capture = {data:new Float32Array(frames * 2), frames, written:0};
      }
    };
  }
  process(_, outputs) {
    const out = outputs[0], c = this.control;
    if (!out?.length) return true;
    const frames = out[0].length;
    for (const channel of out) channel.fill(0);
    if (!Atomics.load(c, 2)) return true;
    const read = Atomics.load(c, 0), write = Atomics.load(c, 1);
    const available = (write - read) >>> 0;
    if (!Atomics.load(c, 3)) {
      if (available < 1024) return true;
      Atomics.store(c, 3, 1);
    }
    const take = Math.min(available, frames);
    let nonzero = false;
    for (let i = 0; i < take; i++) {
      const at = ((read + i) & this.mask) * 2;
      out[0][i] = this.pcm[at];
      if (out[1]) out[1][i] = this.pcm[at + 1];
      nonzero ||= this.pcm[at] !== 0 || this.pcm[at + 1] !== 0;
    }
    Atomics.store(c, 0, (read + take) >>> 0);
    Atomics.add(c, 5, 1);
    if (take < frames) Atomics.add(c, 4, 1);
    if (!nonzero) Atomics.add(c, 9, 1);
    if (this.capture) {
      const capture = this.capture;
      const count = Math.min(frames, capture.frames - capture.written);
      for (let i = 0; i < count; i++) {
        capture.data[(capture.written + i) * 2] = out[0][i];
        capture.data[(capture.written + i) * 2 + 1] = out[1]?.[i] || 0;
      }
      capture.written += count;
      if (capture.written >= capture.frames) {
        this.port.postMessage({type:"capture", rate:sampleRate, pcm:capture.data}, [capture.data.buffer]);
        this.capture = null;
      }
    }
    return true;
  }
}
registerProcessor("recomp-pcm", RecompPCM);
