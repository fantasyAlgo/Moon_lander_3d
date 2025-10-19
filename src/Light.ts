import { Vec3 } from "./glMath/vec3";
import { ShaderProgram } from "./helpers/shaderProgram";
import { Shape } from "./Shape";

export class Light extends Shape {
  constructor(
    pos: Vec3,
    scale: Vec3,
    program: ShaderProgram,
    vao: WebGLVertexArrayObject,
    numIndices: number,
    public color: Vec3,
    vertices : Float32Array = new Float32Array([]),
  ) {
    super(pos, scale, program, vao, numIndices, vertices);
  }
}
