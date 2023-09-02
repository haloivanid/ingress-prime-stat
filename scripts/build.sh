#!/bin/sh

version=$1

# build tsc
npm run build

# post build process
npx terser ./lib/main.js --source-map "base='../',content='./lib/main.js.map'" -c -o ./lib/main.js

#check if version is empty
if [ -z "$version" ]; then
  echo "version is empty run build only"
else
  npm pkg set version="$version"
  git add .

  cd ./lib || exit 1
  npm pkg set version="$version"
  echo "build and update lib pkg version: $version"
fi
