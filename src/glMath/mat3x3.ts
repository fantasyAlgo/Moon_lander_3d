import { Vec3 } from "./vec3";

export class Mat3x3 {
  values : Float32Array;
  constructor(values : Float32Array){
    if (values.length != 9)
      throw new Error(`Values length is different than 9: ${values.length}`);
    this.values = values;
  }
  get(i : number, j : number){
    return this.values[i*3 + j];
  }
  set(i : number, j : number, v : number){
    if (i*3 + j > 9) throw new Error("Index too high");
    this.values[i*3 + j] = v;
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
        const v = m1.get(i, 0)*m2.get(0, j) + m1.get(i, 1)*m2.get(1, j) + m1.get(i, 2)*m2.get(2, j);
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



}
