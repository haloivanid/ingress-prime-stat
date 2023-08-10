#!/bin/sh

version=$1

npm pkg set version="$version"
git add .

# build tsc
npm run build

# post build process
npx terser ./lib/main.js -c -m -o ./lib/main.js

cd ./lib || exit 1
npm pkg set version="$version"
echo "update lib pkg version: $version"
