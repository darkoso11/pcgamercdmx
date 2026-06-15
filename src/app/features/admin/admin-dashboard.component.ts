import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from './admin-header.component';
import { adminUrl } from './admin-route.config';

interface AdminModuleCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: 'cyan' | 'pink' | 'violet' | 'sky';
  actions: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>

    <main class="min-h-screen bg-[#071029] px-6 py-8 text-white">
      <div class="mx-auto max-w-7xl 2xl:max-w-[1500px]">
        <div class="mb-8 flex flex-col gap-3">
          <p class="text-xs uppercase tracking-[0.24em] text-cyan-300">Gestion de contenido</p>
          <h1 class="text-4xl font-black md:text-5xl">Panel Administrativo</h1>
          <p class="max-w-3xl text-sm leading-6 text-slate-300">
            Accede a las areas principales del sitio. Cada seccion concentra sus acciones frecuentes para mantener la administracion ordenada y facil de revisar.
          </p>
        </div>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <a
            *ngFor="let module of modules"
            [routerLink]="module.route"
            class="group min-h-[260px] rounded-xl border-2 bg-gradient-to-br p-7 transition duration-300 hover:-translate-y-1"
            [ngClass]="cardClasses[module.accent]"
          >
            <div class="flex h-full flex-col justify-between gap-8">
              <div>
                <div class="mb-5 flex items-start justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <span class="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-3xl" [ngClass]="iconClasses[module.accent]">
                      <i [class]="module.icon"></i>
                    </span>
                    <div>
                      <h2 class="text-2xl font-black md:text-3xl" [ngClass]="titleClasses[module.accent]">{{ module.title }}</h2>
                      <p class="mt-2 text-sm leading-6 text-slate-300">{{ module.description }}</p>
                    </div>
                  </div>
                  <i class="fas fa-arrow-right mt-2 text-xl opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100"></i>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div *ngFor="let action of module.actions" class="rounded-lg border border-white/10 bg-[#081229]/70 px-4 py-3 text-sm text-slate-200">
                    {{ action }}
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-white/10 pt-5">
                <span class="text-xs uppercase tracking-[0.2em] text-slate-400">Abrir modulo</span>
                <span class="rounded-lg px-4 py-2 text-sm font-black" [ngClass]="buttonClasses[module.accent]">
                  Entrar
                </span>
              </div>
            </div>
          </a>
        </section>
      </div>
    </main>
  `,
})
export class AdminDashboardComponent {
  readonly modules: AdminModuleCard[] = [
    {
      title: 'Admin Home',
      description: 'Edita la primera impresion del sitio: banner superior, carrusel grande, anuncios y proximos eventos.',
      icon: 'fas fa-bullhorn',
      route: adminUrl('home'),
      accent: 'sky',
      actions: ['Banner superior del hero', 'Carrusel promocional', 'Switch de proximos eventos', 'Vista publica del home'],
    },
    {
      title: 'Admin Productos',
      description: 'Mantiene actualizado el catalogo comercial, paquetes, ensambles, categorias y ofertas activas.',
      icon: 'fas fa-box',
      route: adminUrl('products'),
      accent: 'pink',
      actions: ['Productos y perifericos', 'Ensambles y paquetes', 'Ofertas destacadas', 'Categorias del catalogo'],
    },
    {
      title: 'Admin Comunidad',
      description: 'Administra colaboradores, perfiles publicados y textos visibles en la experiencia publica de comunidad.',
      icon: 'fas fa-users',
      route: adminUrl('community'),
      accent: 'violet',
      actions: ['Perfiles de colaboradores', 'Destacados del home', 'Estado publicado/borrador', 'Pagina publica de comunidad'],
    },
    {
      title: 'Admin Blog',
      description: 'Gestiona articulos, categorias y contenido editorial cuando haya publicaciones listas para el sitio.',
      icon: 'fas fa-newspaper',
      route: adminUrl('blog'),
      accent: 'cyan',
      actions: ['Lista de articulos', 'Nuevo articulo', 'Categorias editoriales', 'Contenido publicado'],
    },
  ];

  readonly cardClasses: Record<AdminModuleCard['accent'], string> = {
    cyan: 'from-cyan-900/30 to-blue-950/40 border-cyan-400/50 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/10',
    pink: 'from-pink-900/30 to-purple-950/40 border-pink-400/50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-400/10',
    violet: 'from-violet-900/30 to-cyan-950/30 border-violet-400/50 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-400/10',
    sky: 'from-sky-900/30 to-fuchsia-950/30 border-sky-400/50 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-400/10',
  };

  readonly titleClasses: Record<AdminModuleCard['accent'], string> = {
    cyan: 'text-cyan-300',
    pink: 'text-pink-300',
    violet: 'text-violet-300',
    sky: 'text-sky-300',
  };

  readonly iconClasses: Record<AdminModuleCard['accent'], string> = {
    cyan: 'text-cyan-300',
    pink: 'text-pink-300',
    violet: 'text-violet-300',
    sky: 'text-sky-300',
  };

  readonly buttonClasses: Record<AdminModuleCard['accent'], string> = {
    cyan: 'bg-cyan-400 text-[#071029]',
    pink: 'bg-pink-400 text-[#071029]',
    violet: 'bg-violet-400 text-[#071029]',
    sky: 'bg-sky-400 text-[#071029]',
  };
}
