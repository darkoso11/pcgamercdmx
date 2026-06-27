import { PeripheralsSliderComponent } from './peripherals-slider.component';

describe('PeripheralsSliderComponent', () => {
  let component: PeripheralsSliderComponent;

  beforeEach(() => {
    component = new PeripheralsSliderComponent();
    component.categories = [
      { name: 'Todo', value: 'all' },
      { name: 'Mouse', value: 'mouse' },
    ];
    component.items = [
      { name: 'Mouse disponible', category: 'mouse', inStock: true },
      { name: 'Mouse sin stock', category: 'mouse', inStock: false },
    ];
  });

  it('shows only peripherals with stock', () => {
    expect(component.filteredItems.map((item) => item.name)).toEqual(['Mouse disponible']);
  });

  it('keeps out-of-stock peripherals hidden when filtering by category', () => {
    component.selectCategory(1);

    expect(component.filteredItems.map((item) => item.name)).toEqual(['Mouse disponible']);
  });
});
