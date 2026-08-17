import { ProductsSliderComponent } from './products-slider.component';

describe('ProductsSliderComponent', () => {
  it('shows the offer badge only when the independent badge control is enabled', () => {
    const component = new ProductsSliderComponent();

    expect(component.shouldShowOfferBadge({ showOfferBadge: true })).toBeTrue();
    expect(component.shouldShowOfferBadge({ showOfferBadge: false })).toBeFalse();
    expect(component.shouldShowOfferBadge({})).toBeFalse();
  });

  it('uses the saved certification name as accessible image text', () => {
    const component = new ProductsSliderComponent();

    expect(component.getCertificationAlt({
      powerCertificateName: 'Cybenetics Platinum',
    })).toBe('Certificación Cybenetics Platinum de la fuente de poder');
  });

  it('hides a failed product image without replacing it with another cabinet', () => {
    const component = new ProductsSliderComponent();
    const image = document.createElement('img');
    image.src = 'https://cms.test/assembly.png';

    component.handleImageError({ target: image } as unknown as Event);

    expect(image.style.display).toBe('none');
    expect(image.src).not.toContain('BR-938686_1.png');
    expect(image.onerror).toBeNull();
  });

  it('moves only when an arrow key is handled by its own carousel', () => {
    const component = new ProductsSliderComponent();
    component.products = [{}, {}, {}];
    component.cardsPerView = 1;
    component.maxVisibleIndex = 2;
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    spyOn(event, 'preventDefault');

    component.onCarouselKeydown(event);

    expect(component.currentIndex).toBe(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
