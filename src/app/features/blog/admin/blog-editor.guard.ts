import { CanDeactivateFn } from '@angular/router';

export const blogEditorCanDeactivate: CanDeactivateFn<{ canLeaveEditor(): boolean }> = component => component.canLeaveEditor();
