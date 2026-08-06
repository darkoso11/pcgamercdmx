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
});
