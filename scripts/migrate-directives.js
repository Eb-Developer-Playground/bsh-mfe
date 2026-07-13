const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../projects/customer360/src/app/shared/directives');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.directive.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has host object or no HostListener
  if (content.includes('host:') || !content.includes('@HostListener')) {
    continue;
  }

  // Convert constructor injection of ElementRef to inject
  content = content.replace(
    /constructor\(private\s+(?:_?el|_?EL|_?elementRef|_?elRef)\s*:\s*ElementRef(?:<[^>]+>)?\)\s*\{\s*\}/g,
    'private $1 = inject(ElementRef<HTMLInputElement>)'
  );

  // Extract @HostListener decorators and build host object
  const hostListenerRegex = /@HostListener\('([^']+)'(?:,\s*\[([^\]]*)\])?\)\s*([a-zA-Z0-9_]+)\s*\(/g;
  const hosts = [];
  let match;
  while ((match = hostListenerRegex.exec(content)) !== null) {
    const event = match[1];
    const args = match[2] ? match[2].trim() : '$event';
    const method = match[3];
    hosts.push(`    '(${event})': '${method}(${args})'`);
  }

  if (hosts.length === 0) continue;

  // Remove @HostListener decorators (multiline safe)
  content = content.replace(/@HostListener\([^)]*\)\s*/g, '');

  // Add host object to @Directive decorator
  const hostBlock = `  host: {\n${hosts.join(',\n')}\n  },`;
  content = content.replace(
    /@Directive\(\{\s*\n(\s*)(\/\/[^\n]*\n\s*)?(selector:[^\n]+)\n/,
    (m, indent, comment, selectorLine) => {
      const commentPart = comment ? comment : '';
      return `@Directive({\n${indent}${commentPart}${selectorLine}\n${hostBlock}\n`;
    }
  );

  // Update imports: remove HostListener, add inject if ElementRef used
  if (content.includes('ElementRef')) {
    content = content.replace(
      /import\s*\{\s*([^}]*)HostListener([^}]*)\}\s*from\s*'@angular\/core';/,
      (m, before, after) => {
        const items = `${before}${after}`.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes('inject')) items.push('inject');
        return `import { ${items.join(', ')} } from '@angular/core';`;
      }
    );
  } else {
    content = content.replace(
      /import\s*\{\s*([^}]*)HostListener([^}]*)\}\s*from\s*'@angular\/core';/,
      (m, before, after) => {
        const items = `${before}${after}`.split(',').map(s => s.trim()).filter(Boolean);
        if (items.length === 0) return '';
        return `import { ${items.join(', ')} } from '@angular/core';`;
      }
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Migrated', file);
}
