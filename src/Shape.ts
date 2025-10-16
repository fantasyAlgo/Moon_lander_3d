import { Mat4x4 } from "./glMath/mat4x4";
import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";
import { ShaderProgram } from "./shaderProgram";

export class Shape {
  public vel : Vec3 = Vec3.make(0,0,0);
  public tForce : Vec3 = Vec3.make(0,0,0);
  public mass : number = 1.0;
  public rot : Quat;
  public rotationAxis : Vec3 = Vec3.make(0, 1, 0);
  public rotationAngle : number = 0.0;

  constructor(
    public pos : Vec3, 
    private scale : Vec3,
    public readonly program : ShaderProgram,
    public vao: WebGLVertexArrayObject,
    public readonly numIndices: number){
      this.rot = Quat.makeFromAxis(0, Vec3.make(0, 1, 0));
    };
  
  setRotation(quaterions : Quat[]){ // Set a new rotation by multiplying a sequence of quaterions
    if (quaterions.length == 0) return;
    let q = quaterions[0];
    for (let i = 1; i < quaterions.length; i++) 
      q = Quat.hamiltonProduct(q, quaterions[i]);
    this.rot = Quat.normalize(q);
  }

  draw(gl : WebGL2RenderingContext){
    const matWorldUniform = this.program.getUniform(gl, "matWorld")
    //console.log(this);
    let matWorld = Mat4x4.fromQuat(this.rot);
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));

    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }


}
