import { ChangeDetectorRef, NgZone } from '@angular/core';
import { BannersSliderComponent } from './banners-slider.component';

describe('BannersSliderComponent', () => {
  it('uses arrow keys locally and pauses autoplay after keyboard interaction', () => {
    const cdr = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['detectChanges']);
    const zone = new NgZone({ enableLongStackTrace: false });
    const component = new BannersSliderComponent(cdr, zone);
    component.banners = [{}, {}];
    spyOn(component, 'stopAutoPlay');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    spyOn(event, 'preventDefault');

    component.onCarouselKeydown(event);

    expect(component.currentIndex).toBe(1);
    expect(component.stopAutoPlay).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
