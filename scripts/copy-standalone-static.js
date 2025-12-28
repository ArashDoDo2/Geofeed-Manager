const fs = require('fs');
const path = require('path');

const appRoot = process.cwd();
const staticSrc = path.join(appRoot, '.next', 'static');
const staticDest = path.join(
  appRoot,
  '.next',
  'standalone',
  'Geofeed-Manager',
  '.next',
  'static'
);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(staticSrc, staticDest);
