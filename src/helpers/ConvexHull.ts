import { Vec2 } from "../glMath/vec2";
import { Vec3 } from "../glMath/vec3";
import { CoupledVertex, webglVerticesFromCoupledVertices } from "./CoupledVertex";
import { ModelData } from "./objLoader";


class Face {
  n : Vec3;
  constructor(
    public a : Vec3,
    public b : Vec3,
    public c : Vec3,
    public i : number,
    public j : number,
    public k : number
  ){
    this.n = Vec3.cross(Vec3.sub(b, a), Vec3.sub(c, a));
  }
}


export function convexHull(vertices : Vec3[]){
  if (vertices.length < 3) throw new Error("Vertices length is less than 3");
  let faces : Face[] = [];
  let dead : boolean[][] = Array.from({ length: vertices.length }, () => Array(vertices.length).fill(true));

  const add_face = (a : number, b : number, c : number) => {
    faces.push(new Face(vertices[a], vertices[b], vertices[c], a, b, c));
    dead[a][b] = false;
    dead[b][c] = false;
    dead[c][a] = false;
  };
  add_face(0, 1, 2);
  add_face(0, 2, 1);
  for (let i = 3; i < vertices.length; i++) {
    const p : Vec3 = vertices[i];
    let cFaces : Face[] = [];
    for (let f of faces){
      if (Vec3.dot(Vec3.sub(p, f.a), f.n) > 0){
        dead[f.i][f.j] = true;
        dead[f.j][f.k] = true;
        dead[f.k][f.i] = true;
      }else cFaces.push(f);
    }
    faces = structuredClone(cFaces);
    for (let f of cFaces){
      const indices = [f.i, f.j, f.k];
      for (let j = 0; j < 3; j++){
        const a = indices[j];
        const b = indices[(j+1)%3];
        if (dead[b][a]){
          add_face(b, a, i)
        }
      }
    }
  }
  let indices : number[] = [];
  let mapV = new Map();
  const WHITE : Vec3 = Vec3.make(0.2, 0.2, 0.2);
  const vNull: Vec3 = Vec3.make(-1000, 100000, -1000);
  for (let f of faces){
    if (!mapV.has(f.i)){
      mapV.set(f.i, new CoupledVertex(
        f.a, WHITE, f.n, Vec2.make(f.a.x, f.a.z)
      ));
    }
    if (!mapV.has(f.j)){
      mapV.set(f.j, new CoupledVertex(
        f.b, WHITE, f.n, Vec2.make(f.b.x, f.b.z)
      ));
    }
    if (!mapV.has(f.k)){
      mapV.set(f.k, new CoupledVertex(
        f.c, WHITE, f.n, Vec2.make(f.c.x, f.c.z)
      ));
    }
    indices.push(...[f.i, f.j, f.k]);
  }
  let data : CoupledVertex[] = [];
  for (let i = 0; i < vertices.length; i++){
    if (mapV.has(i))
      data.push(mapV.get(i));
    else data.push(
      new CoupledVertex(vNull, vNull, vNull, Vec2.make(0,0))
    );
  }
  //console.log(data, indices)
  return new ModelData(webglVerticesFromCoupledVertices(data), new Uint16Array(indices));
}
