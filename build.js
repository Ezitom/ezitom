const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Load environment variables from .env if present
const env = {};
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });
}

const getEnvVar = (key) => process.env[key] || env[key] || '';

// Clean dist folder
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Create .nojekyll so GitHub Pages serves all files (including _ prefixed)
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');
console.log('Created: .nojekyll');

// Helper to copy text files and inject environment variables
function copyAndInjectEnv(srcPath, destPath) {
  let content = fs.readFileSync(srcPath, 'utf8');
  
  const gaId = getEnvVar('VITE_GA_MEASUREMENT_ID');
  const web3Key = getEnvVar('VITE_WEB3FORMS_ACCESS_KEY');
  const githubToken = getEnvVar('VITE_GITHUB_TOKEN') || getEnvVar('GITHUB_TOKEN');
  
  content = content.replaceAll("import.meta.env.VITE_GA_MEASUREMENT_ID", `'${gaId}'`);
  content = content.replaceAll("import.meta.env.VITE_WEB3FORMS_ACCESS_KEY", `'${web3Key}'`);
  content = content.replaceAll("import.meta.env.VITE_GITHUB_TOKEN", `'${githubToken}'`);
  
  fs.writeFileSync(destPath, content, 'utf8');
}

// Recursive copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    const baseName = path.basename(src);
    if (baseName === 'node_modules' || baseName === 'dist' || baseName === '.git' || baseName === 'client') return;

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const baseName = path.basename(src);
    if (baseName === 'package.json' || baseName === 'package-lock.json' || baseName === 'build.js' || baseName === '.env') return;

    const ext = path.extname(src).toLowerCase();
    const textExtensions = ['.html', '.js', '.css', '.json', '.xml', '.txt'];
    if (textExtensions.includes(ext)) {
      copyAndInjectEnv(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

// Files to copy to root of dist
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
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
    console.log(`Copied and processed: ${file}`);
  }
});

// Folders to copy recursively
const foldersToCopy = ['assets', 'images'];

foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, folder);
  const dest = path.join(distDir, folder);
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
    console.log(`Copied directory recursively and processed: ${folder}`);
  }
});

// Copy client/public/assets if exists
const publicAssetsSrc = path.join(__dirname, 'client', 'public', 'assets');
if (fs.existsSync(publicAssetsSrc)) {
  copyRecursiveSync(publicAssetsSrc, path.join(distDir, 'assets'));
  console.log('Copied client/public/assets directory recursively');
}


// Copy admin assets (js, css)
const adminJsSrc = path.join(__dirname, 'client', 'admin', 'js');
const adminCssSrc = path.join(__dirname, 'client', 'admin', 'css');
const adminJsDest = path.join(distDir, 'admin', 'js');
const adminCssDest = path.join(distDir, 'admin', 'css');

fs.mkdirSync(adminJsDest, { recursive: true });
fs.mkdirSync(adminCssDest, { recursive: true });

fs.readdirSync(adminJsSrc).forEach(file => {
  copyAndInjectEnv(path.join(adminJsSrc, file), path.join(adminJsDest, file));
});
fs.readdirSync(adminCssSrc).forEach(file => {
  copyRecursiveSync(path.join(adminCssSrc, file), path.join(adminCssDest, file));
});

// Process and copy HTML files to their clean routes in dist/admin
const adminPages = [
  { src: 'dashboard.html', dest: 'index.html', dir: '' },
  { src: 'login.html', dest: 'index.html', dir: 'login' },
  { src: 'projects.html', dest: 'index.html', dir: 'projects' },
  { src: 'skills.html', dest: 'index.html', dir: 'skills' },
  { src: 'messages.html', dest: 'index.html', dir: 'messages' },
  { src: 'forgot.html', dest: 'index.html', dir: 'forgot-password' },
  { src: 'reset-password.html', dest: 'index.html', dir: 'reset-password' }
];

adminPages.forEach(page => {
  const srcPath = path.join(__dirname, 'client', 'admin', page.src);
  const destSubDir = page.dir ? path.join(distDir, 'admin', page.dir) : path.join(distDir, 'admin');
  const destPath = path.join(destSubDir, page.dest);

  if (!fs.existsSync(destSubDir)) {
    fs.mkdirSync(destSubDir, { recursive: true });
  }

  let content = fs.readFileSync(srcPath, 'utf8');

  // Inject environment variables
  const gaId = getEnvVar('VITE_GA_MEASUREMENT_ID');
  const web3Key = getEnvVar('VITE_WEB3FORMS_ACCESS_KEY');
  const githubToken = getEnvVar('VITE_GITHUB_TOKEN') || getEnvVar('GITHUB_TOKEN');
  
  content = content.replaceAll("import.meta.env.VITE_GA_MEASUREMENT_ID", `'${gaId}'`);
  content = content.replaceAll("import.meta.env.VITE_WEB3FORMS_ACCESS_KEY", `'${web3Key}'`);
  content = content.replaceAll("import.meta.env.VITE_GITHUB_TOKEN", `'${githubToken}'`);

  // Adjust relative paths based on depth
  if (page.dir) {
    // Nested page: Prepend ../ to relative assets/scripts/links
    content = content.replaceAll('href="css/', 'href="../css/');
    content = content.replaceAll('src="js/', 'src="../js/');
    content = content.replaceAll('href="login.html"', 'href="../login/"');
    content = content.replaceAll('href="forgot.html"', 'href="../forgot-password/"');
    content = content.replaceAll('href="reset-password.html"', 'href="../reset-password/"');
    content = content.replaceAll('href="dashboard.html"', 'href="../"');
    content = content.replaceAll('href="projects.html"', 'href="../projects/"');
    content = content.replaceAll('href="skills.html"', 'href="../skills/"');
    content = content.replaceAll('href="messages.html"', 'href="../messages/"');
    content = content.replaceAll('href="/assets/', 'href="../../assets/');
    content = content.replaceAll('src="/images/', 'src="../../images/');
    content = content.replaceAll('href="/"', 'href="../../"');
  } else {
    // Root dashboard page (dist/admin/index.html)
    content = content.replaceAll('href="login.html"', 'href="login/"');
    content = content.replaceAll('href="forgot.html"', 'href="forgot-password/"');
    content = content.replaceAll('href="reset-password.html"', 'href="reset-password/"');
    content = content.replaceAll('href="dashboard.html"', 'href="./"');
    content = content.replaceAll('href="projects.html"', 'href="projects/"');
    content = content.replaceAll('href="skills.html"', 'href="skills/"');
    content = content.replaceAll('href="messages.html"', 'href="messages/"');
    content = content.replaceAll('href="/assets/', 'href="../assets/');
    content = content.replaceAll('src="/images/', 'src="../images/');
    content = content.replaceAll('href="/"', 'href="../"');
  }

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`Copied and processed admin page: ${page.src} -> ${path.relative(distDir, destPath)}`);
});

console.log('✓ Build completed successfully in dist/');
