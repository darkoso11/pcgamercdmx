import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('runs browser checks for pull requests and only reruns pushes on main', async () => {
  const workflow = await readProjectFile('.github/workflows/browser-compatibility.yml');

  assert.match(workflow, /push:\s*\n\s*branches:\s*\[main\]/);
  assert.match(workflow, /pull_request:\s*\n\s*branches:\s*\[main, test, dev\]/);
});

test('keeps unused UI tooling out of production dependencies and global styles', async () => {
  const manifest = JSON.parse(await readProjectFile('package.json'));
  const angularConfig = JSON.parse(await readProjectFile('angular.json'));
  const buildConfig = angularConfig.projects.pcgamercdmx.architect.build;
  const globalStyles = buildConfig.options.styles;
  const initialBudget = buildConfig.configurations.production.budgets.find(
    (budget) => budget.type === 'initial',
  );

  for (const packageName of [
    '@angular/animations',
    '@angular/cdk',
    '@angular/material',
    'ngx-toastr',
    '@angular/platform-browser-dynamic',
  ]) {
    assert.equal(manifest.dependencies[packageName], undefined, `${packageName} should not ship in production`);
  }

  assert.equal(manifest.devDependencies['@angular/platform-browser-dynamic'], '20.3.27');
  assert.equal(manifest.overrides?.['@modelcontextprotocol/sdk'], '1.30.0');
  assert.equal(globalStyles.includes('@angular/material/prebuilt-themes/cyan-orange.css'), false);
  assert.equal(initialBudget?.maximumWarning, '540kb');
});

test('lazy-loads below-the-fold public images with asynchronous decoding', async () => {
  const about = await readProjectFile('src/app/features/about/about.component.html');
  const community = await readProjectFile('src/app/features/community/community.component.html');
  const productDetail = await readProjectFile('src/app/features/products/product-detail.component.html');

  const aboutImages = about.match(/<img\b[^>]*>/gs) ?? [];
  assert.ok(aboutImages.length > 0);
  for (const image of aboutImages) {
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
  }

  assert.match(
    community,
    /<img\b(?=[^>]*\[src\]="collaborator\.image")(?=[^>]*loading="lazy")(?=[^>]*decoding="async")[^>]*>/s,
  );
  assert.match(
    productDetail,
    /<img\b(?=[^>]*\[src\]="card\.image")(?=[^>]*loading="lazy")(?=[^>]*decoding="async")[^>]*>/s,
  );
});
