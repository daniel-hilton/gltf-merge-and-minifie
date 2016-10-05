'use strict';

let assert = require('assert');
let cesium = require('cesium');

// todo refactor: move the foreach&delete command&=[] to "minimizeGltf.js" 

function spliceBuffer(buffer,start,bytesToRemove){
	assert(start >= 0);
	assert(bytesToRemove >= 0);
	assert(start + bytesToRemove <= buffer.length);
	return Buffer.concat([buffer.slice(0,start),buffer.slice(start+bytesToRemove)])
}

module.exports = {
	meshes: function(meshId,gltf,removeItems){
		let mesh = gltf.meshes[meshId];
		let primitive = mesh.primitives[0];
		removeItems.materials.push(primitive.material);
		removeItems.accessors.push(primitive.indices);
		Object.keys(primitive.attributes).forEach(attr => removeItems.accessors.push(primitive.attributes[attr]));
		
		delete gltf.meshes[meshId]
		for(let nodeId in gltf.nodes){
			let node = gltf.nodes[nodeId];
			if(node.meshes && node.meshes.indexOf(meshId)!== -1){
				node.meshes.splice(node.meshes.indexOf(meshId),1)
			}
		}
	},
	materials: function(maetialId,gltf,removeItems){
		let material = gltf.materials[maetialId];
		assert(material.instanceTechnique);
		removeItems.techniques.push(material.instanceTechnique.technique);
		
		delete gltf.materials[maetialId];
	},
	techniques: function(techniqueId,gltf,removeItems){
		let technique = gltf.techniques[techniqueId];
		assert(technique.pass);
		let pass = technique.passes[technique.pass]
		assert(pass.instanceProgram);
		removeItems.programs.push(pass.instanceProgram.program);
		
		delete gltf.techniques[techniqueId];

	},
	programs: function(programId,gltf,removeItems){
		let program = gltf.programs[programId];
		assert(program.fragmentShader);
		assert(program.vertexShader);
		
		removeItems.shaders.push(program.fragmentShader,program.vertexShader)
		
		delete gltf.programs[programId];
	},
	shaders: function(shaderId,gltf,removeItems){
		let shader = gltf.shaders[shaderId];
		assert(shader.uri.substr(0,5) == "data:");
		
		delete gltf.shaders[shaderId];
	},
	accessors: function(accessorId,gltf,removeItems){
		let accessor = gltf.accessors[accessorId];
			
		// Collecting data (sizes & offsets)
		let byteStride = accessor.byteStride || cesium.ComponentDatatype.getSizeInBytes(accessor.componentType);
		let byteLength = accessor.count * byteStride;
		let bufferView = gltf.bufferViews[accessor.bufferView]
		let buffer = gltf.buffers[bufferView.buffer]
		let startPos = bufferView.byteOffset + accessor.byteOffset;
		
		// shifting back the accessors that after this accessor
		for(let inspectedAccessorId in gltf.accessors){
			let inspectedAccessor = gltf.accessors[inspectedAccessorId];
			if(inspectedAccessor.bufferView == accessor.bufferView && inspectedAccessor.byteOffset > accessor.byteOffset){
				inspectedAccessor.byteOffset -= byteLength
			}
		}
		
		// shifting back the bufferViews that after this bufferViewin this buffer
		for(let inspectedBufferViewId in gltf.bufferViews){
			let inspectedBufferView = gltf.bufferViews[inspectedBufferViewId];
			if(inspectedBufferView.buffer == bufferView.buffer && inspectedBufferView.byteOffset > bufferView.byteOffset){
				inspectedBufferView.byteOffset -= byteLength
			}
		}
		
		// Removing the unuse data in the buffer
		let base64Regexp = /^data:.*?;base64,/;
		assert(base64Regexp.test(buffer.uri), 'buffer sould be in base64')
		let bufferData = new Buffer(buffer.uri.replace(base64Regexp, ''), 'base64');
		bufferData = spliceBuffer(bufferData,startPos,byteLength);
		buffer.uri = "data:application/octet-stream;base64," + bufferData.toString('base64')
		
		// reducing the buffer & buffer view size
		buffer.byteLength -= byteLength;
		bufferView.byteLength -= byteLength;
		
		//console.log(accessor)
		//assert(shader.uri.substr(0,5) == "data:");
		
		delete gltf.accessors[accessorId];
	}
}