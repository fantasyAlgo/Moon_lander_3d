import { Camera } from "./Camera";
import { Mat4x4 } from "./glMath/mat4x4";
import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";
import { Vec4 } from "./glMath/vec4";
import { ShaderProgram } from "./helpers/shaderProgram";
import { Shape } from "./Shape";

const UP_VEC = Vec3.make(0, 1, 0);
export class Player extends Shape {
  constructor(
    pos : Vec3, 
    scale : Vec3,
    program : ShaderProgram,
    vao: WebGLVertexArrayObject,
    numIndices: number,
    vertices : Float32Array,
    public camera_dist : number,
  ){
      super(pos, scale, program, vao, numIndices, vertices);
      const q1 = Quat.normalize(Quat.make(0.35, Vec3.make(43,542,232)));
      const q2 = Quat.normalize(Quat.make(364, Vec3.make(475,235,323)));
      console.log("check this: ", q1, q2, Quat.hamiltonProduct(q1, q2));

    };

  update(moveVec : Vec3, camera : Camera, dt : number){

    const sub = Vec3.sub(Vec3.make(-moveVec.z, 0.0, moveVec.x), this.rotationAxis);
    this.rotationAxis = Vec3.add(this.rotationAxis, Vec3.multScalar(sub, 0.005*dt));
    //this.rotationAxis = Vec3.multScalar(Vec3.make(-moveVec.z, 0.0, moveVec.x), 0.01*dt);
    if (this.rotationAxis.x == 0.0 && this.rotationAxis.y == 0.0 && this.rotationAxis.z == 0)
      this.rotationAxis = UP_VEC;

    const angle = Math.atan2(camera.forward.x, camera.forward.z);
    this.setRotation([Quat.makeFromAxis(angle, UP_VEC), Quat.makeFromAxis(Math.PI/2, this.rotationAxis)]);

    const perp : Vec3 = this.rot.rotate(Vec3.make(0, 1, 0));
    if (moveVec.y > 0)
      this.vel = Vec3.add(this.vel, Vec3.multScalar(perp, 0.0005*dt));


    this.vel.x *= 0.99;
    this.vel.z *= 0.99;
    const subY = Vec3.sub(Vec3.make(0.0, 1.0, 0.0), this.rotationAxis);
    if (moveVec.x == 0 && moveVec.z == 0)
      this.rotationAxis = Vec3.add(this.rotationAxis, Vec3.multScalar(subY, 0.005*dt));

    this.pos = Vec3.add(this.pos, Vec3.multScalar(this.vel, 2.0*dt) );
  }
}
