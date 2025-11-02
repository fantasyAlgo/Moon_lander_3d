import { Vec3 } from "./vec3";

export class Mat3x3 {
  values : Float32Array;
  constructor(values : Float32Array){
    if (values.length != 9)
      throw new Error(`Values length is different than 9: ${values.length}`);
    this.values = values;
  }
  get(i : number, j : number){
    return this.values[j*3 + i];
  }
  set(i : number, j : number, v : number){
    if (j*3 + i > 9) throw new Error("Index too high");
    this.values[j*3 + i] = v;
  }

  multScalar(n : number){
    for (let i = 0; i < 9; i++) 
      this.values[i] *= n;
  }


  static identity() : Mat3x3 {
    return new Mat3x3(new Float32Array([1, 0, 0, 
                                        0, 1, 0, 
                                        0, 0, 1]));
  }
  static add(m1 : Mat3x3, m2 : Mat3x3){
    let values : number[] = [];
    for (let i = 0; i < 9; i++) {
      const v : number = m1.values[i] + m2.values[i];
      values.push(v);
    }
    return new Mat3x3(new Float32Array(values));
  }
  static sub(m1 : Mat3x3, m2 : Mat3x3){
    let values : number[] = [];
    for (let i = 0; i < 9; i++) {
      const v : number = m1.values[i] - m2.values[i];
      values.push(v);
    }
    return new Mat3x3(new Float32Array(values));
  }
  static multMatrix(m1 : Mat3x3, m2 : Mat3x3){
    let values : number[] = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        //const v = m1.get(i, 0)*m2.get(0, j) + m1.get(i, 1)*m2.get(1, j) + m1.get(i, 2)*m2.get(2, j) + m1.get(i, 3)*m2.get(3, j);
        const v = m1.get(0, i)*m2.get(j, 0) + m1.get(1, i)*m2.get(j, 1) + m1.get(2, i)*m2.get(j, 2) + m1.get(3, i)*m2.get(j, 3);
        values.push(v);
      }
    }
    return new Mat3x3(new Float32Array(values));
  }
  
  static multVec3(m1 : Mat3x3, vec : Vec3){
    let values : number[] = [];
    for (let i = 0; i < 3; i++) {
      const v = m1.get(i, 0)*vec.x + m1.get(i, 1)*vec.y + m1.get(i, 2)*vec.z;
      values.push(v);
    }
    return new Vec3(values[0], values[1], values[2]);
  }
  static transpose( m :  Mat3x3) : Mat3x3{
    let values : number[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const v : number = m.get(i, j);
        values.push(v)
      }
    }
    return new Mat3x3(new Float32Array(values));
  }

  static makeFromV(v1 : Vec3, v2 : Vec3, v3 : Vec3){
    const values = [
      v1.x, v2.x, v3.x,
      v1.y, v2.y, v3.y,
      v1.z, v2.z, v3.z
    ];
    return new Mat3x3(new Float32Array(values));
  }


}
