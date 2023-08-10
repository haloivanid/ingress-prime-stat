#!/bin/sh

npx rimraf ./lib
mkdir ./lib

npm run build

cp ./package.lib.json ./lib/package.json
