import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';
import { federationBuilder } from '@softarc/native-federation';
import { createEsBuildAdapter } from '@softarc/native-federation-esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..', '..');
const projectRelativePath = path.relative(workspaceRoot, projectRoot);
const outputPath = path.join(projectRoot, 'dist');
const sharedBundleName = 'browser-shared';

const inlineCssPlugin = {
  name: 'inline-css',
  setup(build) {
    build.onResolve({ filter: /\.css\?inline$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path.replace(/\?inline$/, '')),
      namespace: 'inline-css',
    }));

    build.onLoad({ filter: /.*/, namespace: 'inline-css' }, async (args) => {
      const source = await fs.promises.readFile(args.path, 'utf8');
      const { code } = await esbuild.transform(source, {
        loader: 'css',
        minify: true,
      });

      return {
        contents: `export default ${JSON.stringify(code)};`,
        loader: 'js',
      };
    });
  },
};

const react19Framework = {
  name: 'react19',
  fileReplacements: {
    dev: {
      'node_modules/react/index.js': {
        file: 'node_modules/react/cjs/react.development.js',
      },
      'node_modules/react/jsx-runtime.js': {
        file: 'node_modules/react/cjs/react-jsx-runtime.development.js',
      },
      'node_modules/react/jsx-dev-runtime.js': {
        file: 'node_modules/react/cjs/react-jsx-dev-runtime.development.js',
      },
      'node_modules/react-dom/client.js': {
        file: 'node_modules/react-dom/cjs/react-dom-client.development.js',
      },
    },
    prod: {
      'node_modules/react/index.js': {
        file: 'node_modules/react/cjs/react.production.js',
      },
      'node_modules/react/jsx-runtime.js': {
        file: 'node_modules/react/cjs/react-jsx-runtime.production.js',
      },
      'node_modules/react/jsx-dev-runtime.js': {
        file: 'node_modules/react/cjs/react-jsx-dev-runtime.production.js',
      },
      'node_modules/react-dom/client.js': {
        file: 'node_modules/react-dom/cjs/react-dom-client.production.js',
      },
    },
  },
  needsCommonJsPlugin: true,
};

fs.mkdirSync(outputPath, { recursive: true });

for (const entry of fs.readdirSync(outputPath)) {
  if (entry === 'app') {
    continue;
  }

  fs.rmSync(path.join(outputPath, entry), { recursive: true, force: true });
}

await federationBuilder.init({
  options: {
    workspaceRoot,
    outputPath: path.join(projectRelativePath, 'dist'),
    tsConfig: path.join(projectRoot, 'tsconfig.app.json'),
    packageJson: path.join(projectRoot, 'package.json'),
    federationConfig: path.join(projectRelativePath, 'federation.config.mjs'),
    projectName: 'react-remote',
    verbose: false,
  },
  adapter: createEsBuildAdapter({
    plugins: [inlineCssPlugin],
    loader: {
      '.png': 'dataurl',
      '.svg': 'dataurl',
    },
    frameworks: [react19Framework],
  }),
});

await federationBuilder.build();

const remoteEntryPath = path.join(outputPath, 'remoteEntry.json');
const remoteEntry = JSON.parse(fs.readFileSync(remoteEntryPath, 'utf8'));
const importMapPath = path.join(outputPath, 'importmap.json');
const importMap = JSON.parse(fs.readFileSync(importMapPath, 'utf8'));

const jsxRuntimeOutput = path.join(outputPath, 'react_jsx_runtime.js');

await esbuild.build({
  absWorkingDir: projectRoot,
  stdin: {
    contents: `
      import runtime from 'react/jsx-runtime';

      export const Fragment = runtime.Fragment;
      export const jsx = runtime.jsx;
      export const jsxs = runtime.jsxs;
    `,
    resolveDir: projectRoot,
    sourcefile: 'react-jsx-runtime-adapter.mjs',
  },
  outfile: jsxRuntimeOutput,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

remoteEntry.shared = [
  ...(remoteEntry.shared ?? []).filter((entry) => entry.packageName !== 'react/jsx-runtime'),
  {
    packageName: 'react/jsx-runtime',
    outFileName: path.basename(jsxRuntimeOutput),
    requiredVersion: '^19.2.7',
    singleton: true,
    strictVersion: true,
    version: '19.2.7',
    bundle: sharedBundleName,
  },
];

importMap.imports['react/jsx-runtime'] = path.basename(jsxRuntimeOutput);

for (const expose of remoteEntry.exposes ?? []) {
  const configEntry = federationBuilder.config.exposes[expose.key];

  if (!configEntry) {
    continue;
  }

  const entryFile = path.resolve(projectRoot, configEntry.file);
  const buildResult = await esbuild.build({
    absWorkingDir: projectRoot,
    entryPoints: [entryFile],
    outdir: outputPath,
    entryNames: '[name]-[hash]',
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    write: false,
    sourcemap: false,
    minify: true,
    plugins: [inlineCssPlugin],
    external: federationBuilder.externals.filter(
      (external) => external !== 'react/jsx-runtime' && external !== 'react/jsx-dev-runtime',
    ),
    loader: {
      '.png': 'dataurl',
      '.svg': 'dataurl',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  const entryOutput = buildResult.outputFiles.find((file) => file.path.endsWith('.js'));

  if (!entryOutput) {
    throw new Error(`No JavaScript bundle was emitted for expose ${expose.key}`);
  }

  for (const file of buildResult.outputFiles) {
    const filePath = path.join(outputPath, path.basename(file.path));
    fs.writeFileSync(filePath, file.contents);
  }

  expose.outFileName = path.basename(entryOutput.path);

  remoteEntry.chunks = {
    ...(remoteEntry.chunks ?? {}),
    'mapping-or-exposed': buildResult.outputFiles
      .map((file) => path.basename(file.path))
      .filter((fileName) => fileName !== expose.outFileName),
  };
}

fs.writeFileSync(remoteEntryPath, JSON.stringify(remoteEntry, null, 2));
fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
await federationBuilder.close();
