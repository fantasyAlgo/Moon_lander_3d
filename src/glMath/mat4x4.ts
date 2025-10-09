
import { Quat } from "./Quat";
import { Vec3 } from "./vec3";
import { Vec4 } from "./vec4";

export class Mat4x4 {
  values : Float32Array;
  constructor(values : Float32Array){
    if (values.length != 16)
      throw new Error(`Values length is different than 16: ${values.length}`);
    this.values = values;
  }
  get(i : number, j : number){
    return this.values[j*4 + i];
  }
  set(i : number, j : number, v : number){
    if (j*4 + i > 16) throw new Error("Index too high");
    this.values[j*4 + i] = v;
  }

  multScalar(n : number){
    for (let i = 0; i < 16; i++) 
      this.values[i] *= n;
  }


  static identity() : Mat4x4 {
    return new Mat4x4(new Float32Array([1, 0, 0, 0,
                                        0, 1, 0, 0,
                                        0, 0, 1, 0,
                                        0, 0, 0, 1]));
  }
  static create(val : number = 0) : Mat4x4 {
    return new Mat4x4(new Float32Array([
      val, val, val, val,
      val, val, val, val,
      val, val, val, val,
      val, val, val, val
    ]));
  }


  static add(m1 : Mat4x4, m2 : Mat4x4){
    let values : number[] = [];
    for (let i = 0; i < 16; i++) {
      const v : number = m1.values[i] + m2.values[i];
      values.push(v);
    }
    return new Mat4x4(new Float32Array(values));
  }
  static sub(m1 : Mat4x4, m2 : Mat4x4){
    let values : number[] = [];
    for (let i = 0; i < 16; i++) {
      const v : number = m1.values[i] - m2.values[i];
      values.push(v);
    }
    return new Mat4x4(new Float32Array(values));
  }
  static multMatrix(m1 : Mat4x4, m2 : Mat4x4){
    let values : number[] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        //const v = m1.get(i, 0)*m2.get(0, j) + m1.get(i, 1)*m2.get(1, j) + m1.get(i, 2)*m2.get(2, j) + m1.get(i, 3)*m2.get(3, j);
        const v = m1.get(0, i)*m2.get(j, 0) + m1.get(1, i)*m2.get(j, 1) + m1.get(2, i)*m2.get(j, 2) + m1.get(3, i)*m2.get(j, 3);
        values.push(v);
      }
    }
    return new Mat4x4(new Float32Array(values));
  }
  
  static multVec4(m1 : Mat4x4, vec : Vec4){
    let values : number[] = [];
    for (let i = 0; i < 4; i++) {
      const v = m1.get(i, 0)*vec.x + m1.get(i, 1)*vec.y + m1.get(i, 2)*vec.z + m1.get(i, 3)*vec.w;
      values.push(v);
    }
    return new Vec4(values[0], values[1], values[2], values[3]);
  }

  static LookAtRH(eye : Vec3, target : Vec3, up : Vec3) : Mat4x4{
    const zAxis = Vec3.normalize(Vec3.sub(eye, target));
    const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
    const yAxis = Vec3.cross(zAxis, xAxis);
    const values2 = new Float32Array([
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      -Vec3.dot(xAxis, eye), -Vec3.dot(yAxis, eye), -Vec3.dot(zAxis, eye), 1.0,
    ]);
    const values = new Float32Array([
      xAxis.x, xAxis.y, xAxis.z, 0.0, // X column
      yAxis.x, yAxis.y, yAxis.z, 0.0, // Y column
      zAxis.x, zAxis.y, zAxis.z, 0.0, // Z column
      -Vec3.dot(xAxis, eye), -Vec3.dot(yAxis, eye), -Vec3.dot(zAxis, eye), 1.0 // translation column
    ]);
    return new Mat4x4(values2);
  }
  static perspective(aspect_ratio : number, fov : number, zFar : number, zNear : number ) : Mat4x4 {
    const fovFactor : number = 1.0/Math.tan(fov/2.0);
    const normFactor : number = zFar/(zFar - zNear);
    const values = new Float32Array([
      fovFactor * aspect_ratio, 0, 0, 0,
      0, fovFactor, 0, 0,
      0, 0, normFactor, -1,
      0, 0, -normFactor * zNear, 0
    ]);

    return new Mat4x4(values);
  }

  static T( m :  Mat4x4) : Mat4x4{
    let values : number[] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const v : number = m.get(i, j);
        values.push(v)
      }
    }
    return new Mat4x4(new Float32Array(values));
  }

  static transpose( pos : Vec3) : Mat4x4 {
    return new Mat4x4(new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0,   1,   0,   0,
      0,   0,   1,   0,
      pos.x, pos.y, pos.z, 1.0
    ]));
  }
  static scale( scale: Vec3) : Mat4x4 {
    return new Mat4x4(new Float32Array([
      scale.x, 0,       0,       0,
      0,       scale.y, 0,       0,
      0,       0,       scale.z, 0,
      0,       0,       0,       1,
    ]));
  }




  static fromQuat( q : Quat ) : Mat4x4 {
    //console.log("quat: ", q);
    let x = q.vec.x;
    let y = q.vec.y;
    let z = q.vec.z;
    let w = q.r;

    let x2 = x + x;

    let y2 = y + y;

    let z2 = z + z;

    let xx = x * x2;

    let yx = y * x2;

    let yy = y * y2;

    let zx = z * x2;

    let zy = z * y2;

    let zz = z * z2;

    let wx = w * x2;

    let wy = w * y2;

    let wz = w * z2;
    return new Mat4x4(new Float32Array([
      1 - yy - zz, yx + wz, zx - wy, 0, 
      yx-wz, 1-xx-zz,  zy+wx, 0, 
      zx+wy, zy-wx, 1 - xx - yy,  0,
      0, 0, 0, 1
    ]));
  }





}
