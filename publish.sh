npm run icons
npm run build
cp -r ./lib/* .
rm index.js
npm publish
rm -rf ./components
rm -rf ./icons