const fs = require('fs');
const path = require('path');

const components = [
  { dir: 'products', name: 'products' },
  { dir: 'products', name: 'product-detail' },
  { dir: 'products', name: 'category' },
  { dir: 'quotation', name: 'quotation' },
  { dir: 'services', name: 'services' },
  { dir: 'about', name: 'about' },
  { dir: 'contact', name: 'contact' },
  { dir: 'blog', name: 'blog' },
  { dir: 'blog', name: 'blog-detail' },
  { dir: 'giveaways', name: 'giveaways' },
  { dir: 'gallery', name: 'gallery' }
];

const baseDir = path.join(__dirname, 'src', 'app', 'features');

components.forEach(({ dir, name }) => {
  const compDir = path.join(baseDir, dir);
  if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

  // TypeScript file
  const tsPath = path.join(compDir, `${name}.component.ts`);
  if (!fs.existsSync(tsPath)) {
    fs.writeFileSync(tsPath, 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-${name.replace(/-/g, '')}',
  standalone: true,
  template: \`<div class="text-white text-3xl p-8">${name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')} próximamente...</div>\`,
  styleUrls: ['./${name}.component.css']
})
export class ${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Component {}
`);
  }

  // CSS file
  const cssPath = path.join(compDir, `${name}.component.css`);
  if (!fs.existsSync(cssPath)) {
    fs.writeFileSync(cssPath, `/* Estilos para ${name.replace(/-/g, ' ')} */\n`);
  }
});

console.log('Componentes generados correctamente.');
