const fs = require('fs');
const path = require('path');

// Load environment variables from parent .env if present
const env = {};
const parentEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(parentEnvPath)) {
  const envContent = fs.readFileSync(parentEnvPath, 'utf8');
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

// Copy assets and images from the parent directory to the client directory
// This ensures that relative path resolutions (e.g., ../assets/... or ../images/...)
// map correctly to the deployed domain root.
const foldersToCopy = ['assets', 'images'];

foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, '..', folder);
  const dest = path.join(__dirname, folder);

  if (fs.existsSync(src)) {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    // We copy recursively and run injection on copied text files
    copyRecursiveSync(src, dest);
    console.log(`Copied and processed directory: ${folder} to client/${folder}`);
  } else {
    console.warn(`Source folder not found: ${src}`);
  }
});

// Since client/ is the root directory in Vercel, we should also process files already inside client/
// (like index.html, admin/, etc.) to replace environment variables in place!
// Let's run the injection in place for all html and js files in client/ (except assets/ and images/)
function processInPlace(dir) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    // Ignore copied folders
    if (file === 'assets' || file === 'images' || file === 'node_modules') return;
    
    if (stat.isDirectory()) {
      processInPlace(fullPath);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (['.html', '.js', '.css', '.json'].includes(ext)) {
        copyAndInjectEnv(fullPath, fullPath);
      }
    }
  });
}

processInPlace(__dirname);

console.log('✓ Client build completed successfully.');
