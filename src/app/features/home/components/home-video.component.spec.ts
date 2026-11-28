import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeVideoComponent } from './home-video.component';

describe('HomeVideoComponent', () => {
  let fixture: ComponentFixture<HomeVideoComponent>;
  let component: HomeVideoComponent;
  let play: jasmine.Spy;
  let pause: jasmine.Spy;
  let reduced: boolean;
  let removeListener: jasmine.Spy;

  beforeEach(async () => {
    reduced = false;
    removeListener = jasmine.createSpy();
    spyOn(window, 'matchMedia').and.callFake(() => ({
      matches: reduced, addEventListener: jasmine.createSpy(), removeEventListener: removeListener,
    } as unknown as MediaQueryList));
    play = spyOn(HTMLMediaElement.prototype, 'play').and.returnValue(Promise.resolve());
    pause = spyOn(HTMLMediaElement.prototype, 'pause');
    spyOn(HTMLMediaElement.prototype, 'load');
    await TestBed.configureTestingModule({ imports: [HomeVideoComponent] }).compileComponents();
    fixture = TestBed.createComponent(HomeVideoComponent);
    component = fixture.componentInstance;
  });

  function renderMedia() {
    fixture.componentRef.setInput('source', 'assets/video/home-pc-gamer-cdmx.mp4');
    fixture.componentRef.setInput('hasAudio', true);
    fixture.detectChanges();
    return component.player!.nativeElement;
  }

  it('does not render fake playback or audio controls without media', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('video')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(play).not.toHaveBeenCalled();
  });

  it('uses a resource-free fallback instead of loading a cabinet image', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.media-fallback')).not.toBeNull();
  });

  it('requests autoplay only after setting mute and keeps inline looping playback', () => {
    play.and.callFake(function (this: HTMLVideoElement) {
      expect(this.muted).toBeTrue();
      return Promise.resolve();
    });
    const video = renderMedia();
    expect(play).toHaveBeenCalled();
    expect(video.loop).toBeTrue();
    expect(video.playsInline).toBeTrue();
    expect(video.controls).toBeFalse();
  });

  it('keeps reduced motion static until the visitor requests playback', () => {
    reduced = true;
    renderMedia();
    expect(play).not.toHaveBeenCalled();
    component.togglePlayback();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('recovers from blocked autoplay without claiming playback or sound', async () => {
    play.and.returnValue(Promise.reject(new DOMException('Blocked', 'NotAllowedError')));
    const video = renderMedia();
    await fixture.whenStable();
    expect(component.playing).toBeFalse();
    expect(component.started).toBeFalse();
    expect(component.message).toContain('Reproducir');
    component.toggleSound();
    await fixture.whenStable();
    expect(component.muted).toBeTrue();
    expect(video.muted).toBeTrue();
  });

  it('toggles sound inside the user action and synchronizes native volume changes', () => {
    const video = renderMedia();
    component.toggleSound();
    expect(video.muted).toBeFalse();
    component.toggleSound();
    expect(video.muted).toBeTrue();
    video.muted = false;
    component.syncVolume();
    expect(component.muted).toBeFalse();
  });

  it('shows the fallback and removes controls after a loading error', () => {
    renderMedia();
    component.onPlaying();
    component.onError();
    fixture.detectChanges();
    expect(component.playing).toBeFalse();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.media-fallback').classList.contains('concealed')).toBeFalse();
  });

  it('does not access media APIs during server destruction before browser initialization', () => {
    component.player = { nativeElement: {} as HTMLVideoElement };
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('stops and unloads media and removes preference listeners on destruction', () => {
    const video = renderMedia();
    fixture.destroy();
    expect(pause).toHaveBeenCalled();
    expect(video.hasAttribute('src')).toBeFalse();
    expect(removeListener).toHaveBeenCalled();
  });
});
