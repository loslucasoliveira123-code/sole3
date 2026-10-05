export function encodeWav(chunks: readonly Float32Array[], sampleRate: number): Blob {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new ArrayBuffer(44 + length * 2);
  const view = new DataView(bytes);
  const tag = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };

  tag(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  tag(36, "data");
  view.setUint32(40, length * 2, true);

  let offset = 44;
  for (const chunk of chunks) {
    for (const value of chunk) {
      const sample = Math.max(-1, Math.min(1, value));
      view.setInt16(offset, sample * (sample < 0 ? 32768 : 32767), true);
      offset += 2;
    }
  }

  return new Blob([bytes], { type: "audio/wav" });
}

type RecordWavOptions = {
  onSpeechEnd?: () => void;
  silenceMs?: number;
  maxDurationMs?: number;
  noSpeechTimeoutMs?: number;
};

export async function recordWav(options: RecordWavOptions = {}): Promise<{ stop: () => Promise<File> }> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  let context: AudioContext | undefined;

  try {
    context = new AudioContext();
    await context.resume();
    const audioContext = context;
    const source = audioContext.createMediaStreamSource(stream);
    const node = audioContext.createScriptProcessor(4096, 1, 1);
    const chunks: Float32Array[] = [];
    const silenceMs = options.silenceMs ?? 1600;
    const maxDurationMs = options.maxDurationMs ?? 30_000;
    const noSpeechTimeoutMs = options.noSpeechTimeoutMs ?? 10_000;
    const startedAt = performance.now();
    let heardSpeech = false;
    let lastSpeechAt = startedAt;
    let noiseFloor = 0.002;
    let calibrationFrames = 0;
    let endNotified = false;
    const notifyEnd = () => {
      if (endNotified) return;
      endNotified = true;
      options.onSpeechEnd?.();
    };
    node.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(input));
      let energy = 0;
      let peak = 0;
      for (const sample of input) {
        energy += sample * sample;
        peak = Math.max(peak, Math.abs(sample));
      }
      const rms = Math.sqrt(energy / input.length);
      const now = performance.now();
      if (!heardSpeech && now - startedAt < 500) {
        noiseFloor = (noiseFloor * calibrationFrames + rms) / (calibrationFrames + 1);
        calibrationFrames += 1;
      }
      const speechThreshold = Math.max(0.004, noiseFloor * 2.5);
      if (rms >= speechThreshold || peak >= Math.max(0.015, speechThreshold * 2)) {
        heardSpeech = true;
        lastSpeechAt = now;
      }
      if (
        (heardSpeech && now - lastSpeechAt >= silenceMs) ||
        (!heardSpeech && now - startedAt >= noSpeechTimeoutMs) ||
        now - startedAt >= maxDurationMs
      ) notifyEnd();
    };
    source.connect(node);
    node.connect(audioContext.destination);
    let stopped = false;

    return {
      async stop() {
        if (stopped) throw new Error("A gravação já foi encerrada");
        stopped = true;
        stream.getTracks().forEach((track) => track.stop());
        node.disconnect();
        source.disconnect();
        node.onaudioprocess = null;
        const blob = encodeWav(chunks, audioContext.sampleRate);
        await audioContext.close();
        if (blob.size < 2048) throw new Error("A gravação ficou vazia. Tente novamente.");
        return new File([blob], "comando-sole.wav", { type: "audio/wav" });
      },
    };
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    await context?.close();
    throw error;
  }
}