import { Vec3 } from "./glMath/vec3.ts";
import { Vec2 } from "./glMath/vec2.ts";


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
