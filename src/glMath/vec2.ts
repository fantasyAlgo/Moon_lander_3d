
export class Vec2 {
  x : number;
  y : number;
  distance : number;
  constructor(x: number, y: number, ){
    this.x = x;
    this.y = y;
    this.distance = Math.sqrt(x * x + y * y );
  }

  clamp(xMin : number, xMax : number, yMin : number, yMax : number){
    this.x = this.x < xMin ? xMin : (this.x > xMax ? xMax : this.x);
    this.y = this.y < yMin ? yMin : (this.y > yMax ? yMax : this.y);
  }

  equal(v : Vec2) : boolean {
    const EPS : number = 0.001;
    return Math.abs(v.x-this.x) < EPS && Math.abs(v.y - this.y) < EPS;
  }
  copy(v : Vec2){
    this.x = v.x;
    this.y = v.y;
    this.distance = v.distance;
  }

  static normalize(v : Vec2) : Vec2{
    if (v.distance == 0) throw new Error("v is 0, cannot normalize");
    return new Vec2(v.x/v.distance, v.y/v.distance);
  }
  static distance(v1 : Vec2, v2 : Vec2) : number{
    const x = v1.x-v2.x;
    const y = v1.y-v2.y;
    return Math.sqrt(x*x + y*y );
  }

  static make(x : number, y : number) : Vec2{
    return new Vec2(x, y);
  }
  static add(v1 : Vec2, v2 : Vec2) : Vec2{
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
  }
  static sub(v1 : Vec2, v2 : Vec2) : Vec2{
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
  }
  static mult(v1 : Vec2, v2 : Vec2) : Vec2{
    return new Vec2(v1.x * v2.x, v1.y * v2.y);
  }
  static multScalar(v1 : Vec2, s : number){
    return new Vec2(v1.x*s, v1.y*s);
  }
  static div(v1 : Vec2, v2 : Vec2) : Vec2{
    if (v2.x == 0 || v2.y == 0) throw new Error("v2 has some 0");
    return new Vec2(v1.x / v2.x, v1.y / v2.y);
  }


  static clone(v1 : Vec2) : Vec2 {
    return new Vec2(v1.x, v1.y);
  }
  static dot(v1 : Vec2, v2 : Vec2) : number {
    return v1.x*v2.x + v1.y*v2.y;

  }


}
