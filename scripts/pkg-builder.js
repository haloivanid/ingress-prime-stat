const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pkgJson = require('../package.json');

const includeSomeDependencies = ['dayjs'];
const includeSomeDevDependencies = [];

const dependencies = {};
for (const key in pkgJson.dependencies) {
    if (includeSomeDependencies.includes(key)) {
        dependencies[key] = pkgJson.dependencies[key];
    }
}

const devDependencies = {};
for (const key in pkgJson.devDependencies) {
    if (includeSomeDevDependencies.includes(key)) {
        devDependencies[key] = pkgJson.devDependencies[key];
    }
}

const newPkgJson = {
    name: pkgJson.name,
    description: pkgJson.description,
    readme: pkgJson.readme,
    version: pkgJson.version,
    author: pkgJson.author,
    license: pkgJson.license,
    repository: pkgJson.repository,
    engines: pkgJson.engines,
    main: 'main.js',
    types: 'main.d.ts',
    exports: {
        '.': {
            require: './main.js',
            import: './main.js',
            types: './main.d.ts',
        },
    },
};

if (Object.keys(dependencies).length) {
    newPkgJson.dependencies = dependencies;
}
if (Object.keys(devDependencies).length) {
    newPkgJson.devDependencies = devDependencies;
}

fs.writeFileSync(path.join(rootDir, 'lib', 'package.json'), JSON.stringify(newPkgJson, null, 2));
