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

  private flightAudio: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;

  private initFlightAudio() {
    if (typeof window === "undefined") return;
    if (!this.flightAudio) {
      try {
        this.flightAudio = new Audio("/Flight.mp3");
        this.flightAudio.preload = "auto";
      } catch {
        // Ignorar em ambientes sem suporte
      }
    }
  }

  /**
   * Desbloqueia permissões de áudio do navegador no primeiro gesto do utilizador
   */
  public unlockAudio() {
    if (typeof window === "undefined") return;
    this.resume();
    this.initFlightAudio();

    if (this.flightAudio && !this.isUnlocked) {
      // Pequeno toque silencioso para registar a permissão de media no navegador
      const prevVol = this.flightAudio.volume;
      this.flightAudio.volume = 0;
      this.flightAudio
        .play()
        .then(() => {
          this.flightAudio?.pause();
          if (this.flightAudio) {
            this.flightAudio.currentTime = 0;
            this.flightAudio.volume = prevVol;
          }
          this.isUnlocked = true;
        })
        .catch(() => {});
    }
  }

  /**
   * Sintetizador aeronáutico de cabine (clássico chime 'Ding-Dong' de cinto de segurança e aviso de voo)
   * Garantia total de áudio através de Web Audio API mesmo se ficheiros de mídia externa forem bloqueados
   */
  public playCabinChime(volumeOverride?: number) {
    if (this.isMuted || typeof window === "undefined") return;
    const vol = volumeOverride !== undefined ? Math.max(0, Math.min(1, volumeOverride)) : this.volume;
    if (vol <= 0) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;

      // 1. Tom alto (Fá#5 / ~740 Hz) seguido de Tom baixo (Ré#5 / ~622 Hz)
      const notas = [
        { freq: 739.99, inicio: 0, duracao: 0.65 },
        { freq: 622.25, inicio: 0.22, duracao: 0.8 },
      ];

      notas.forEach(({ freq, inicio, duracao }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + inicio);

        const ganhoMaximo = 0.22 * vol;
        gain.gain.setValueAtTime(0.0001, t + inicio);
        gain.gain.exponentialRampToValueAtTime(ganhoMaximo, t + inicio + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + inicio + duracao);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + inicio);
        osc.stop(t + inicio + duracao + 0.05);
      });
    } catch {
      this.playMechanicalClick(vol);
    }
  }

  /**
   * Reproduz o som de novo voo: tenta o ficheiro /Flight.mp3 e tem fallback imediato para o chime de cabine aeronáutica
   */
  public playNewFlight(volumeOverride?: number) {
    if (this.isMuted || typeof window === "undefined") return;
    const vol = volumeOverride !== undefined ? Math.max(0, Math.min(1, volumeOverride)) : this.volume;
    if (vol <= 0) return;

    this.initFlightAudio();

    if (this.flightAudio) {
      this.flightAudio.volume = vol;
      this.flightAudio.currentTime = 0;
      this.flightAudio
        .play()
        .catch(() => {
          // Se o navegador barrar o ficheiro MP3 (política de autoplay), executa o sintetizador de cabine Web Audio
          this.playCabinChime(vol);
        });
    } else {
      this.playCabinChime(vol);
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

export function desbloquearAudioGlobal(): void {
  splitFlapAudio.unlockAudio();
}

export function tocarChimeCabine(volumeOverride?: number): void {
  splitFlapAudio.playCabinChime(volumeOverride);
}

