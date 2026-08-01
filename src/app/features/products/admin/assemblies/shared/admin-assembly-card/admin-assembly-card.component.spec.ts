import { TestBed } from '@angular/core/testing';
import { AdminAssemblyCardComponent } from './admin-assembly-card.component';

describe('AdminAssemblyCardComponent', () => {
  const assembly = {
    _id: 'assembly-1',
    title: 'ROBOT',
    slug: 'robot',
    description: 'Ensamble gamer',
    category: 'paquetes' as const,
    price: 20000,
    image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    images: [],
    processor: 'Ryzen 7',
    graphicsCard: '',
    ram: '32 GB DDR5',
    brandLogos: [],
    stock: 6,
    lowStockAlert: 2,
    published: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('builds chips only for non-empty CPU, GPU and RAM values', () => {
    const component = new AdminAssemblyCardComponent();
    component.assembly = assembly;

    expect(component.specChips).toEqual([
      { label: 'CPU', value: 'Ryzen 7' },
      { label: 'RAM', value: '32 GB DDR5' },
    ]);
  });

  it('computes specification chips once per assembly input', () => {
    const component = new AdminAssemblyCardComponent();
    component.assembly = assembly;

    expect(component.specChips).toBe(component.specChips);
  });

  it('activates an accessible fallback when the image fails', () => {
    const component = new AdminAssemblyCardComponent();
    component.assembly = assembly;

    component.handleImageError();

    expect(component.imageFailed).toBeTrue();
  });

  it('keeps the low-stock warning in the shared card', () => {
    const component = new AdminAssemblyCardComponent();
    component.assembly = { ...assembly, stock: 1, lowStockAlert: 2 };

    expect(component.stockLabel).toBe('1 bajo stock');
  });

  it('emits management actions with the assembly id', () => {
    const component = new AdminAssemblyCardComponent();
    component.assembly = assembly;
    spyOn(component.edit, 'emit');
    spyOn(component.duplicate, 'emit');
    spyOn(component.delete, 'emit');

    component.requestEdit();
    component.requestDuplicate();
    component.requestDelete();

    expect(component.edit.emit).toHaveBeenCalledOnceWith('assembly-1');
    expect(component.duplicate.emit).toHaveBeenCalledOnceWith('assembly-1');
    expect(component.delete.emit).toHaveBeenCalledOnceWith('assembly-1');
  });

  it('renders the balanced card with image, status, stock and available chips', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AdminAssemblyCardComponent],
    }).createComponent(AdminAssemblyCardComponent);
    fixture.componentInstance.assembly = assembly;

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Imagen principal de ROBOT');
    expect(element.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    expect(element.textContent).toContain('ROBOT');
    expect(element.textContent).toContain('Publicado');
    expect(element.textContent).toContain('6 en stock');
    expect(element.textContent).toContain('CPU Ryzen 7');
    expect(element.textContent).toContain('RAM 32 GB DDR5');
    expect(element.textContent).not.toContain('GPU');
  });

  it('renders the image fallback after a load error', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AdminAssemblyCardComponent],
    }).createComponent(AdminAssemblyCardComponent);
    fixture.componentInstance.assembly = assembly;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="assembly-image-fallback"]')).not.toBeNull();
  });

  it('shows duplicate and delete actions only in management mode', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AdminAssemblyCardComponent],
    }).createComponent(AdminAssemblyCardComponent);
    fixture.componentInstance.assembly = assembly;
    fixture.componentInstance.managementMode = true;

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-action="edit"]')).not.toBeNull();
    expect(element.querySelector('[data-action="duplicate"]')).not.toBeNull();
    expect(element.querySelector('[data-action="delete"]')).not.toBeNull();
  });
});
