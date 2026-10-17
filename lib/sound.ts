// ─── Motor de Áudio Unificado: Palhetas Solari (Split-Flap) e Cabine Aeronáutica ───

class SplitFlapAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8; // 0.0 a 1.0
  private lastSoundTime: number = 0;

  constructor() {
    // Inicialização atrasada no primeiro gesto para respeitar políticas de reprodução do browser
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
      this.ctx.resume().catch(() => {});
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

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Som percussivo analógico de palheta Solari (impacto plástico/metálico com amortecimento rápido)
   */
  public playMechanicalClick(volumeOverride?: number) {
    if (this.isMuted || typeof window === "undefined") return;

    const vol = volumeOverride !== undefined ? Math.max(0, Math.min(1, volumeOverride)) : this.volume;
    if (vol <= 0) return;

    const now = performance.now();
    // Limite de taxa de 20ms para evitar sobreposição excessiva de buffers em palavras longas
    if (now - this.lastSoundTime < 20) return;
    this.lastSoundTime = now;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;

      // 1. Ruído de impacto do plástico mecânico
      const bufferSize = ctx.sampleRate * 0.03; // 30ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filtro passa-banda para dar o timbre oco característico de painel de aeroporto
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1250 + Math.random() * 200, t);
      filter.Q.setValueAtTime(3.2, t);

      const gain = ctx.createGain();
      const gainMax = 0.18 * vol;
      gain.gain.setValueAtTime(gainMax, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);

      // 2. Ressonância subtil da carcaça metálica do display
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360 + Math.random() * 60, t);
      oscGain.gain.setValueAtTime(0.08 * vol, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.026);
    } catch {
      // Ignorar erros de áudio silenciosamente
    }
  }

  /**
   * Dispara uma rajada percussiva de 4 cliques rápidos simulando um tambor de palhetas a girar
   */
  public playBurst(volumeOverride?: number, count = 4, intervalMs = 45) {
    if (this.isMuted || typeof window === "undefined") return;
    const vol = volumeOverride !== undefined ? volumeOverride : this.volume;
    if (vol <= 0) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playMechanicalClick(vol * 0.85);
      }, i * intervalMs);
    }
  }

  /**
   * Reproduz o jingle oficial de aviso de cabine (/Flight.mp3) com fallback mecânico
   */
  public playNewFlight(volumeOverride?: number) {
    if (this.isMuted || typeof window === "undefined") return;
    const vol = volumeOverride !== undefined ? Math.max(0, Math.min(1, volumeOverride)) : this.volume;
    if (vol <= 0) return;

    try {
      const audio = new Audio("/Flight.mp3");
      audio.volume = vol;
      audio.play().catch(() => {
        // Fallback para o sintetizador mecânico se o browser bloquear autoplay
        this.playMechanicalClick(vol);
      });
    } catch {
      this.playMechanicalClick(vol);
    }
  }

  public resume(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }
}

// Instância Singleton
export const splitFlapAudio = new SplitFlapAudioEngine();

// Funções utilitárias diretas
export function tocarSomFlapClack(volumeOverride?: number) {
  splitFlapAudio.playMechanicalClick(volumeOverride);
}

export function tocarRajadaFlaps(volumeOverride?: number) {
  splitFlapAudio.playBurst(volumeOverride);
}

export function tocarSomNovoVoo(volumeOverride?: number) {
  splitFlapAudio.playNewFlight(volumeOverride);
}

export function definirVolumeGlobal(vol: number) {
  splitFlapAudio.setVolume(vol);
}

export function obterVolumeGlobal(): number {
  return splitFlapAudio.getVolume();
}

export function definirSomHabilitado(ativo: boolean) {
  splitFlapAudio.setMuted(!ativo);
}

export function obterSomHabilitado(): boolean {
  return !splitFlapAudio.getIsMuted();
}

export function inicializarAudioContext(): void {
  splitFlapAudio.resume();
}
