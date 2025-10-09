import { Vec4 } from "./vec4";

export class Vec3 {
  x : number;
  y : number;
  z : number;
  distance : number;
  constructor(x: number, y: number, z : number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.distance = Math.sqrt(x * x + y * y + z*z);
  }
  convertVec4(){
    return new Vec4(this.x, this.y, this.z, 1.0);
  }

  static normalize(v : Vec3) : Vec3{
    if (v.distance == 0) throw new Error("v is 0, cannot normalize");
    return new Vec3(v.x/v.distance, v.y/v.distance, v.z/v.distance);
  }
  static distance(v1 : Vec3, v2 : Vec3) : number{
    const x = v1.x-v2.x;
    const y = v1.y-v2.y;
    const z = v1.z-v1.z
    return Math.sqrt(x*x + y*y + z*z);
  }

  static make(x : number, y : number, z: number) : Vec3{
    return new Vec3(x, y, z);
  }
  static add(v1 : Vec3, v2 : Vec3) : Vec3{
    return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }
  static sub(v1 : Vec3, v2 : Vec3) : Vec3{
    return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }
  static mult(v1 : Vec3, v2 : Vec3) : Vec3{
    return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
  }
  static multScalar(v1 : Vec3, s : number){
    return new Vec3(v1.x*s, v1.y*s, v1.z*s);
  }
  static div(v1 : Vec3, v2 : Vec3) : Vec3{
    if (v2.x == 0 || v2.y == 0 || v2.z == 0) throw new Error("v2 has some 0");
    return new Vec3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
  }


  static clone(v1 : Vec3) : Vec3 {
    return new Vec3(v1.x, v1.y, v1.z);
  }
  static dot(v1 : Vec3, v2 : Vec3) : number {
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;

  }
  static cross(a : Vec3, b : Vec3) : Vec3 {
    return new Vec3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
  }



}
