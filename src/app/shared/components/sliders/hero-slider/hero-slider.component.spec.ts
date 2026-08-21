import { ChangeDetectorRef } from '@angular/core';
import { HeroSliderComponent } from './hero-slider.component';

describe('HeroSliderComponent', () => {
  it('uses arrow keys locally and pauses autoplay after keyboard interaction', () => {
    const cdr = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['detectChanges']);
    const component = new HeroSliderComponent(cdr);
    component.items = [{ src: 'one.webp' }, { src: 'two.webp' }];
    spyOn(component, 'stopAutoplay');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    spyOn(event, 'preventDefault');

    component.onCarouselKeydown(event);

    expect(component.currentIndex).toBe(1);
    expect(component.stopAutoplay).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
