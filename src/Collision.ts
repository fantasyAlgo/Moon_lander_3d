import { Vec2 } from "./glMath/vec2";
import { Vec3 } from "./glMath/vec3";
import { Vec4 } from "./glMath/vec4";
import { getFloorProjection } from "./helpers/CollisionHelpers";
import { Perlin3d } from "./helpers/Perlin3d";
import { PerlinFloor } from "./PerlinFloor";
import { Shape } from "./Shape";


const ORIGIN : Vec3 = Vec3.make(0,0,0);

export class Collision {
  collided : Boolean;
  normal : Vec3;
  depth : number;
  contact_points : Vec3[];

  constructor(collided : boolean, normal : Vec3 = Vec3.make(0,0,0), depth : number = 0.0){
    this.collided = collided;
    this.normal = normal;
    this.depth = depth;
    this.contact_points = [];
  }
  static supportPoint(d1 : Vec3[], d2 : Vec3[], dir : Vec3){
    return Vec3.sub(Shape.getSupportPoint(d1, dir),  Shape.getSupportPoint(d2, Vec3.multScalar(dir, -1.0)));
  }

  static checkShapeCollision(s1 : Shape, s2 : Shape){
    const data1 : Vec3[] = s1.modelData;
    const data2 : Vec3[] = s2.modelData;
    const c1 : Vec3 = s1.getCenter();
    const c2 : Vec3 = s2.getCenter();
    let dir : Vec3 = Vec3.sub(c1, c2);
    return Collision.GJK(data1, data2, dir);

  }
  static checkPerlinCollision(s1 : Shape, p : Perlin3d, pHandler : PerlinFloor){
    const data : Vec3[] = s1.modelData;
    const abab : Vec2[] = getFloorProjection(data);
    let floorPoints : Vec3[] = [];
    //console.log(abab, data);
    const f = (e) => { 
      floorPoints.push(Vec3.make(
        e.x, 
        pHandler.getValue(p, e.x, e.y),
        e.y
      ));
      floorPoints.push(Vec3.make(
        e.x, 
        -100.0,
        e.y
      ));

    }
    abab.forEach(f);
    //console.log(floorPoints);
    return Collision.GJK(data, floorPoints, Vec3.make(1, 0, 0));
  }



  static GJK(data1 : Vec3[], data2 : Vec3[], initial_dir : Vec3) : Collision {
    let dir : Vec3 = initial_dir;
    let p : Vec3;
    let simplex : Vec3[] = [Collision.supportPoint(data1, data2, dir)];
    dir = Vec3.normalize(Vec3.sub(ORIGIN, simplex[0]));
    let t = 0;
    while (t++ < 128){
      p = Collision.supportPoint(data1, data2, dir);
      if (Vec3.dot(p, dir) <= 0) return new Collision(false);
      simplex.push(p);
      if (Collision.handleSimplex(simplex, dir)){
        return new Collision(true);
      }
    }
    return new Collision(false);
  }




  static handleSimplex(simplex : Vec3[], dir : Vec3) : Boolean {
    if (simplex.length <= 1 || simplex.length > 4) throw new Error("GJK produced a simplex with an invalid number of vertices");

    if (simplex.length == 2) return Collision.setNewPoint(simplex, dir);
    else if (simplex.length == 3) return Collision.checkTriangle(simplex, dir);
    else return Collision.checkTetrahedron(simplex, dir);
  }


  static setNewPoint(simplex : Vec3[], dir : Vec3) : boolean {
    const A = simplex[0];
    const B = simplex[1];
    const ABP = Vec3.cross(A, B);
    const AO = Vec3.sub(ORIGIN, A);
    if (Vec3.dot(ABP, AO) > 0) dir.copy(ABP);
    else dir.copy(Vec3.multScalar(ABP, -1.0));
    return false;
  }

  static checkTriangle(simplex: Vec3[], dir: Vec3): boolean {
    if (simplex.length < 3) return false;
    
    const A = simplex[0];
    const B = simplex[1];
    const C = simplex[2];
    
    const CO = Vec3.normalize(Vec3.sub(ORIGIN, C));
    const BO = Vec3.normalize(Vec3.sub(ORIGIN, B));
    const AO = Vec3.normalize(Vec3.sub(ORIGIN, A));
    
    let BCPerp = Vec3.perp(C, B);
    if (Vec3.dot(BCPerp, Vec3.sub(A, C)) > 0) BCPerp = Vec3.multScalar(BCPerp, -1.0);
    
    let ACPerp = Vec3.perp(A, C);
    if (Vec3.dot(ACPerp, Vec3.sub(B, C)) > 0) ACPerp = Vec3.multScalar(ACPerp, -1.0);
    
    let ABPerp = Vec3.perp(B, A);
    if (Vec3.dot(ABPerp, Vec3.sub(C, A)) > 0) ABPerp = Vec3.multScalar(ABPerp, -1.0);
    
    const BC_CO = Vec3.dot(BCPerp, CO);
    const AC_CO = Vec3.dot(ACPerp, CO);
    const AC_AO = Vec3.dot(ACPerp, AO);
    const AB_AO = Vec3.dot(ABPerp, AO);
    const AB_BO = Vec3.dot(ABPerp, BO);
    const BC_BO = Vec3.dot(BCPerp, BO);
    
    if (AC_CO > 0 && BC_CO > 0) {
      simplex.length = 0;  // Clear the array
      simplex.push(C);      // Add the element
      dir.copy(CO);
      return false;
    } else if (AC_AO >= 0 && AB_AO >= 0) {
      simplex.length = 0;
      simplex.push(A);
      dir.copy(AO);
      return false;
    } else if (AB_BO >= 0 && BC_BO >= 0) {
      simplex.length = 0;
      simplex.push(B);
      dir.copy(BO);
      return false;
    } else if (BC_CO >= 0) {
      simplex.splice(0, 1);
      dir.copy(BCPerp);
      return false;
    } else if (AC_AO >= 0) {
      simplex.splice(1, 1);
      dir.copy(ACPerp);
      return false;
    } else if (AB_BO >= 0) {
      simplex.splice(2, 1);
      dir.copy(ABPerp);
      return false;
    }
    
    let abc = Vec3.cross(Vec3.sub(B, A), Vec3.sub(C, A));
    if (Vec3.dot(abc, BO) < 0) abc = Vec3.multScalar(abc, -1.0);
    dir.copy(abc);
    return false;
  }

  static checkTetrahedron(simplex: Vec3[], dir: Vec3): boolean {
    const A = simplex[0];
    const B = simplex[1];
    const C = simplex[2];
    const D = simplex[3];
    
    const AO = Vec3.multScalar(A, -1.0);
    const BO = Vec3.multScalar(B, -1.0);
    
    let ABDPerp = Vec3.cross(Vec3.sub(B, A), Vec3.sub(D, A));
    let ACDPerp = Vec3.cross(Vec3.sub(C, A), Vec3.sub(D, A));
    let BCDPerp = Vec3.cross(Vec3.sub(C, B), Vec3.sub(D, B));
    
    if (Vec3.dot(ABDPerp, Vec3.sub(C, A)) > 0) ABDPerp = Vec3.multScalar(ABDPerp, -1.0);
    if (Vec3.dot(ACDPerp, Vec3.sub(B, A)) > 0) ACDPerp = Vec3.multScalar(ACDPerp, -1.0);
    if (Vec3.dot(BCDPerp, Vec3.sub(A, B)) > 0) BCDPerp = Vec3.multScalar(BCDPerp, -1.0);
    
    if (Vec3.dot(ABDPerp, AO) > 0) {
      const trs = [A, B, D];
      Collision.checkTriangle(trs, dir);
      simplex.length = 0;
      simplex.push(...trs);
      return false;
    }
    
    if (Vec3.dot(ACDPerp, AO) > 0) {
      const trs = [A, C, D];
      Collision.checkTriangle(trs, dir);
      simplex.length = 0;
      simplex.push(...trs);
      return false;
    }
    
    if (Vec3.dot(BCDPerp, BO) > 0) {
      const trs = [B, C, D];
      Collision.checkTriangle(trs, dir);
      simplex.length = 0;
      simplex.push(...trs);
      return false;
    }
    
    return true;
  }



}
