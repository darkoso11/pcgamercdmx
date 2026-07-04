import fs from 'node:fs/promises';
import path from 'node:path';

const credentials = await loadCredentials();
const token = await login(credentials);

await ensurePricePrecision();

const assemblies = [
  {
    title: 'PC Basica Ryzen 5 5600GT',
    slug: 'pc-basica-ryzen-5-5600gt',
    description:
      'Ensamble basico AM4 con Ryzen 5 5600GT, 16GB DDR4, SSD NVMe de 500GB y gabinete Acteck con fuente integrada.',
    subcategory: 'pc-gaming',
    price: 10200,
    processor: 'AMD Ryzen 5 5600GT 6 Core 3.6GHz AM4',
    motherboard: 'Gigabyte B550M DS3H AC R2 1.0 AM4 WiFi BT mATX',
    ram: '16GB DDR4 Acer UD100 3200MHz',
    storage: 'ADATA Legend 860 500GB M.2 PCIe Gen4',
    graphicsCard: 'Graficos integrados Radeon',
    powerSupply: 'Fuente 500W integrada en gabinete',
    caseModel: 'Acteck Kioto GC220F Mini-ATX 500W USB Negro',
    cooling: 'Disipador incluido AMD',
    sourcePdf: 'Cotizacion CPU Basico.xlsx - Cotizador Max.pdf',
  },
  {
    title: 'PC Gaming RTX 5060 Ryzen 5 8400F',
    slug: 'pc-gaming-rtx-5060-ryzen-5-8400f',
    description:
      'Ensamble AM5 para gaming con Ryzen 5 8400F, RTX 5060 de 8GB, 16GB DDR5, SSD NVMe de 1TB y fuente 650W Gold.',
    subcategory: 'pc-gaming',
    price: 28510,
    processor: 'AMD Ryzen 5 8400F 6 Core 4.2GHz AM5',
    motherboard: 'Gigabyte B850 Eagle WiFi6E AM5 DDR5 ATX',
    ram: '16GB Kingston Fury Beast DDR5 6000MT/s CL36',
    storage: 'Predator GM7 1TB M.2 7200MB/s',
    graphicsCard: 'Gigabyte NVIDIA GeForce RTX 5060 Eagle OC 8GB GDDR7',
    powerSupply: 'Gigabyte 650W PCIe Gen5 80 Plus Gold',
    caseModel: 'Lian Li Vector V100 Black ARGB ATX',
    cooling: 'Disipador AMD Stealth incluido',
    sourcePdf: 'Cotización 5060.xlsx - Cotizador Max.pdf',
  },
  {
    title: 'PC Ideal Ryzen 7 9700X RTX 5070',
    slug: 'pc-ideal-ryzen-7-9700x-rtx-5070',
    description:
      'Configuracion ideal AM5 con Ryzen 7 9700X, RTX 5070 de 12GB, 32GB DDR5, SSD NVMe de 1TB y enfriamiento liquido de 360mm.',
    subcategory: 'pc-gaming',
    price: 47155,
    processor: 'AMD Ryzen 7 9700X 8 Core 3.8GHz AM5',
    motherboard: 'Gigabyte B850 Eagle WiFi6E AM5 DDR5 ATX',
    ram: '32GB Kingston Fury Beast DDR5 6000MT/s CL36 (2x16GB)',
    storage: 'Predator GM7 1TB M.2 7200MB/s',
    graphicsCard: 'MSI GeForce RTX 5070 12G Shadow 3X OC GDDR7',
    powerSupply: 'MSI MAG A850GL 850W 80 Plus Gold Full Modular PCIe5',
    caseModel: 'Lian Li Vector V100 Black ARGB ATX',
    cooling: 'Cooler Master MasterLiquid 360 Core II ARGB Negro',
    sourcePdf: 'Cotización Andrea Duran - Configuracion Ideale.xlsx - Cotizador Max.pdf',
  },
  {
    title: 'PC Armada Ryzen 9 9950X3D RTX 5080 White',
    slug: 'pc-armada-ryzen-9-9950x3d-rtx-5080-white',
    description:
      'Ensamble premium blanco con Ryzen 9 9950X3D, RTX 5080, 48GB DDR5, componentes Lian Li y detalles LCD/RGB.',
    subcategory: 'pc-gaming',
    price: 95873,
    processor: 'AMD Ryzen 9 9950X3D Zen 5 16 Core 128MB AM5',
    motherboard: 'ASUS TUF Gaming X870-PRO WiFi7 AM5 DDR5 ATX',
    ram: '48GB BIWIN DW100 RGB DDR5 6000MT/s CL28 (2x24GB)',
    storage: 'Predator GM7 1TB M.2 7200MB/s',
    graphicsCard: 'MSI GeForce RTX 5080 16G Ventus 3X OC White GDDR7',
    powerSupply: 'MSI MAG A1000GL PCIe5 1000W 80 Plus Gold Full Modular',
    caseModel: 'Lian Li O11 Vision Compact White Cristal Templado EATX',
    cooling: 'Lian Li Hydroshift II LCD-S White 360mm',
    sourcePdf: 'Cotización Armada 13 5080.xlsx.pdf',
  },
  {
    title: 'PC Gama de Entrada Ryzen 5 5600GT',
    slug: 'pc-gama-entrada-ryzen-5-5600gt',
    description:
      'Ensamble de entrada AM4 con Ryzen 5 5600GT, 16GB DDR4, SSD NVMe de 1TB, fuente 650W Gold y gabinete Formula Air Power.',
    subcategory: 'pc-gaming',
    price: 13660,
    processor: 'AMD Ryzen 5 5600GT 6 Core 3.6GHz AM4',
    motherboard: 'Gigabyte B550M DS3H AC R2 1.0 AM4 WiFi BT mATX',
    ram: '16GB XPG Gammix D35 DDR4 3200MHz Black',
    storage: 'Predator GM7 1TB M.2 7200MB/s',
    graphicsCard: 'Graficos integrados Radeon',
    powerSupply: 'Gigabyte 650W PCIe Gen5 80 Plus Gold',
    caseModel: 'Formula Air Power G5 Duo Mid ATX Black',
    cooling: 'Disipador incluido AMD',
    sourcePdf: 'Cotización Gama de Entrada.xlsx - Cotizador Max.pdf',
  },
  {
    title: 'PC Tope de Gama Core Ultra 9 RTX 5090',
    slug: 'pc-tope-gama-core-ultra-9-rtx-5090',
    description:
      'Ensamble extremo con Intel Core Ultra 9 285K, RTX 5090 de 32GB, 128GB DDR5, SSD NVMe de 2TB y fuente NZXT 1200W Gold.',
    subcategory: 'pc-workstation',
    price: 155600,
    processor: 'Intel Core Ultra 9 285K 5.7GHz LGA1851 24 nucleos',
    motherboard: 'ASUS ROG Strix Z890-A Gaming WiFi LGA1851 DDR5 ATX',
    ram: '128GB XPG Lancer Blade DDR5 6000MT/s (4x32GB)',
    storage: 'Predator GM9000 2TB M.2',
    graphicsCard: 'Zotac RTX 5090 Solid OC 32GB GDDR7 PCIe 5.0',
    powerSupply: 'NZXT C1200 1200W 80 Plus Gold ATX 3.1 Full Modular',
    caseModel: 'NZXT H9 Flow 2 RGB Black ATX',
    cooling: 'Cooler Master MasterLiquid 360 Core II ARGB Negro',
    sourcePdf: 'Cotización Tope de Gama 2.xlsx - Cotizador Max.pdf',
  },
];

const stats = { created: 0, updated: 0 };

for (const [index, assembly] of assemblies.entries()) {
  const payload = buildPayload(assembly, index);
  const existing = await findBySlug(payload.slug);

  if (existing) {
    await directus(`/items/pc_products/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    stats.updated += 1;
  } else {
    await directus('/items/pc_products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    stats.created += 1;
  }
}

console.log(JSON.stringify(stats, null, 2));

function buildPayload(assembly, index) {
  const now = new Date().toISOString();
  const keywords = [
    'ensamble',
    'pc gamer',
    assembly.processor,
    assembly.graphicsCard,
    assembly.ram,
  ];

  return {
    title: assembly.title,
    slug: assembly.slug,
    description: assembly.description,
    category: 'assembled',
    subcategory: assembly.subcategory,
    price: assembly.price,
    discounted_price: null,
    image: assembly.image ?? '',
    images: [],
    specifications: {
      processor: assembly.processor,
      motherboard: assembly.motherboard,
      ram: assembly.ram,
      storage: assembly.storage,
      graphicsCard: assembly.graphicsCard,
      powerSupply: assembly.powerSupply,
      caseModel: assembly.caseModel,
      cooling: assembly.cooling,
      powerCertificate: '',
      watts: null,
      admin: {
        source: 'assembly-pdf-import',
        sourcePdf: assembly.sourcePdf,
        productType: 'gabinete',
        brand: 'PC Gamer CDMX',
        categoryId: '1',
        subcategoryId: assembly.subcategory,
        discountPrice: null,
        discountPercent: null,
        currency: 'MXN',
        sku: `ENS-${String(index + 1).padStart(3, '0')}`,
        pricingMode: 'manual',
        syncEnabled: false,
        syncProvider: '',
        providerProductId: '',
        providerSku: '',
        lastPriceSyncedAt: null,
        lastSyncStatus: 'manual',
        lastSyncError: null,
        gallery: [],
        internalNotes: `Creado desde PDF: ${assembly.sourcePdf}`,
        createdAt: now,
        updatedAt: now,
      },
    },
    brand_logos: [],
    stock: 1,
    low_stock_alert: 1,
    featured: true,
    published: true,
    sort: index + 1,
    meta_title: assembly.title,
    meta_description: assembly.description,
    keywords,
  };
}

async function ensurePricePrecision() {
  const field = await directus('/fields/pc_products/price');
  const precision = field.data?.schema?.numeric_precision ?? 0;

  if (precision >= 12) {
    return;
  }

  await directus('/fields/pc_products/price', {
    method: 'PATCH',
    body: JSON.stringify({
      schema: {
        numeric_precision: 12,
        numeric_scale: 5,
      },
    }),
  });
}

async function findBySlug(slug) {
  const query = new URLSearchParams({
    'filter[slug][_eq]': slug,
    fields: 'id,slug',
    limit: '1',
  });
  const result = await directus(`/items/pc_products?${query}`);
  return result.data?.[0] ?? null;
}

async function directus(endpoint, options = {}) {
  const response = await fetch(`${credentials.url}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Directus ${endpoint} failed: ${response.status} ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

async function loadCredentials() {
  const directusUrl = process.env.DIRECTUS_URL?.replace(/\/+$/, '');
  const email = process.env.DIRECTUS_EMAIL;
  const password = process.env.DIRECTUS_PASSWORD;

  if (directusUrl && email && password) {
    return { url: directusUrl, email, password };
  }

  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  const credentialsPath = path.join(userProfile, '.pcgamercdmx', 'directus-backend.txt');
  const raw = await fs.readFile(credentialsPath, 'utf8');
  const fileEmail = matchLine(raw, 'Admin email');
  const filePassword = matchLine(raw, 'Admin password');
  const fileUrl = matchLine(raw, 'URL') || directusUrl;

  if (!fileUrl || !fileEmail || !filePassword) {
    throw new Error('Missing Directus credentials.');
  }

  return {
    url: fileUrl.replace(/\/+$/, ''),
    email: fileEmail,
    password: filePassword,
  };
}

function matchLine(raw, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return raw.match(new RegExp(`^\\s*${escaped}\\s*[:=]\\s*(.+?)\\s*$`, 'im'))?.[1]?.trim();
}

async function login({ url, email, password }) {
  const response = await fetch(`${url}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, mode: 'json' }),
  });

  if (!response.ok) {
    throw new Error(`Directus login failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.data.access_token;
}
