import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// La función getPrerenderParams debe devolver un array de rutas válidas
export function getPrerenderParams() {
  return [
    // Ruta dinámica para productos
    { 
      route: '/productos/:slug',
      params: [
        { slug: 'laptop-dell-xps' },
        { slug: 'monitor-lg-4k' },
        { slug: 'cpu-pre-armado-1' },
        { slug: 'cpu-pre-armado-2' },
        { slug: 'cpu-pre-armado-3' },
        { slug: 'cpu-pre-armado-4' },
        { slug: 'cpu-pre-armado-5' },
        // Slugs de periféricos
        { slug: 'razer-deathadder-v2' },
        { slug: 'hyperx-alloy-fps-pro' },
        { slug: 'logitech-g-pro-x' },
        { slug: 'corsair-t1-race' },
        { slug: 'asus-tuf-vg27aq' },
        { slug: 'xbox-elite-controller-series-2' },
        { slug: 'steelseries-arctis-7' },
        { slug: 'logitech-g502-hero' },
        { slug: 'razer-blackwidow-elite' },
        { slug: 'aoc-c27g2z' }
      ]
    },
    
    // Ruta dinámica para entradas de blog
    {
      route: '/blog/:slug',
      params: [
        { slug: 'como-armar-tu-pc' },
        { slug: 'guia-componentes-2024' },
        { slug: 'mejores-tarjetas-graficas-2024' },
        { slug: 'guia-overclock-seguro-cpu' },
        { slug: 'configurar-pc-para-streaming' }
      ]
    }
  ];
}

// Función de bootstrap para SSR
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;

