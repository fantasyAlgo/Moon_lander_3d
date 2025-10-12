import { CoupledVertex, webglVerticesFromCoupledVertices } from "./CoupledVertex";
import { Mat4x4 } from "./glMath/mat4x4";
import { Vec3 } from "./glMath/vec3";
import { Perlin3d } from "./Perlin3d";

export const triangleVertices = new Float32Array([
  0.0, 0.5,
  -0.5, -0.5,
  0.5, -0.5
]);

export const rbgTriangleColors = new Uint8Array([
  255, 0, 0,
  0, 255, 0,
  0, 0, 255,
]);

export const fireyTriangleColors = new Uint8Array([
  229, 47, 15,
  246, 206, 29,
  233, 154, 26,
]);

export const CUBE_VERTICES = new Float32Array([
  // Front face (normal: 0, 0, 1)
  -1.0, -1.0, 1.0,     1, 0, 0,    0, 0, 1,  // 0
  1.0, -1.0, 1.0,      1, 0, 0,    0, 0, 1,   // 1
  1.0, 1.0, 1.0,       1, 0, 0,    0, 0, 1,    // 2
  -1.0, 1.0, 1.0,      1, 0, 0,    0, 0, 1,   // 3
  // Back face (normal: 0, 0, -1)
  -1.0, -1.0, -1.0,    1, 0, 0,    0, 0, -1, // 4
  -1.0, 1.0, -1.0,     1, 0, 0,    0, 0, -1,  // 5
  1.0, 1.0, -1.0,      1, 0, 0,    0, 0, -1,   // 6
  1.0, -1.0, -1.0,     1, 0, 0,    0, 0, -1,  // 7
  // Top face (normal: 0, 1, 0)
  -1.0, 1.0, -1.0,     0, 1, 0,    0, 1, 0,
  -1.0, 1.0, 1.0,      0, 1, 0,    0, 1, 0,
  1.0, 1.0, 1.0,       0, 1, 0,    0, 1, 0,
  1.0, 1.0, -1.0,      0, 1, 0,    0, 1, 0,
  // Bottom face (normal: 0, -1, 0)
  -1.0, -1.0, -1.0,    0, 1, 0,    0, -1, 0,
  1.0, -1.0, -1.0,     0, 1, 0,    0, -1, 0,
  1.0, -1.0, 1.0,      0, 1, 0,    0, -1, 0,
  -1.0, -1.0, 1.0,     0, 1, 0,    0, -1, 0,
  // Right face (normal: 1, 0, 0)
  1.0, -1.0, -1.0,     0, 0, 1,    1, 0, 0,
  1.0, 1.0, -1.0,      0, 0, 1,    1, 0, 0,
  1.0, 1.0, 1.0,       0, 0, 1,    1, 0, 0,
  1.0, -1.0, 1.0,      0, 0, 1,    1, 0, 0,
  // Left face (normal: -1, 0, 0)
  -1.0, -1.0, -1.0,    0, 0, 1,    -1, 0, 0,
  -1.0, -1.0, 1.0,     0, 0, 1,    -1, 0, 0,
  -1.0, 1.0, 1.0,      0, 0, 1,    -1, 0, 0,
  -1.0, 1.0, -1.0,     0, 0, 1,    -1, 0, 0,
]);

export const CUBE_INDICES = new Uint16Array([
  0, 1, 2,
  0, 2, 3, // front
  4, 5, 6,
  4, 6, 7, // back
  8, 9, 10,
  8, 10, 11, // top
  12, 13, 14,
  12, 14, 15, // bottom
  16, 17, 18,
  16, 18, 19, // right
  20, 21, 22,
  20, 22, 23, // left
]);

export const TABLE_VERTICES = new Float32Array([
  // Top face
  -10.0, 0.0, -10.0,   0.2, 0.2, 0.2,  0.0, 1.0, 0.0,   
  -10.0, 0.0, 10.0,    0.2, 0.2, 0.2,  0.0, 1.0, 0.0, 
  10.0, 0.0, 10.0,     0.2, 0.2, 0.2,  0.0, 1.0, 0.0, 
  10.0, 0.0, -10.0,    0.2, 0.2, 0.2,  0.0, 1.0, 0.0, 
]);
export const TABLE_INDICES = new Uint16Array([
  0, 1, 2,
  0, 2, 3, // top
]);


export function getFloorVertices(perlin3d : Perlin3d) : Float32Array {
  let lst : CoupledVertex[] = [];
  const W : number = perlin3d.grid_width;
  const H : number = perlin3d.grid_height;
  const fake_normal = Vec3.make(0, 1, 0);
  for (let i = H; i >= 0; i--) {
    for (let j = 0.0; j <= W; j++) {
      const height = perlin3d.get(i/20.0, j/20.0);
      const rValue = Math.random()/50.0;
      const color : Vec3 = Vec3.add(Vec3.make(0.2+height*0.01, 0.2+height*0.01, 0.2+height*0.01), Vec3.make(rValue, rValue, rValue));
      const pos : Vec3 = Vec3.make(2.0*j/H - 1.0, height, 2.0*i/W - 1.0);
      const vertex : CoupledVertex = new CoupledVertex(pos, color, fake_normal);
      lst.push(vertex);
    }
  }
  for (let i = 1; i < H-1; i++) {
    for (let j = 1; j < W-1; j++) {
      const up=      lst[(i-1)*H+j].pos.y;
      const down=    lst[(i-1)*H+j].pos.y;
      const left=    lst[i*H+j-1].pos.y;
      const right=   lst[i*H+j+1].pos.y;
      lst[i*H+j].normal = Vec3.normalize(Vec3.make(up - down, 2.0, left - right));
    }
  }
  console.log(lst.length)

  return webglVerticesFromCoupledVertices(lst);

}
export function getFloorIndices(grid_width : number, grid_height : number) : Uint16Array {
  const indices : number[] = [];
  const W : number = grid_width;
  const H : number = grid_height;
  for (let i = H; i >= 0; i--) {
    for (let j = 0; j < W; j++) {
      if (i != j){
        indices.push(i*H + j)
        indices.push((i+1)*H + j)
        indices.push((i+1)*H + j+1)
      }
      if (i-1 != j){
        indices.push(i*H + j);
        indices.push((i+1)*H + j+1);
        indices.push(i*H + j+1);
      }
    }
  }
  //console.log("max indices: ", Math.max(...indices));
  
  console.log(indices.slice(17*3, 19*3))
  return new Uint16Array(indices);
}
