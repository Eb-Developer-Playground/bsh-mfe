const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../projects/customer360/src/app/shared/directives');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.directive.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix host binding quoting: 'method('$event')' -> 'method($event)'
  const badHost = content.match(/host:\s*\{[\s\S]*?'\([^']+\)':\s*'[a-zA-Z0-9_]+\('.*?'\)'/);
  if (badHost) {
    content = content.replace(
      /('\([^']+\)':\s*'[a-zA-Z0-9_]+)\('([^']*)'\)/g,
      "$1($2)"
    );
    changed = true;
  }

  // Remove standalone: true
  if (content.includes('standalone: true')) {
    content = content.replace(/\s*standalone:\s*true,\n/, '\n');
    changed = true;
  }

  // Fix private $1 injection artifact
  if (content.includes('private $1 = inject')) {
    content = content.replace(
      /private \$1 = inject\(ElementRef<HTMLInputElement>\)/g,
      'private el = inject(ElementRef<HTMLInputElement>)'
    );
    changed = true;
  }

  // Convert remaining ElementRef constructor patterns to inject
  content = content.replace(
    /constructor\((?:public|private)\s+(?:el|_el)\s*:\s*ElementRef(?:<[^>]+>)?\)\s*\{\s*this\.inputElement\s*=\s*el\.nativeElement;\s*\}/g,
    'private el = inject(ElementRef<HTMLInputElement>);\n  inputElement = this.el.nativeElement;'
  );

  content = content.replace(
    /constructor\((?:public|private)\s+(?:el|_el)\s*:\s*ElementRef(?:<[^>]+>)?\)\s*\{\s*\}/g,
    'private el = inject(ElementRef<HTMLInputElement>)'
  );

  // Update nativeElement references from this._el to this.el
  if (content.includes('this._el.nativeElement') && !content.includes('private _el = inject')) {
    content = content.replace(/this\._el\.nativeElement/g, 'this.el.nativeElement');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', file);
  }
}
