#!/bin/sh

# preparation
npx rimraf ./lib

mkdir ./lib

# copy readme
cp ./README.md ./lib/README.md
cp ./LICENSE ./lib/LICENSE

# post build process
node ./scripts/pkg-builder.js

# check if the package was writen
if [ ! -f "./lib/package.json" ]; then
  echo "package.json was created"
  exit 1
fi

# saving temp npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ./lib/.npmrc
cat ./lib/.npmrc
