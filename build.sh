#!/bin/sh

npx rimraf ./lib
mkdir ./lib

yarn build

cp ./package.lib.json ./lib/package.json
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/lib/.npmrc
