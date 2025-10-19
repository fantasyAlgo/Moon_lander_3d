import { Mat4x4 } from "./glMath/mat4x4";
import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";
import { Vec4 } from "./glMath/vec4";
import { ShaderProgram } from "./helpers/shaderProgram";

export class Shape {
  public model : Mat4x4 = Mat4x4.identity();
  public vel : Vec3 = Vec3.make(0,0,0);
  public tForce : Vec3 = Vec3.make(0,0,0);
  public mass : number = 1.0;
  public rot : Quat;
  public rotationAxis : Vec3 = Vec3.make(0, 1, 0);
  public rotationAngle : number = 0.0;
  public modelData : Vec3[] = [];

  constructor(
    public pos : Vec3, 
    private scale : Vec3,
    public readonly program : ShaderProgram,
    public vao: WebGLVertexArrayObject,
    public readonly numIndices: number,
    public readonly vertices : Float32Array = new Float32Array([]),
  ){
      this.rot = Quat.makeFromAxis(0, Vec3.make(0, 1, 0));
    };
  
  setRotation(quaterions : Quat[]){ // Set a new rotation by multiplying a sequence of quaterions
    if (quaterions.length == 0) return;
    let q = quaterions[0];
    for (let i = 1; i < quaterions.length; i++) 
      q = Quat.hamiltonProduct(q, quaterions[i]);
    this.rot = Quat.normalize(q);
  }

  updateWorldData() : void {
    let result : Vec3[] = [];
    for (let i = 0; i < this.vertices.length; i+=11) {
      const v : Vec4 = Vec4.make(this.vertices[i], this.vertices[i+1], this.vertices[i+2], 1.0);
      const rV : Vec4 = Mat4x4.multVec4(this.model, v);
      result.push(rV.convertToVec3());
    }
    this.modelData = result;
  }

  draw(gl : WebGL2RenderingContext){
    const matWorldUniform = this.program.getUniform(gl, "matWorld")
    //console.log(this);
    let matWorld = Mat4x4.fromQuat(this.rot);
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));
    this.model = matWorld;

    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  getCenter(){
    let sum : Vec3 = Vec3.make(0,0,0);
    this.modelData.forEach(x => {
      sum = Vec3.add(sum, x);
    });
    return Vec3.multScalar(sum, 1.0/this.modelData.length);
  }

  static getSupportPoint(s : Vec3[], dir : Vec3){
    let bV : Vec3 = Vec3.make(0,0,0);
    let bestDot : number = -Infinity;
    for (let i = 0; i < s.length; i++) {
      const d = Vec3.dot(s[i], dir);
      if (d > bestDot){
        bV = s[i];
        bestDot = d;
      }
    }
    return bV;
  }


}
