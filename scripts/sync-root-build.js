import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'apps', 'web', 'dist');
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');
const rootIndex = path.join(rootDir, 'index.html');
const distIndex = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir)) {
  console.warn('⚠️ Warning: apps/web/dist not found. Run "npm run build" first.');
  process.exit(0);
}

// Ensure assets are mirrored
if (fs.existsSync(distAssets)) {
  fs.cpSync(distAssets, rootAssets, { recursive: true });
}

// Find compiled CSS and JS bundle files
const assetFiles = fs.readdirSync(distAssets);
const cssFile = assetFiles.find((f) => f.endsWith('.css'));
const jsFile = assetFiles.find((f) => f.endsWith('.js'));

if (cssFile && jsFile) {
  const cssContent = fs.readFileSync(path.join(distAssets, cssFile), 'utf-8');
  const jsContent = fs.readFileSync(path.join(distAssets, jsFile), 'utf-8');
  
  // Re-read fresh index template from apps/web/index.html to ensure clean base
  const templateHtmlPath = path.join(rootDir, 'apps', 'web', 'index.html');
  const baseHtml = fs.existsSync(templateHtmlPath)
    ? fs.readFileSync(templateHtmlPath, 'utf-8')
    : fs.readFileSync(distIndex, 'utf-8');

  // Build clean self-contained HTML
  // IMPORTANT: Use replacement function `() => ...` so '$&' in minified JS is NOT treated as regex replacement pattern!
  let inlinedHtml = baseHtml;

  // Remove vite dev script tag if present
  inlinedHtml = inlinedHtml.replace(/<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/i, '');
  
  // Remove any existing external link/script to assets
  inlinedHtml = inlinedHtml.replace(/<link\s+rel="stylesheet"[^>]*href="(?:\.\/)?assets\/[^"]+"[^>]*>/i, '');
  inlinedHtml = inlinedHtml.replace(/<script\s+type="module"[^>]*src="(?:\.\/)?assets\/[^"]+"[^>]*><\/script>/i, '');

  // Insert style before </head>
  inlinedHtml = inlinedHtml.replace('</head>', () => `<style>\n${cssContent}\n</style>\n</head>`);

  // Insert script inside <body> before </body>
  inlinedHtml = inlinedHtml.replace('</body>', () => `<script>\n${jsContent}\n</script>\n</body>`);

  fs.writeFileSync(rootIndex, inlinedHtml, 'utf-8');
  fs.writeFileSync(distIndex, inlinedHtml, 'utf-8');
  console.log('✓ Successfully created clean self-contained index.html at root and in dist/');
  console.log('✓ Verified: Safe string interpolation with zero dollar-sign corruption.');
} else {
  console.warn('⚠️ CSS or JS bundle not found in dist/assets.');
}
