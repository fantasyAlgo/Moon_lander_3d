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


export function getFloorVertices(perlin3d : Perlin3d){
}
export function getFloorIndices(perlin3d : Perlin3d){
}
