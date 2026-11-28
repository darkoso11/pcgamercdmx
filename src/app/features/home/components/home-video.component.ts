import { afterNextRender, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home-video',
  standalone: true,
  template: `
    <div class="media-stage">
      <div class="media-fallback" aria-hidden="true" [class.concealed]="started && !failed"></div>
      @if (source) {
        <video #player [attr.src]="ready ? source : null" [muted]="muted" loop playsinline preload="none"
          aria-label="Video de PC Gamer CDMX" [class.concealed]="!started || failed"
          (playing)="onPlaying()" (pause)="onPause()" (volumechange)="syncVolume()" (error)="onError()"></video>
        @if (!failed) {
          <div class="media-controls" aria-label="Controles del video">
            <button type="button" (click)="togglePlayback()" [attr.aria-label]="playing ? 'Pausar video' : 'Reproducir video'">
              <span aria-hidden="true">{{ playing ? 'Ⅱ' : '▶' }}</span>
              {{ playing ? 'Pausar' : 'Reproducir' }}
            </button>
            @if (hasAudio) {
              <button type="button" (click)="toggleSound()" [attr.aria-label]="muted ? 'Activar sonido' : 'Desactivar sonido'">
                <i aria-hidden="true" [class]="muted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
                {{ muted ? 'Activar sonido' : 'Desactivar sonido' }}
              </button>
            }
          </div>
        }
        <span class="media-status" role="status">{{ message }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 0; min-height: 0; }
    .media-stage { position: relative; width: 100%; height: 100%; min-height: 240px; }
    .media-fallback, video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
    .concealed { visibility: hidden; }
    .media-controls { position: absolute; bottom: 1rem; right: 1rem; left: 1rem; display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; }
    button { min-height: 44px; padding: .6rem .9rem; color: white; background: #0f172aee; border: 1px solid #67e8f9; border-radius: 6px; font: 500 .85rem 'Orbitron', sans-serif; cursor: pointer; }
    button:hover { background: #164e63; }
    button:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
    .media-status { position: absolute; left: 1rem; right: 1rem; bottom: 4.5rem; text-align: center; color: white; background: #0f172acc; font: .85rem sans-serif; }
    .media-status:empty { display: none; }
  `],
})
export class HomeVideoComponent implements OnDestroy {
  @Input() source: string | null = null;
  @Input() hasAudio = false;
  @ViewChild('player') player?: ElementRef<HTMLVideoElement>;
  ready = false;
  muted = true;
  playing = false;
  started = false;
  failed = false;
  message = '';
  private destroyed = false;
  private motion?: MediaQueryList;
  private readonly onMotion = () => {
    if (this.motion?.matches) this.player?.nativeElement.pause();
  };

  constructor(private readonly cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.motion.addEventListener('change', this.onMotion);
      this.ready = true;
      this.cdr.detectChanges();
      const video = this.player?.nativeElement;
      if (video && this.source) {
        video.muted = true;
        if (!this.motion.matches) void this.play();
      }
    });
  }

  async play(): Promise<void> {
    const video = this.player?.nativeElement;
    if (!video || this.failed || this.destroyed) return;
    try {
      await video.play();
      if (this.destroyed) { video.pause(); return; }
      this.playing = !video.paused;
      this.muted = video.muted;
      this.message = '';
    } catch {
      if (this.destroyed) return;
      video.muted = true;
      this.muted = true;
      this.playing = false;
      if (!this.failed) this.message = 'Pulsa Reproducir para iniciar el video.';
    }
    if (!this.destroyed) this.cdr.markForCheck();
  }

  togglePlayback(): void {
    const video = this.player?.nativeElement;
    if (!video) return;
    if (video.paused) void this.play();
    else video.pause();
  }

  toggleSound(): void {
    const video = this.player?.nativeElement;
    if (!video || !this.hasAudio || this.failed) return;
    video.muted = !video.muted;
    this.muted = video.muted;
    if (video.paused) void this.play();
  }

  onPlaying(): void { this.started = true; this.playing = true; this.message = ''; }
  onPause(): void { this.playing = false; }
  syncVolume(): void { this.muted = this.player?.nativeElement.muted ?? true; }
  onError(): void {
    this.failed = true;
    this.playing = false;
    this.muted = true;
    const video = this.player?.nativeElement;
    if (video) { video.muted = true; video.pause(); }
    this.message = 'El video no está disponible en este momento.';
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (!this.ready) return;
    this.motion?.removeEventListener('change', this.onMotion);
    const video = this.player?.nativeElement;
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  }
}
