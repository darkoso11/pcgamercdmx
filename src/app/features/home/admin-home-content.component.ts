import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin/admin-header.component';
import {
  DEFAULT_HOME_CONTENT_SETTINGS,
  HomeBanner,
  HomeContentService,
  HomeContentSettings,
  HomeEvent,
  HomeHeroBanner,
} from './services/home-content.service';

const emptyBanner: HomeBanner = {
  id: '',
  title: '',
  description: '',
  imageUrl: '',
  link: '/',
  ctaText: '',
  badgeText: '',
  active: true,
  sortOrder: 999,
};

const emptyHeroBanner: HomeHeroBanner = {
  id: '',
  src: '',
  link: '/ensambles',
  alt: '',
  active: true,
  sortOrder: 999,
};

const emptyEvent: HomeEvent = {
  id: '',
  day: '',
  month: '',
  title: '',
  description: '',
  link: '/contacto',
  ctaText: '',
  active: true,
};

@Component({
  selector: 'app-admin-home-content',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>

    <main class="min-h-screen bg-[#071029] px-6 py-8 text-white">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 class="text-3xl font-black text-cyan-300">ADMIN - Home</h1>
            <p class="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">Anuncios, banners y eventos</p>
          </div>
          <a routerLink="/" class="rounded-lg border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-300/10">
            Ver home publico
          </a>
        </div>

        <div class="mb-6 flex flex-wrap gap-3">
          <button type="button" (click)="activeTab = 'hero'" class="rounded-lg px-4 py-2 font-bold transition" [ngClass]="activeTab === 'hero' ? 'bg-sky-400 text-[#071029]' : 'border border-white/10 text-slate-300 hover:border-sky-300/40'">
            Banner superior
          </button>
          <button type="button" (click)="activeTab = 'banners'" class="rounded-lg px-4 py-2 font-bold transition" [ngClass]="activeTab === 'banners' ? 'bg-cyan-400 text-[#071029]' : 'border border-white/10 text-slate-300 hover:border-cyan-300/40'">
            Banner grande
          </button>
          <button type="button" (click)="activeTab = 'events'" class="rounded-lg px-4 py-2 font-bold transition" [ngClass]="activeTab === 'events' ? 'bg-pink-400 text-[#071029]' : 'border border-white/10 text-slate-300 hover:border-pink-300/40'">
            Proximos eventos
          </button>
        </div>

        <section *ngIf="activeTab === 'hero'" class="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form class="rounded-xl border border-sky-300/20 bg-[#0b1220] p-5" (ngSubmit)="saveHeroBanner()">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-xl font-black">{{ editingHeroBannerId ? 'Editar banner superior' : 'Agregar banner superior' }}</h2>
              <button type="button" (click)="newHeroBanner()" class="text-sm font-bold text-sky-300 hover:text-white">Nuevo</button>
            </div>

            <div class="grid gap-4">
              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Imagen URL o asset</span>
                <input [(ngModel)]="heroBannerEditor.src" name="heroBannerSrc" required placeholder="assets/img/gabinetes/archivo.png" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-sky-300" />
              </label>

              <div *ngIf="heroBannerEditor.src" class="overflow-hidden rounded-lg border border-white/10 bg-[#071029] p-3">
                <img [src]="heroBannerEditor.src" [alt]="heroBannerEditor.alt || 'Preview banner superior'" class="mx-auto h-44 w-full max-w-md rounded-lg object-contain" />
              </div>

              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Texto alternativo</span>
                <input [(ngModel)]="heroBannerEditor.alt" name="heroBannerAlt" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-sky-300" />
              </label>

              <div class="grid gap-4 md:grid-cols-3">
                <label class="space-y-2 md:col-span-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Link</span>
                  <input [(ngModel)]="heroBannerEditor.link" name="heroBannerLink" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-sky-300" />
                </label>
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Orden</span>
                  <input [(ngModel)]="heroBannerEditor.sortOrder" name="heroBannerOrder" type="number" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-sky-300" />
                </label>
              </div>

              <label class="flex items-center gap-2 text-sm text-slate-300">
                <input [(ngModel)]="heroBannerEditor.active" name="heroBannerActive" type="checkbox" />
                Activo
              </label>

              <button type="submit" class="rounded-lg bg-sky-400 px-5 py-3 font-black text-[#071029] hover:bg-sky-300">
                Guardar banner superior
              </button>
            </div>
          </form>

          <section class="rounded-xl border border-white/10 bg-[#0b1220] p-5">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-xl font-black">Banners superiores registrados</h2>
              <button type="button" (click)="reset()" class="text-sm font-bold text-slate-400 hover:text-white">Restaurar base</button>
            </div>

            <div class="grid gap-4">
              <article *ngFor="let banner of settings.heroBanners" class="grid gap-4 rounded-lg border border-white/10 bg-[#071029] p-3 md:grid-cols-[180px_1fr]">
                <img [src]="banner.src" [alt]="banner.alt" class="h-28 w-full rounded-lg object-contain" />
                <div class="min-w-0">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 class="font-bold">{{ banner.alt || banner.id }}</h3>
                      <p class="text-xs text-slate-400">{{ banner.link }}</p>
                    </div>
                    <span class="rounded-full px-2 py-1 text-[10px] font-bold" [ngClass]="banner.active ? 'bg-green-400/15 text-green-300' : 'bg-yellow-400/15 text-yellow-300'">
                      {{ banner.active ? 'Activo' : 'Oculto' }}
                    </span>
                  </div>
                  <div class="mt-3 flex gap-3 text-sm">
                    <button type="button" (click)="editHeroBanner(banner)" class="font-bold text-sky-300 hover:text-white">Editar</button>
                    <button type="button" (click)="deleteHeroBanner(banner.id)" class="font-bold text-red-300 hover:text-white">Borrar</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </section>

        <section *ngIf="activeTab === 'banners'" class="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form class="rounded-xl border border-cyan-300/15 bg-[#0b1220] p-5" (ngSubmit)="saveBanner()">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-xl font-black">{{ editingBannerId ? 'Editar banner' : 'Agregar banner' }}</h2>
              <button type="button" (click)="newBanner()" class="text-sm font-bold text-cyan-300 hover:text-white">Nuevo</button>
            </div>

            <div class="grid gap-4">
              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Titulo</span>
                <input [(ngModel)]="bannerEditor.title" name="bannerTitle" required class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300" />
              </label>

              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Descripcion</span>
                <textarea [(ngModel)]="bannerEditor.description" name="bannerDescription" rows="3" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300"></textarea>
              </label>

              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Imagen URL o asset</span>
                <input [(ngModel)]="bannerEditor.imageUrl" name="bannerImage" required placeholder="assets/img/gabinetes/archivo.png" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300" />
              </label>

              <div *ngIf="bannerEditor.imageUrl" class="overflow-hidden rounded-lg border border-white/10 bg-[#071029]">
                <img [src]="bannerEditor.imageUrl" [alt]="bannerEditor.title || 'Preview banner'" class="h-56 w-full object-cover" />
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Link</span>
                  <input [(ngModel)]="bannerEditor.link" name="bannerLink" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300" />
                </label>
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Texto boton</span>
                  <input [(ngModel)]="bannerEditor.ctaText" name="bannerCta" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300" />
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Badge</span>
                  <input [(ngModel)]="bannerEditor.badgeText" name="bannerBadge" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300" />
                </label>
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Orden</span>
                  <input [(ngModel)]="bannerEditor.sortOrder" name="bannerOrder" type="number" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-cyan-300" />
                </label>
                <label class="flex items-center gap-2 pt-7 text-sm text-slate-300">
                  <input [(ngModel)]="bannerEditor.active" name="bannerActive" type="checkbox" />
                  Activo
                </label>
              </div>

              <button type="submit" class="rounded-lg bg-gradient-to-r from-cyan-400 to-pink-500 px-5 py-3 font-black text-[#071029]">
                Guardar banner
              </button>
            </div>
          </form>

          <section class="rounded-xl border border-white/10 bg-[#0b1220] p-5">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-xl font-black">Banners registrados</h2>
              <button type="button" (click)="reset()" class="text-sm font-bold text-slate-400 hover:text-white">Restaurar base</button>
            </div>

            <div class="grid gap-4">
              <article *ngFor="let banner of settings.banners" class="grid gap-4 rounded-lg border border-white/10 bg-[#071029] p-3 md:grid-cols-[160px_1fr]">
                <img [src]="banner.imageUrl" [alt]="banner.title" class="h-28 w-full rounded-lg object-cover" />
                <div class="min-w-0">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 class="font-bold">{{ banner.title }}</h3>
                      <p class="text-xs text-slate-400">{{ banner.link }}</p>
                    </div>
                    <span class="rounded-full px-2 py-1 text-[10px] font-bold" [ngClass]="banner.active ? 'bg-green-400/15 text-green-300' : 'bg-yellow-400/15 text-yellow-300'">
                      {{ banner.active ? 'Activo' : 'Oculto' }}
                    </span>
                  </div>
                  <p class="mt-2 line-clamp-2 text-sm text-slate-300">{{ banner.description }}</p>
                  <div class="mt-3 flex gap-3 text-sm">
                    <button type="button" (click)="editBanner(banner)" class="font-bold text-cyan-300 hover:text-white">Editar</button>
                    <button type="button" (click)="deleteBanner(banner.id)" class="font-bold text-red-300 hover:text-white">Borrar</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </section>

        <section *ngIf="activeTab === 'events'" class="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form class="rounded-xl border border-pink-300/20 bg-[#0b1220] p-5" (ngSubmit)="saveEvent()">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-xl font-black">{{ editingEventId ? 'Editar evento' : 'Agregar evento' }}</h2>
              <button type="button" (click)="newEvent()" class="text-sm font-bold text-pink-300 hover:text-white">Nuevo</button>
            </div>

            <button
              type="button"
              (click)="toggleUpcomingEvents()"
              class="mb-5 flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#071029] px-4 py-3 text-left transition hover:border-pink-300/60"
              [attr.aria-pressed]="settings.showUpcomingEvents"
            >
              <span>
                <span class="block text-sm font-bold text-white">Mostrar seccion de proximos eventos</span>
                <span class="text-xs text-slate-400">{{ settings.showUpcomingEvents ? 'Visible en el home' : 'Oculta en el home' }}</span>
              </span>
              <span class="relative h-7 w-14 rounded-full transition" [ngClass]="settings.showUpcomingEvents ? 'bg-pink-400' : 'bg-slate-600'">
                <span class="absolute top-1 h-5 w-5 rounded-full bg-white transition-all" [ngClass]="settings.showUpcomingEvents ? 'left-8' : 'left-1'"></span>
              </span>
            </button>

            <div class="grid gap-4">
              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Dia</span>
                  <input [(ngModel)]="eventEditor.day" name="eventDay" required class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-pink-300" />
                </label>
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Mes</span>
                  <input [(ngModel)]="eventEditor.month" name="eventMonth" required class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-pink-300" />
                </label>
              </div>

              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Titulo</span>
                <input [(ngModel)]="eventEditor.title" name="eventTitle" required class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-pink-300" />
              </label>

              <label class="space-y-2">
                <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Descripcion</span>
                <textarea [(ngModel)]="eventEditor.description" name="eventDescription" rows="3" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-pink-300"></textarea>
              </label>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Link</span>
                  <input [(ngModel)]="eventEditor.link" name="eventLink" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-pink-300" />
                </label>
                <label class="space-y-2">
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Texto CTA</span>
                  <input [(ngModel)]="eventEditor.ctaText" name="eventCta" class="w-full rounded-lg border border-white/10 bg-[#071029] px-4 py-3 outline-none focus:border-pink-300" />
                </label>
              </div>

              <label class="flex items-center gap-2 text-sm text-slate-300">
                <input [(ngModel)]="eventEditor.active" name="eventActive" type="checkbox" />
                Activo
              </label>

              <button type="submit" class="rounded-lg bg-pink-500 px-5 py-3 font-black text-white hover:bg-pink-400">
                Guardar evento
              </button>
            </div>
          </form>

          <section class="rounded-xl border border-white/10 bg-[#0b1220] p-5">
            <h2 class="mb-5 text-xl font-black">Eventos registrados</h2>
            <div class="grid gap-4">
              <article *ngFor="let event of settings.events" class="grid grid-cols-[70px_1fr] gap-4 rounded-lg border border-white/10 bg-[#071029] p-4">
                <div class="rounded-lg bg-violet-500/20 p-3 text-center text-violet-200">
                  <span class="block text-xl font-black">{{ event.day }}</span>
                  <span class="text-xs">{{ event.month }}</span>
                </div>
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-bold">{{ event.title }}</h3>
                    <span class="rounded-full px-2 py-1 text-[10px] font-bold" [ngClass]="event.active ? 'bg-green-400/15 text-green-300' : 'bg-yellow-400/15 text-yellow-300'">
                      {{ event.active ? 'Activo' : 'Oculto' }}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-slate-300">{{ event.description }}</p>
                  <div class="mt-3 flex gap-3 text-sm">
                    <button type="button" (click)="editEvent(event)" class="font-bold text-pink-300 hover:text-white">Editar</button>
                    <button type="button" (click)="deleteEvent(event.id)" class="font-bold text-red-300 hover:text-white">Borrar</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </section>
      </div>
    </main>
  `,
})
export class AdminHomeContentComponent implements OnInit {
  settings: HomeContentSettings = { ...DEFAULT_HOME_CONTENT_SETTINGS };
  heroBannerEditor: HomeHeroBanner = { ...emptyHeroBanner };
  bannerEditor: HomeBanner = { ...emptyBanner };
  eventEditor: HomeEvent = { ...emptyEvent };
  editingHeroBannerId: string | null = null;
  editingBannerId: string | null = null;
  editingEventId: string | null = null;
  activeTab: 'hero' | 'banners' | 'events' = 'hero';

  constructor(
    private readonly homeContent: HomeContentService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.homeContent.getSettings().subscribe((settings) => {
      this.settings = {
        ...settings,
        heroBanners: [...settings.heroBanners],
        banners: [...settings.banners],
        events: [...settings.events],
      };
      this.cdr.detectChanges();
    });
    this.newHeroBanner();
    this.newBanner();
    this.newEvent();
  }

  editHeroBanner(banner: HomeHeroBanner): void {
    this.editingHeroBannerId = banner.id;
    this.heroBannerEditor = { ...banner };
    this.activeTab = 'hero';
  }

  newHeroBanner(): void {
    this.editingHeroBannerId = null;
    this.heroBannerEditor = {
      ...emptyHeroBanner,
      sortOrder: this.settings.heroBanners.length + 1,
    };
  }

  saveHeroBanner(): void {
    if (!this.heroBannerEditor.src.trim()) {
      return;
    }

    const normalized = {
      ...this.heroBannerEditor,
      id: this.heroBannerEditor.id || this.slugify(this.heroBannerEditor.alt || this.heroBannerEditor.src),
      sortOrder: Number(this.heroBannerEditor.sortOrder) || this.settings.heroBanners.length + 1,
    };
    const exists = this.settings.heroBanners.some((banner) => banner.id === normalized.id);
    this.settings.heroBanners = exists
      ? this.settings.heroBanners.map((banner) => (banner.id === normalized.id ? normalized : banner))
      : [...this.settings.heroBanners, normalized];
    this.saveSettings();
    this.newHeroBanner();
  }

  deleteHeroBanner(id: string): void {
    if (!confirm('Eliminar este banner superior?')) {
      return;
    }
    this.settings.heroBanners = this.settings.heroBanners.filter((banner) => banner.id !== id);
    this.saveSettings();
  }

  editBanner(banner: HomeBanner): void {
    this.editingBannerId = banner.id;
    this.bannerEditor = { ...banner };
    this.activeTab = 'banners';
  }

  newBanner(): void {
    this.editingBannerId = null;
    this.bannerEditor = {
      ...emptyBanner,
      sortOrder: this.settings.banners.length + 1,
    };
  }

  saveBanner(): void {
    if (!this.bannerEditor.title.trim() || !this.bannerEditor.imageUrl.trim()) {
      return;
    }

    const normalized = {
      ...this.bannerEditor,
      id: this.bannerEditor.id || this.slugify(this.bannerEditor.title),
      sortOrder: Number(this.bannerEditor.sortOrder) || this.settings.banners.length + 1,
    };
    const exists = this.settings.banners.some((banner) => banner.id === normalized.id);
    this.settings.banners = exists
      ? this.settings.banners.map((banner) => (banner.id === normalized.id ? normalized : banner))
      : [...this.settings.banners, normalized];
    this.saveSettings();
    this.newBanner();
  }

  deleteBanner(id: string): void {
    if (!confirm('Eliminar este banner?')) {
      return;
    }
    this.settings.banners = this.settings.banners.filter((banner) => banner.id !== id);
    this.saveSettings();
  }

  editEvent(event: HomeEvent): void {
    this.editingEventId = event.id;
    this.eventEditor = { ...event };
    this.activeTab = 'events';
  }

  newEvent(): void {
    this.editingEventId = null;
    this.eventEditor = { ...emptyEvent };
  }

  saveEvent(): void {
    if (!this.eventEditor.title.trim() || !this.eventEditor.day.trim()) {
      return;
    }

    const normalized = {
      ...this.eventEditor,
      id: this.eventEditor.id || this.slugify(this.eventEditor.title),
    };
    const exists = this.settings.events.some((event) => event.id === normalized.id);
    this.settings.events = exists
      ? this.settings.events.map((event) => (event.id === normalized.id ? normalized : event))
      : [...this.settings.events, normalized];
    this.saveSettings();
    this.newEvent();
  }

  toggleUpcomingEvents(): void {
    this.settings.showUpcomingEvents = !this.settings.showUpcomingEvents;
    this.saveSettings();
  }

  deleteEvent(id: string): void {
    if (!confirm('Eliminar este evento?')) {
      return;
    }
    this.settings.events = this.settings.events.filter((event) => event.id !== id);
    this.saveSettings();
  }

  saveSettings(): void {
    this.homeContent.saveSettings(this.settings).subscribe((settings) => {
      this.settings = { ...settings };
      this.cdr.detectChanges();
    });
  }

  reset(): void {
    if (!confirm('Restaurar banners y eventos base?')) {
      return;
    }
    this.homeContent.reset();
    this.newHeroBanner();
    this.newBanner();
    this.newEvent();
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}
