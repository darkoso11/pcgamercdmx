import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';
import { PrivateMediaDirective } from './private-media.directive';

@Component({ standalone: true, imports: [PrivateMediaDirective], template: '<img [privateMedia]="url" [authorizedMedia]="authorized" />' })
class HostComponent {
  url = 'https://cms.test.pcgamercdmx.com/assets/one';
  authorized = true;
}

describe('PrivateMediaDirective', () => {
  it('uses authenticated blobs for admin previews and releases them on replacement and destruction', () => {
    const first = new Subject<Blob>();
    const second = new Subject<Blob>();
    const api = { isAssetUrl: () => true, readAsset: jasmine.createSpy().and.returnValues(first, second) };
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [{ provide: DirectusApiService, useValue: api }] });
    spyOn(URL, 'createObjectURL').and.returnValues('blob:first', 'blob:second');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBeNull();
    first.next(new Blob(['one']));
    expect(image.getAttribute('src')).toBe('blob:first');
    fixture.componentInstance.url = 'https://cms.test.pcgamercdmx.com/assets/two';
    fixture.detectChanges();
    expect(revoke).toHaveBeenCalledWith('blob:first');
    first.next(new Blob(['stale']));
    expect(image.getAttribute('src')).toBeNull();
    second.next(new Blob(['two']));
    fixture.destroy();
    expect(revoke).toHaveBeenCalledWith('blob:second');
  });

  it('does not request credentials for public rendering', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.authorized = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(fixture.componentInstance.url);
  });
});
