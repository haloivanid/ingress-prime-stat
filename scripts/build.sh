#!/bin/sh

#preparation
npx rimraf ./lib

#build tsc
npx tsc -p tsconfig.json
npx terser ./lib/main.js -c -m -o ./lib/main.js

#postbuild process
node ./scripts/pkg-builder.js
