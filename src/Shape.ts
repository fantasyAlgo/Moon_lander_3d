import { Mat4x4 } from "./glMath/mat4x4";
import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";
import { ShaderProgram } from "./shaderProgram";

export class Shape {
  private matWorld : Mat4x4 = Mat4x4.identity();
  constructor(
    public pos : Vec3, 
    private scale : Vec3,
    private rotationAxis: Vec3,
    private rotationAngle: number,
    public readonly program : ShaderProgram,
    public vao: WebGLVertexArrayObject,
    public readonly numIndices: number){};

  draw(gl : WebGL2RenderingContext){
    const matWorldUniform = this.program.getUniform(gl, "matWorld")
    //console.log(this);
    let matWorld = Mat4x4.fromQuat(Quat.makeFromAxis(this.rotationAngle, this.rotationAxis));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));

    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }


}
