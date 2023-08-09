#!/bin/sh

npx rimraf ./lib
mkdir ./lib

yarn build

cp ./package.lib.json ./lib/package.json
cp .npmrc ./lib/.npmrc
