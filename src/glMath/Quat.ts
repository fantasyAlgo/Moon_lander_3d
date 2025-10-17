import { Vec3 } from "./vec3"

export class Quat {
  r: number;
  vec : Vec3;
  d : number;
  constructor(r : number, vector : Vec3){
    this.r = r;
    this.vec = vector;
    this.d = Math.sqrt(r*r + this.vec.x*this.vec.x + this.vec.y*this.vec.y + this.vec.z*this.vec.z);
  }
  normVectorPart(){
    this.vec = Vec3.normalize(this.vec);
  }

  conjugate() : Quat {
    return new Quat(this.r, Vec3.make(-this.vec.x, -this.vec.y, -this.vec.z));
  }

  rotate(v : Vec3) : Vec3{
    const q = Quat.make(0, v);
    const rotated = Quat.hamiltonProduct(Quat.hamiltonProduct(this, q), this.conjugate());
    return rotated.vec;
  }


  static make(r : number, vector : Vec3){
    return new Quat(r, vector);
  }
  static add(q1 : Quat, q2 : Quat) : Quat{
    return new Quat(q1.r + q2.r, Vec3.add(q1.vec, q2.vec));
  }

  static normalize(q1 : Quat) : Quat {
    if (q1.d == 0.0) throw new Error("quat distance is 0");
    return new Quat(q1.r/q1.d, Vec3.make(q1.vec.x/q1.d, q1.vec.y/q1.d, q1.vec.z/q1.d));
  }
  static hamiltonProduct(q1 : Quat, q2 : Quat) : Quat{
    const r = q1.r*q2.r - q1.vec.x*q2.vec.x - q1.vec.y*q2.vec.y - q1.vec.z*q2.vec.z;
    const vecX = q1.r*q2.vec.x + q1.vec.x*q2.r + q1.vec.y*q2.vec.z - q1.vec.z*q2.vec.y;
    const vecY = q1.r*q2.vec.y - q1.vec.x*q2.vec.z + q1.vec.y*q2.r + q1.vec.z*q2.vec.x;
    const vecZ = q1.r*q2.vec.z + q1.vec.x*q2.vec.y - q1.vec.y*q2.vec.x + q1.vec.z*q2.r;
    return new Quat(r, Vec3.make(vecX, vecY, vecZ));
  }
  static makeFromAxis(angle : number, axis : Vec3){ // The angle should be in radians
    const nAxis = Vec3.normalize(axis);
    const r = Math.cos(angle/2.0);
    let vec = Vec3.multScalar(nAxis, Math.sin(angle/2.0));
    return Quat.normalize(new Quat(r, vec));
  }




}
