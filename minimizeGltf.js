'use strict';

let assert = require('assert');
let removeFunctions = require('./removeFunctions');

function assertEmpty(object){
	assert(object === undefined || object === null || Object.keys(object).length === 0)
}

function isAllRemoved(removeItems){
	//console.log(Object.keys(removeItems).filter(key => removeItems[key].length !== 0))
	return Object.keys(removeItems).filter(key => removeItems[key].length !== 0).length === 0;
}

module.exports = function(gltf){

	// init
	let maxIterations = 100;
	let removeItems = {};
	Object.keys(removeFunctions).forEach(itemName => removeItems[itemName] = [])
	
	// adding the unseen meshes to meshes list
	for(let meshId in gltf.meshes){
		let mesh = gltf.meshes[meshId]
		assert.equal(mesh.primitives.length,1)
		if(!mesh.primitives[0].attributes.TEXCOORD_0){
			removeItems.meshes.push(meshId);
		}
	}
	 while(!isAllRemoved(removeItems) && maxIterations) {
		 maxIterations--;
		 Object.keys(removeFunctions).forEach(itemType => {
			 let itemId = removeItems[itemType].pop()
			 if(itemId){
				 console.log(100-maxIterations, itemId)
				 removeFunctions[itemType](itemId,gltf,removeItems)
			 }
		 })
	 }
	 console.log("done  " + (100-maxIterations) + " removals")
	assert(isAllRemoved(removeItems), "Not all items removed")
	return gltf
}