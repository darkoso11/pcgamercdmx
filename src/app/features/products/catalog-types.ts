// Exact public taxonomy aliases. Generic brand categories do not imply a type.
export const CATALOG_TYPES = [
  { slug: 'gpu', label: 'Tarjetas gráficas', aliases: ['componentes-gpu', 'componentes-tarjeta-grafica', 'componentes-amd-tarjeta-grafica'] },
  { slug: 'cpu', label: 'Procesadores', aliases: ['componentes-cpu', 'componentes-procesadores'] },
  { slug: 'motherboard', label: 'Tarjetas madre', aliases: ['componentes-tarjeta-madre', 'componentes-msi-tarjeta-madre', 'componentes-asus-tarjeta-madre', 'componentes-gigabyte-tarjeta-madre', 'componentes-nzxt-tarjeta-madre'] },
  { slug: 'ram', label: 'Memoria RAM', aliases: ['componentes-ram', 'componentes-memoria-ram'] },
  { slug: 'storage', label: 'Almacenamiento', aliases: ['componentes-storage', 'componentes-almacenamiento'] },
  { slug: 'power-supply', label: 'Fuentes de poder', aliases: ['componentes-fuentes-de-poder'] },
  { slug: 'cooling', label: 'Enfriamiento', aliases: ['componentes-enfriamiento', 'componentes-enfriamiento-liquido'] },
  { slug: 'case', label: 'Gabinetes', aliases: ['componentes-gabinetes'] },
  { slug: 'monitor', label: 'Monitores', aliases: ['perifericos-monitor', 'perifericos-monitores', 'componentes-monitores'] },
  { slug: 'keyboard', label: 'Teclados', aliases: ['perifericos-keyboard', 'perifericos-teclados'] },
  { slug: 'mouse', label: 'Mouse', aliases: ['perifericos-mouse'] },
  { slug: 'headset', label: 'Audífonos', aliases: ['perifericos-headset'] },
  { slug: 'speaker', label: 'Bocinas', aliases: [] },
  { slug: 'chair', label: 'Sillas', aliases: ['perifericos-sillas'] },
  { slug: 'controller', label: 'Mandos', aliases: ['perifericos-control'] },
  { slug: 'microphone', label: 'Micrófonos', aliases: ['perifericos-microfonos'] },
  { slug: 'camera', label: 'Cámaras', aliases: ['perifericos-camara'] },
  { slug: 'mousepad', label: 'Mousepads', aliases: ['perifericos-mousepad'] },
  { slug: 'cable', label: 'Cables', aliases: ['componentes-cables', 'perifericos-cables'] },
  { slug: 'usb-hub', label: 'Adaptadores y hubs', aliases: ['componentes-adaptadores', 'perifericos-adaptadores'] },
  { slug: 'capture', label: 'Capturadoras', aliases: ['perifericos-capturadora'] },
  { slug: 'fan', label: 'Ventiladores', aliases: ['componentes-ventiladores', 'perifericos-ventiladores'] },
  { slug: 'thermal-paste', label: 'Pasta térmica', aliases: ['componentes-pasta-termica'] },
  { slug: 'network', label: 'Redes', aliases: ['componentes-redes'] },
  { slug: 'regulator', label: 'Reguladores', aliases: ['componentes-reguladores'] },
  { slug: 'desk', label: 'Escritorios', aliases: ['componentes-escritorios'] },
];

export const catalogTypeForSlug = (slug: string): string | undefined =>
  CATALOG_TYPES.find(type => type.slug === slug || type.aliases.includes(slug))?.slug;
