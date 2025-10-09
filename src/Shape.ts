import { Mat4x4 } from "./glMath/mat4x4";
import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";

export class Shape {
  private matWorld : Mat4x4 = Mat4x4.identity();
  constructor(
    private pos : Vec3, 
    private scale : Vec3,
    private rotationAxis: Vec3,
    private rotationAngle: number,
    public readonly vao: WebGLVertexArrayObject,
    public readonly numIndices: number){};

  draw(gl : WebGL2RenderingContext, matWorldUniform : WebGLUniformLocation){
    //console.log(this);
    let matWorld = Mat4x4.fromQuat(Quat.makeFromAxis(this.rotationAngle, this.rotationAxis));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));

    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }


}
