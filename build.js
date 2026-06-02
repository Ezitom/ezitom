const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Clean dist folder
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Files to copy
const filesToCopy = [
  'index.html',
  'about.html',
  'contact.html',
  'projects.html',
  'skills.html',
  'experience.html',
  'footer.html',
  'style.css',
  'main.js',
  'backend-api.js'
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
    console.log(`Copied: ${file}`);
  }
});

// Folders to copy recursively
const foldersToCopy = ['assets', 'images', 'client'];

foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, folder);
  const dest = path.join(distDir, folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied directory: ${folder}`);
  }
});

console.log('✓ Build completed successfully in dist/');
