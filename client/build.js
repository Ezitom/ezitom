const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Load environment variables from parent .env if present
const env = {};
const parentEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(parentEnvPath)) {
  const envContent = fs.readFileSync(parentEnvPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });
}

const getEnvVar = (key) => process.env[key] || env[key] || '';

// Helper to copy text files and inject environment variables
function copyAndInjectEnv(srcPath, destPath) {
  let content = fs.readFileSync(srcPath, 'utf8');

  const gaId = getEnvVar('VITE_GA_MEASUREMENT_ID');
  const web3Key = getEnvVar('VITE_WEB3FORMS_ACCESS_KEY');

  content = content.replaceAll("import.meta.env.VITE_GA_MEASUREMENT_ID", `'${gaId}'`);
  content = content.replaceAll("import.meta.env.VITE_WEB3FORMS_ACCESS_KEY", `'${web3Key}'`);

  fs.writeFileSync(destPath, content, 'utf8');
}

// Recursive copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      // Skip node_modules and dist
      if (childItemName === 'node_modules' || childItemName === 'dist') return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const ext = path.extname(src).toLowerCase();
    const textExtensions = ['.html', '.js', '.css', '.json', '.xml', '.txt'];
    if (textExtensions.includes(ext)) {
      copyAndInjectEnv(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

// Clean dist folder
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy all client files (index.html, admin/, vercel.json) into dist/
const clientFiles = fs.readdirSync(__dirname);
clientFiles.forEach(item => {
  if (item === 'node_modules' || item === 'dist' || item === 'build.js' || item === 'package.json' || item === 'package-lock.json') return;
  const src = path.join(__dirname, item);
  const dest = path.join(distDir, item);
  copyRecursiveSync(src, dest);
  console.log(`Copied: ${item}`);
});

// 2. Copy assets and images from parent directory into dist/
const parentFolders = ['assets', 'images'];
parentFolders.forEach(folder => {
  const src = path.join(__dirname, '..', folder);
  const dest = path.join(distDir, folder);
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
    console.log(`Copied parent directory: ${folder}`);
  } else {
    console.warn(`Source folder not found: ${src}`);
  }
});

// 3. Copy main portfolio files from parent into dist root
const portfolioFiles = [
  'index.html', 'about.html', 'contact.html', 'projects.html',
  'skills.html', 'experience.html', 'footer.html',
  'style.css', 'main.js', 'backend-api.js'
];
portfolioFiles.forEach(file => {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    copyAndInjectEnv(src, dest);
    console.log(`Copied portfolio file: ${file}`);
  }
});

console.log('✓ Client build completed successfully → dist/');
