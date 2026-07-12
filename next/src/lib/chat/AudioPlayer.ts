const AudioSampleRate = 24000;

export default class AudioPlayer {
  private context: AudioContext | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime: number = 0;

  ensureRunning(): void {
    if (!this.context) {
      this.context = new AudioContext({sampleRate: AudioSampleRate});
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playPcm16Chunk(base64Data: string): void {
    this.ensureRunning();
    const context = this.context!;

    const bytes = Uint8Array.fromBase64(base64Data);
    const samples = new Int16Array(bytes.buffer);
    const buffer = context.createBuffer(1, samples.length, AudioSampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      channelData[i] = samples[i] / 32768;
    }

    this.schedule(buffer);
  }

  async playWav(base64Data: string): Promise<void> {
    this.ensureRunning();
    const context = this.context!;

    const bytes = Uint8Array.fromBase64(base64Data);
    const buffer = await context.decodeAudioData(bytes.buffer);

    this.schedule(buffer);
  }

  stop(): void {
    for (const source of this.activeSources) {
      source.onended = null;
      source.stop();
    }
    this.activeSources.clear();
    this.nextStartTime = 0;
  }

  private schedule(buffer: AudioBuffer): void {
    const context = this.context!;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.onended = () => this.activeSources.delete(source);
    this.activeSources.add(source);

    this.nextStartTime = Math.max(this.nextStartTime, context.currentTime);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }
}
