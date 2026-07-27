const field = (fieldName, type, schema = {}, meta = {}) => ({
  field: fieldName,
  type,
  schema: { is_nullable: true, ...schema },
  meta: { interface: 'input', width: 'half', ...meta },
});

export const adminCommerceCollections = [
  {
    collection: 'pc_offers',
    publicReadFields: [
      'id',
      'title',
      'description',
      'catalog_domain',
      'discount_type',
      'discount_value',
      'applicable_products',
      'applicable_assemblies',
      'applicable_categories',
      'starts_at',
      'ends_at',
      'active',
      'show_badge',
    ],
    meta: {
      icon: 'sell',
      note: 'Ofertas independientes para productos y ensambles',
      display_template: '{{title}}',
      sort: 30,
    },
    fields: [
      field('title', 'string', { is_nullable: false, max_length: 255 }, {
        required: true,
        width: 'full',
        sort: 1,
      }),
      field('description', 'text', {}, {
        interface: 'input-multiline',
        width: 'full',
        sort: 2,
      }),
      field('catalog_domain', 'string', { is_nullable: false, max_length: 32 }, {
        required: true,
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Productos', value: 'products' },
            { text: 'Ensambles', value: 'assemblies' },
          ],
        },
        sort: 3,
      }),
      field('discount_type', 'string', { is_nullable: false, max_length: 32 }, {
        required: true,
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Porcentaje', value: 'percentage' },
            { text: 'Cantidad fija', value: 'fixed' },
          ],
        },
        sort: 4,
      }),
      field('discount_value', 'decimal', { is_nullable: false }, {
        required: true,
        interface: 'input',
        sort: 5,
      }),
      field('applicable_products', 'json', {}, {
        interface: 'input-code',
        width: 'full',
        sort: 6,
      }),
      field('applicable_assemblies', 'json', {}, {
        interface: 'input-code',
        width: 'full',
        sort: 7,
      }),
      field('applicable_categories', 'json', {}, {
        interface: 'input-code',
        width: 'full',
        sort: 8,
      }),
      field('starts_at', 'timestamp', { is_nullable: false }, {
        required: true,
        interface: 'datetime',
        sort: 9,
      }),
      field('ends_at', 'timestamp', { is_nullable: false }, {
        required: true,
        interface: 'datetime',
        sort: 10,
      }),
      field('active', 'boolean', { default_value: true }, {
        interface: 'boolean',
        sort: 11,
      }),
      field('show_badge', 'boolean', { default_value: true }, {
        interface: 'boolean',
        sort: 12,
      }),
    ],
  },
  {
    collection: 'pc_power_certifications',
    meta: {
      icon: 'verified',
      note: 'Biblioteca reutilizable de certificaciones de fuentes de poder',
      display_template: '{{name}}',
      sort: 31,
    },
    fields: [
      field('name', 'string', { is_nullable: false, max_length: 255 }, {
        required: true,
        width: 'full',
        sort: 1,
      }),
      field('image', 'string', { is_nullable: false, max_length: 255 }, {
        required: true,
        note: 'ID del archivo cargado en Directus',
        width: 'full',
        sort: 2,
      }),
      field('active', 'boolean', { default_value: true }, {
        interface: 'boolean',
        sort: 3,
      }),
      field('sort', 'integer', { default_value: 0 }, {
        interface: 'input',
        sort: 4,
      }),
    ],
  },
];

export const defaultPowerCertifications = [
  {
    name: '80+ Bronze',
    filePath: 'src/assets/img/certificaciones/80_Plus_Bronze.svg.png',
    sort: 1,
  },
  {
    name: '80+ Gold',
    filePath: 'src/assets/img/certificaciones/80plusgold.png',
    sort: 2,
  },
];
