#!/bin/sh

npx rimraf ./lib
mkdir ./lib

yarn build

rsync -ah ./dist/ ./lib
cp ./package.lib.json ./lib/package.json
cp .npmrc ./lib/.npmrc
