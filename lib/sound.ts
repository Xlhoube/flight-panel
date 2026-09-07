// Gerador de som mecânico de palhetas Solari (Split-Flap) usando Web Audio API
class SplitFlapAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastSoundTime: number = 0;

  constructor() {
    // Inicialização atrasada no primeiro clique para respeitar políticas de reprodução do browser
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Som mecânico de palheta analógica a bater
  public playMechanicalClick(intensity = 1.0) {
    if (this.isMuted || typeof window === "undefined") return;

    const now = performance.now();
    // Limite de taxa para não saturar quando muitas palhetas viram simultaneamente
    if (now - this.lastSoundTime < 25) return;
    this.lastSoundTime = now;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;

      // 1. Ruído de impacto do plástico/metal
      const bufferSize = ctx.sampleRate * 0.035; // 35ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Filtro passa-banda para dar timbre oco de plástico de palheta mecânica
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400 + Math.random() * 400, t);
      filter.Q.setValueAtTime(3.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 * intensity, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.032);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start(t);
      noiseSource.stop(t + 0.035);

      // 2. Ressonância subtil da caixa metálica
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(380 + Math.random() * 60, t);
      oscGain.gain.setValueAtTime(0.12 * intensity, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.028);
    } catch {
      // Ignorar erros de áudio silenciosamente
    }
  }
}

export const splitFlapAudio = new SplitFlapAudioEngine();
