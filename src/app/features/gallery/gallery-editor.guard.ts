import { CanDeactivateFn } from '@angular/router';
import type { AdminGalleryComponent } from './admin-gallery.component';

export const galleryEditorCanDeactivate: CanDeactivateFn<AdminGalleryComponent> = component => component.canLeave();
