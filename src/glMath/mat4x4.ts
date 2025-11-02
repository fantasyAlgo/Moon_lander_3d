
import { Mat3x3 } from "./mat3x3";
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


  determinant( i : number = 0, jNotToCheck : number[] = []) : number{
    if (i >= 4) return 1.0;

    let det = 0;
    for (let k = 0; k < 4; k++) {
      if (!jNotToCheck.includes(k)){
        const v = this.get(k, i)*this.determinant(i+1, [k, ...jNotToCheck]);
        det = det + ((i+k)%2 == 0 ? 1 : -1)*v;
      }
    }
    return det;
  }
  copy(){
    let m = Mat4x4.identity();
    for (let i = 0; i < 16; i++) 
      m.values[i] = this.values[i];
    return m;
  }


  static identity( v : number = 1.0) : Mat4x4 {
    return new Mat4x4(new Float32Array([v, 0, 0, 0,
                                        0, v, 0, 0,
                                        0, 0, v, 0,
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
    return new Mat4x4(values2);
  }
  static LookAtRHInv(eye : Vec3, target : Vec3, up : Vec3) : Mat4x4{
    const zAxis = Vec3.normalize(Vec3.sub(eye, target));
    const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
    const yAxis = Vec3.cross(zAxis, xAxis);
    const values2 = new Float32Array([
      xAxis.x, xAxis.y, xAxis.z, 0,
      yAxis.x, yAxis.y, yAxis.z, 0,
      zAxis.x, zAxis.y, zAxis.z, 0,
      Vec3.dot(xAxis, eye), Vec3.dot(yAxis, eye), Vec3.dot(zAxis, eye), 1.0,
    ]);
    return new Mat4x4(values2);
  }




  static perspective(aspect_ratio : number, fov : number, zNear : number, zFar : number ) : Mat4x4 {
    const fovFactor : number = 1.0/Math.tan(fov/2.0);
    const normFactor : number = 1.0/(zFar - zNear);
    const values = new Float32Array([
      fovFactor / aspect_ratio, 0, 0, 0,
      0, fovFactor, 0, 0,
      0, 0, (zFar+zNear)*normFactor, -1,
      0, 0, 2*zFar*zFar*normFactor, 0
    ]);
    const values2 = new Float32Array([
      fovFactor * aspect_ratio, 0, 0, 0,
      0, fovFactor, 0, 0,
      0, 0, normFactor, -1,
      0, 0, -normFactor * zNear, 0
    ]);

    return new Mat4x4(values2);
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
      1-yy-zz, yx + wz, zx - wy, 0, 
      yx-wz, 1-xx-zz,  zy+wx, 0, 
      zx+wy, zy-wx, 1 - xx - yy,  0,
      0, 0, 0, 1
    ]));
  }


  inverse() : Mat4x4 {
    let a00 = this.values[0],

      a01 = this.values[1],

      a02 = this.values[2],

      a03 = this.values[3];

    let a10 = this.values[4],

      a11 = this.values[5],

      a12 = this.values[6],

      a13 = this.values[7];

    let a20 = this.values[8],

      a21 = this.values[9],

      a22 = this.values[10],

      a23 = this.values[11];

    let a30 = this.values[12],

      a31 = this.values[13],

      a32 = this.values[14],

      a33 = this.values[15];

    let b00 = a00 * a11 - a01 * a10;

    let b01 = a00 * a12 - a02 * a10;

    let b02 = a00 * a13 - a03 * a10;

    let b03 = a01 * a12 - a02 * a11;

    let b04 = a01 * a13 - a03 * a11;

    let b05 = a02 * a13 - a03 * a12;

    let b06 = a20 * a31 - a21 * a30;

    let b07 = a20 * a32 - a22 * a30;

    let b08 = a20 * a33 - a23 * a30;

    let b09 = a21 * a32 - a22 * a31;

    let b10 = a21 * a33 - a23 * a31;

    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant

    let det =

      b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return Mat4x4.identity(1);
    }

    det = 1.0 / det;
    let out : Mat4x4 = Mat4x4.identity();
    out.values[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out.values[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out.values[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out.values[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out.values[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out.values[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out.values[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out.values[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out.values[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out.values[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out.values[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out.values[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out.values[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out.values[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out.values[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out.values[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  }
  static makeFromMat3(m : Mat3x3) : Mat4x4 {
    const values : Float32Array = m.values;
    const nValues : number[] = [];
    let it = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++){
        if (i != 3 && j != 3) nValues.push(values[it++]);
        else nValues.push(0.0);
      }
    }
    nValues[15] = 1.0;
    return new Mat4x4(new Float32Array(nValues));
  }

  static rotFromPlane(v1 : Vec3, v2 : Vec3, v3 : Vec3) : Mat4x4{
    const size = Vec3.distance(v1, v2);
    const ul = Vec3.normalize(Vec3.sub(v2, v1));
    let vl = Vec3.normalize(Vec3.sub(v3, v1));
    const wl = Vec3.normalize(Vec3.cross(ul, vl));
    if (Vec3.dot(wl, Vec3.make(0, 1, 0)) < 0) wl.multScalar(-1.0);
    const nvl = Vec3.normalize(Vec3.cross(ul, wl));
    if (Vec3.dot(vl, nvl) < 0) vl = Vec3.multScalar(nvl, -1.0);
    else vl = nvl;

    let m3p = Mat3x3.makeFromV(vl, wl, ul);
    m3p = Mat3x3.transpose(m3p);
    let R = Mat4x4.makeFromMat3(m3p);
    R = Mat4x4.multMatrix(R, Mat4x4.scale(Vec3.make(size, size, size)));
    return R;
  }


}
