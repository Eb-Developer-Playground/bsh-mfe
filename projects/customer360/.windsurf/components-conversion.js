// Script to identify components that need conversion
const fs = require('fs');
const path = require('path');

const componentsDir = '/Users/silali/Work/playground/bsh-mfe/projects/customer360/src/app/shared/components';

function findComponents(dir) {
  const results = [];
  
  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith('.component.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if component is not already standalone
        if (!content.includes('standalone: true')) {
          results.push({
            path: fullPath,
            relativePath: path.relative(componentsDir, fullPath),
            hasConstructor: content.includes('constructor('),
            hasImports: content.includes('@Component') && content.includes('imports')
          });
        }
      }
    }
  }
  
  traverse(dir);
  return results;
}

const components = findComponents(componentsDir);
console.log(`Found ${components.length} components to convert:`);
components.forEach(comp => {
  console.log(`  - ${comp.relativePath}`);
});
