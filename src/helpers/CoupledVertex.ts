import { Vec3 } from "../glMath/vec3.ts";
import { Vec2 } from "../glMath/vec2.ts";


export class CoupledFloorVertex {
  constructor(
    public pos : Vec3,
    public normal : Vec3,
  ){}
}

export function webglVerticesFromCoupledFloorVertices(vertices : CoupledFloorVertex[] ) : Float32Array {
  const lst : number[] = [];
  const size = vertices.length;
  for (let i = 0; i < size; i++) {
    lst.push(vertices[i].pos.x);
    lst.push(vertices[i].pos.y);
    lst.push(vertices[i].pos.z);

    lst.push(vertices[i].normal.x);
    lst.push(vertices[i].normal.y);
    lst.push(vertices[i].normal.z);
  }
  return new Float32Array(lst);
}

export class CoupledVertex {
  constructor(
    public pos : Vec3,
    public color : Vec3,
    public normal : Vec3,
    public uv : Vec2,
  ){}
}

export function webglVerticesFromCoupledVertices(vertices : CoupledVertex[] ) : Float32Array {
  const lst : number[] = [];
  const size = vertices.length;
  for (let i = 0; i < size; i++) {
    lst.push(vertices[i].pos.x);
    lst.push(vertices[i].pos.y);
    lst.push(vertices[i].pos.z);

    lst.push(vertices[i].color.x);
    lst.push(vertices[i].color.y);
    lst.push(vertices[i].color.z);

    lst.push(vertices[i].normal.x);
    lst.push(vertices[i].normal.y);
    lst.push(vertices[i].normal.z);

    lst.push(vertices[i].uv.x);
    lst.push(vertices[i].uv.y);
  }
  return new Float32Array(lst);
}
