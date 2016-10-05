'use strict';

let assert = require('assert');

function assertEmpty(object){
	assert(object === undefined || object === null || Object.keys(object).length === 0)
}

function nameTransform(oldName,id){
	return "M" + id + "_" + oldName
}

function transformValue(object,key,index){
	object[key] = nameTransform(object[key],index);
}

function isEqual(obj1,obj2){
	if(!Array.isArray(obj1)){
		return obj1 == obj2
	}
	if(obj1.length !== obj2.length){
		return false;
	}
	for(let i in obj1){
		if (obj1[i] !== obj2[i]) 
			return false;
	}
	return true;
}

function isArrayEqual(arr){
	for(let i = 1 ; i < arr.length ; i++){
		if(!isEqual(arr[0],arr[i])){
			return false;
		}
	}
	return true;
}

module.exports = {
	accessors: function(data){
		let modelAccessors = {};
		for(let index in data){
			for(let accessonName in data[index]){
				let accessor = data[index][accessonName];
				transformValue(accessor,"bufferView",index);
				modelAccessors[nameTransform(accessonName,index)] = accessor;
			}
		}
		return modelAccessors;
	},
	animations: function(data){
		for(let index in data){
			assertEmpty(data[index]);
		}
		return {}
	},
	asset: function(data){
		return data[0]
	},
	bufferViews: function(data){
		let modelBufferViews = {};
		for(let index in data){
			for(let bufferViewName in data[index]){
				let bufferView = data[index][bufferViewName];
				transformValue(bufferView,"buffer",index)
				modelBufferViews[nameTransform(bufferViewName,index)] = bufferView;
			}
		}
		return modelBufferViews;
	},
	buffers: function(data){
		let modelBuffers = {};
		for(let index in data){
			for(let bufferName in data[index]){
				let buffer = data[index][bufferName];
				modelBuffers[nameTransform(bufferName,index)] = buffer;
			}
		}
		return modelBuffers;
	},
	images: function(data){
		let modelImages = {};
		for(let index in data){
			for(let imageName in data[index]){
				let image = data[index][imageName];
				modelImages[nameTransform(imageName,index)] = image;
			}
		}
		return modelImages;
	},
	materials: function(data){
		let modelMaterials = {};
		for(let index in data){
			for(let materialName in data[index]){
				let material = data[index][materialName];
				
				assert(material.instanceTechnique)
				assert(material.name)
				assert(material.instanceTechnique.technique)
				
				transformValue(material.instanceTechnique,"technique",index)
				transformValue(material,"name",index)
				if(typeof material.instanceTechnique.values.diffuse == "string"){
					transformValue(material.instanceTechnique.values,"diffuse",index)
				}
				
				modelMaterials[nameTransform(materialName,index)] = material;
			}
		}
		return modelMaterials;
	},
	meshes: function(data){
		let modelMeshes = {};
		for(let index in data){
			for(let meshName in data[index]){
				let mesh = data[index][meshName];
				
				assert(mesh.primitives.length === 1);
				assert(mesh.name);
				
				transformValue(mesh,"name",index);
				
				let primitive = mesh.primitives[0];
				transformValue(primitive,"indices",index);
				transformValue(primitive,"material",index);
				Object.keys(primitive.attributes).forEach(arrt => transformValue(primitive.attributes,arrt,index))
				
				modelMeshes[nameTransform(meshName,index)] = mesh;
			}
		}
		return modelMeshes;
	},
	nodes: function(data){
		let modelNodes = {};
		let first;
		let meshes = [];
		
		for(let index in data){
			assert(data[index].node_1);
			assert(data[index].sceneRoot);
			assert(data[index].sceneRoot.meshes);
			if(!first){
				first = data[index];
			} else {
				assert.deepEqual(first,data[index])
			}
			data[index].sceneRoot.meshes.forEach(mesh => meshes.push(nameTransform(mesh,index)))
		}
		modelNodes = first;
		
		modelNodes.sceneRoot.meshes = meshes;
		
		return modelNodes;
	},
	programs: function(data){
		let modelPrograms = {};
		for(let index in data){
			for(let programName in data[index]){
				let program = data[index][programName];
				transformValue(program,"fragmentShader",index);
				transformValue(program,"vertexShader",index);
				modelPrograms[nameTransform(programName,index)] = program;
			}
		}
		return modelPrograms;
	},
	samplers: function(data){
		let modelSamplers = {};
		for(let index in data){
			for(let samplerName in data[index]){
				let sampler = data[index][samplerName];
				modelSamplers[nameTransform(samplerName,index)] = sampler;
			}
		}
		return modelSamplers;
	},
	scene: function(data){
		let first;
		
		for(let index in data){
			if(!first){
				first = data[index];
			} else {
				assert.equal(first,data[index])
			}
		}
		return first;
	},
	scenes: function(data){
		let first;
		
		for(let index in data){
			if(!first){
				first = data[index];
			} else {
				assert.deepEqual(first,data[index])
			}
		}
		return first;
	},
	shaders: function(data){
		let modelShaders = {};
		for(let index in data){
			for(let shaderName in data[index]){
				let shader = data[index][shaderName];
				modelShaders[nameTransform(shaderName,index)] = shader;
			}
		}
		return modelShaders;
	},
	skins: function(data){
		for(let index in data){
			assertEmpty(data[index]);
		}
		return {}
	},
	techniques: function(data){
		let modelTechniques = {};
		for(let index in data){
			for(let techniqueName in data[index]){
				let technique = data[index][techniqueName];
				
				if(technique.pass){
					let pass = technique.passes[technique.pass]
					transformValue(pass.instanceProgram, "program", index)
				} else {
					// todo
				}
				
				modelTechniques[nameTransform(techniqueName,index)] = technique;
			}
		}
		return modelTechniques;
	},
	textures: function(data){
		let textureTechniques = {};
		for(let index in data){
			for(let textureName in data[index]){
				let texture = data[index][textureName];
				transformValue(texture, "sampler", index)					
				transformValue(texture, "source", index)					
				textureTechniques[nameTransform(textureName,index)] = texture;
			}
		}
		return textureTechniques;
	},
}