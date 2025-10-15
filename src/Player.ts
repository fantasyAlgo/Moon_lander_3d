import { Camera } from "./Camera";
import { Vec3 } from "./glMath/vec3";
import { ShaderProgram } from "./shaderProgram";
import { Shape } from "./Shape";

export class Player extends Shape {
  constructor(
    pos : Vec3, 
    scale : Vec3,
    rotationAxis: Vec3,
    rotationAngle: number,
    program : ShaderProgram,
    vao: WebGLVertexArrayObject,
    numIndices: number,
    public camera_dist : number,
  ){
      super(pos, scale, rotationAxis, rotationAngle, program, vao, numIndices);
    };

}
