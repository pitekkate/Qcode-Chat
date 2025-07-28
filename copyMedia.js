// copyMedia.js
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'media');
const destination = path.join(__dirname, 'out', 'media');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  copyDir(source, destination);
  console.log('✅ Media files copied to /out/media');
} catch (err) {
  console.error('❌ Failed to copy media:', err);
}
