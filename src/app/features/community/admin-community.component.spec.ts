import { ChangeDetectorRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';
import { AdminCommunityComponent } from './admin-community.component';
import { CommunityService } from './community.service';

describe('AdminCommunityComponent photos', () => {
  let component: AdminCommunityComponent;
  let api: jasmine.SpyObj<DirectusApiService>;
  let community: jasmine.SpyObj<CommunityService>;
  function select(file: File): void {
    component.selectPhoto({ target: { files: [file], value: 'photo' } } as unknown as Event);
  }
  beforeEach(() => {
    api = jasmine.createSpyObj('DirectusApiService', ['uploadFile', 'assetUrl']);
    community = jasmine.createSpyObj('CommunityService', ['saveCollaborator']);
    community.saveCollaborator.and.callFake(profile => of(profile));
    api.assetUrl.and.returnValue('https://cms.example/assets/photo');
    component = new AdminCommunityComponent(community, { detectChanges() {} } as ChangeDetectorRef, api);
    component.editor.name = 'Influencer';
    spyOn(URL, 'createObjectURL').and.returnValue('blob:preview');
    spyOn(URL, 'revokeObjectURL');
  });
  afterEach(() => component.ngOnDestroy());
  it('previews a photo, uploads with authentication and saves the permanent URL only after upload', () => {
    const upload = new Subject<any>();
    api.uploadFile.and.returnValue(upload);
    const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    select(file);
    expect(component.photoPreview).toBe('blob:preview');
    component.saveProfile();
    component.saveProfile();
    expect(api.uploadFile).toHaveBeenCalledOnceWith(file, file.name, { auth: true });
    expect(community.saveCollaborator).not.toHaveBeenCalled();
    upload.next({ data: { id: 'photo' } });
    upload.complete();
    expect(community.saveCollaborator).toHaveBeenCalledWith(jasmine.objectContaining({ image: 'https://cms.example/assets/photo' }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    expect(component.saving).toBeFalse();
  });
  it('rejects unsupported and oversized files without replacing the existing image', () => {
    component.editor.image = 'original.jpg';
    for (const file of [new File(['x'], 'bad.txt', { type: 'text/plain' }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' })]) {
      select(file);
      expect(component.photoError).toBeTruthy();
      expect(component.selectedPhoto).toBeNull();
      expect(component.editor.image).toBe('original.jpg');
    }
  });
  it('preserves the draft and selected photo when upload fails so it can be retried', () => {
    const upload = new Subject<any>();
    api.uploadFile.and.returnValue(upload);
    select(new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
    component.saveProfile();
    upload.error(new Error('offline'));
    expect(component.photoError).toBeTruthy();
    expect(component.editor.name).toBe('Influencer');
    expect(component.selectedPhoto).not.toBeNull();
    expect(component.saving).toBeFalse();
    expect(community.saveCollaborator).not.toHaveBeenCalled();
  });
  it('keeps URL-only saving and clears temporary photos when changing profiles', () => {
    component.editor.image = 'original.jpg';
    component.saveProfile();
    expect(api.uploadFile).not.toHaveBeenCalled();
    expect(community.saveCollaborator).toHaveBeenCalledWith(jasmine.objectContaining({ image: 'original.jpg' }));
    select(new File(['x'], 'photo.png', { type: 'image/png' }));
    component.newProfile();
    expect(component.selectedPhoto).toBeNull();
    expect(component.photoPreview).toBe('');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
});
