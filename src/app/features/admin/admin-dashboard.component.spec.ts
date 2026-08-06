import { AdminDashboardComponent } from './admin-dashboard.component';
import { adminUrl } from './admin-route.config';

describe('AdminDashboardComponent', () => {
  it('exposes separate product and assembly cards with direct dashboard routes', () => {
    const component = new AdminDashboardComponent();
    const products = component.modules.find((module) => module.title === 'Admin Productos');
    const assemblies = component.modules.find((module) => module.title === 'Admin Ensambles');

    expect(products?.route).toBe(adminUrl('products'));
    expect(products?.actions).toEqual([
      'Hardware y componentes',
      'Perifericos y accesorios',
      'Categorias de productos',
      'Ofertas de productos',
    ]);
    expect(assemblies?.route).toBe(adminUrl('assemblies'));
    expect(assemblies?.actions).toEqual([
      'Computadoras armadas',
      'Paquetes de ensamble',
      'Categorias de ensambles',
      'Ofertas de ensambles',
    ]);
  });
});
