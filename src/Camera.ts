import { Mat4x4 } from "./glMath/mat4x4";
import { Vec2 } from "./glMath/vec2";
import { Vec3 } from "./glMath/vec3";
import { Vec4 } from "./glMath/vec4";

const UP_VEC = Vec3.make(0, 1, 0);
export class Camera {
  pos : Vec3;
  forward : Vec3;
  perpective : Mat4x4;
  lookAtMatrix : Mat4x4;
  offset_pos : Vec3;

  constructor(initial_pos : Vec3, width : number, height : number, Fov : number, zNear : number, zFar : number){
    this.perpective = Mat4x4.perspective(height/width, Fov, zNear, zFar);
    this.pos = initial_pos;
    this.forward = Vec3.normalize(Vec3.make(0.5, 0.2, -1));
  }

  update(mouseMoveVec: Vec2, player_pos : Vec3, camera_dist: number, dt : number){
    const SENSIBILITY = 0.25;

    this.pos = Vec3.add(player_pos, Vec3.multScalar(this.forward, -camera_dist));
    this.forward = Vec3.normalize(Vec3.sub(player_pos, this.pos)); 

    const moveMatrix = Mat4x4.T(Mat4x4.LookAtRH(Vec3.make(0,0,0), this.forward, UP_VEC));
    //const newMoveVec : Vec4 = Mat4x4.multVec4(moveMatrix, Vec4.make(moveVec.x, moveVec.y, moveVec.z, 1.0));
    const newMouseVec : Vec4 = Mat4x4.multVec4(moveMatrix, Vec4.make(mouseMoveVec.x, mouseMoveVec.y, 0.0, 1.0));
    //this.pos = Vec3.add(this.pos, Vec3.multScalar(newMouseVec.convertToVec3(), dt));

    this.forward = Vec3.add(this.forward, Vec3.multScalar(newMouseVec.convertToVec3(), SENSIBILITY*dt*0.01));
    this.pos = Vec3.add(player_pos, Vec3.multScalar(this.forward, -camera_dist));

    const offset = Mat4x4.multVec4(moveMatrix, Vec4.make(0.3, 0.5, 0.0, 1.0));
    this.offset_pos = Vec3.add(this.pos, Vec3.make(offset.x, offset.y, offset.z));

    this.lookAtMatrix = this.getLookAt();
  }
  getLookAt(){
    return Mat4x4.LookAtRH(this.offset_pos, Vec3.add(this.offset_pos, this.forward), UP_VEC);
  }

}
