import { Vec3 } from "../glMath/vec3.ts"
import { Vec2 } from "../glMath/vec2.ts"
import { CoupledVertex, webglVerticesFromCoupledVertices } from "./CoupledVertex.ts";


export class ModelData {
  constructor(
    public vertices : Float32Array,
    public indices : Uint16Array,
  ){}
}

export async function loadObj(url: string): Promise<ModelData> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  let text : string = await response.text();
  let lines : string[] = text.split(/\r?\n/);

  let vertices : Vec3[] = [];
  let normals : Vec3[] = [];
  let uvs : Vec2[] = [];


  let lst : CoupledVertex[] = [];
  let objIndices = Object;
  let indices : number[] = [];
  const WHITE_COLOR = Vec3.make(1.0, 1.0, 1.0);
  for (let line of lines){
    const words = line.split(" ");
    if (words[0] == "v"){
      vertices.push(Vec3.make(
        Number(words[1]),
        Number(words[2]),
        Number(words[3]),
      ));
    }
    if (words[0] == "vn"){
      normals.push(Vec3.make(
        -Number(words[1]),
        -Number(words[2]),
        -Number(words[3]),
      ));
    }
    if (words[0] == "vt"){
      uvs.push(Vec2.make(
        Number(words[1]),
        Number(words[2]),
      ));
    }
    if (words[0] == "f"){
      let indxs : string[] = words[1].split("/");
      if (words[1] in objIndices){
        indices.push(objIndices[words[1]]);
      }else{
        lst.push(new CoupledVertex(vertices[Number(indxs[0])-1], WHITE_COLOR, normals[Number(indxs[2])-1], uvs[Number(indxs[1])-1]));
        objIndices[words[1]] = lst.length-1;
        indices.push(lst.length-1);
      }

      if (words[2] in objIndices){
        indices.push(objIndices[words[2]]);
      }else{
        indxs = words[2].split("/");
        lst.push(new CoupledVertex(vertices[Number(indxs[0])-1], WHITE_COLOR, normals[Number(indxs[2])-1], uvs[Number(indxs[1])-1]));
        objIndices[words[2]] = lst.length-1;
        indices.push(lst.length-1);
      }


      if (words[3] in objIndices){
        indices.push(objIndices[words[3]]);
      }else {
        indxs = words[3].split("/");
        lst.push(new CoupledVertex(vertices[Number(indxs[0])-1], WHITE_COLOR, normals[Number(indxs[2])-1], uvs[Number(indxs[1])-1]));
        objIndices[words[3]] = lst.length-1;
        indices.push(lst.length-1);
      }
    }
  }
  console.log(vertices.length, normals.length, uvs.length, indices.length)

  return new ModelData(new Float32Array(webglVerticesFromCoupledVertices(lst)), new Uint16Array(indices));
}

