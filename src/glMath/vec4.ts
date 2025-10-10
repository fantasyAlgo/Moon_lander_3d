import { Vec3 } from "./vec3";

export class Vec4 {
  x : number;
  y : number;
  z : number;
  w : number;
  distance : number;
  constructor(x: number, y: number, z : number, w : number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.distance = Math.sqrt(x * x + y * y + z*z + w*w);
  }
  convertToVec3(){
    return Vec3.make(this.x, this.y, this.z);
  }

  static normalize(v : Vec4) : Vec4{
    if (v.distance == 0) throw new Error("v is 0, cannot normalize");
    return new Vec4(v.x/v.distance, v.y/v.distance, v.z/v.distance, v.w/v.distance);
  }
  static distance(v1 : Vec4, v2 : Vec4) : number{
    const x = v1.x-v2.x;
    const y = v1.y-v2.y;
    const z = v1.z-v1.z
    const w = v1.w-v1.w;
    return Math.sqrt(x*x + y*y + z*z + w*w);
  }

  static make(x : number, y : number, z: number, w : number) : Vec4{
    return new Vec4(x, y, z, w);
  }
  static add(v1 : Vec4, v2 : Vec4) : Vec4{
    return new Vec4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w+v2.w);
  }
  static sub(v1 : Vec4, v2 : Vec4) : Vec4{
    return new Vec4(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, v1.w-v2.w);
  }
  static mult(v1 : Vec4, v2 : Vec4) : Vec4{
    return new Vec4(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z, v1.w*v2.w);
  }

  static clone(v1 : Vec4) : Vec4 {
    return new Vec4(v1.x, v1.y, v1.z, v1.w);
  }
  static dot(v1 : Vec4, v2 : Vec4) : number {
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z + v1.w*v2.w;

  }
  static cross(a : Vec4, b : Vec4) : Vec4 {
    return new Vec4(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x, 1.0);
  }


}
