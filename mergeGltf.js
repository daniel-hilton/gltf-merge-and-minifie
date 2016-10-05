'use strict';

let Promise = require('bluebird')
let fs = require('fs-promise')
let mergeFunctions = require('./mergeFunctions.js')
let minimizeGltf = require('./minimizeGltf.js')

let files = [
	'Tile_+000_+000_L18_000.gltf',
	//'Tile_+000_+001_L18_0000.gltf',
	//'Tile_+000_+002_L18_0000.gltf',
	//'Tile_+000_+003_L18_0000.gltf',
	//'Tile_+000_+004_L18_0000.gltf',
	//'Tile_+000_+005_L18_0000.gltf'
	]
let niceStringify = true

let newModel = {}
Promise.all(files.map(path => fs.readFile(path)))
	.then(x => x.map(JSON.parse))
	.then(gltfArray => gltfArray.map(minimizeGltf))
	.then(models => Object.keys(mergeFunctions).forEach(key => newModel[key] = mergeFunctions[key](models.map(model => model[key]))))
	//.then(() => console.log("New Model = ",newModel))
	.then(() => fs.writeFile("merged.gltf",JSON.stringify(newModel,null,niceStringify ? 4 : null)))