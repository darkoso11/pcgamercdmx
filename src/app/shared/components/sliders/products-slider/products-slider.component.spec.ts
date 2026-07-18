import { ProductsSliderComponent } from './products-slider.component';

describe('ProductsSliderComponent', () => {
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
