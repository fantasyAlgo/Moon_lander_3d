import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";
import { Vec2 } from "./glMath/vec2";

import { Perlin3d } from "./helpers/Perlin3d";
import { ShaderProgram } from "./helpers/shaderProgram";
import { PerlinFloor } from "./PerlinFloor";
import { Shape } from "./Shape";
import { Mat4x4 } from "./glMath/mat4x4";

class PointEntity {
  constructor(
    public pos : Vec3 = Vec3.make(0,0,0),
    public vel : Vec3 = Vec3.make(0,0,0),
  ){}
  update(dt : number, GRAVITY : number = 2.0){
    this.pos = Vec3.add(this.pos, Vec3.multScalar(this.vel, dt));
  }
}

class Constraint {
  constructor(
    public p1 : PointEntity,
    public p2 : PointEntity,
    public d : number,
  ){}
  solve(dt : number) : boolean {
    const EPS = 0.001;
    const diff = Vec3.distance(this.p2.pos, this.p1.pos) - this.d;
    const dir : Vec3 =  Vec3.multScalar(Vec3.normalize(Vec3.sub(this.p2.pos, this.p1.pos)), 
                                        diff);
    this.p1.pos = Vec3.add(this.p1.pos, Vec3.multScalar(dir, dt));
    this.p2.pos = Vec3.sub(this.p2.pos, Vec3.multScalar(dir, dt));
    return diff > EPS;
  }
}



const FLOOR_DIST = 1.0;
const SPRING_FORCE = 0.7;
const DAMPING_FORCE = 0.05;
const UP_VEC : Vec3 = Vec3.make(0, 1, 0);

export class Rover extends Shape{
  pointTopLeft :     PointEntity = new PointEntity();
  pointTopRight :    PointEntity = new PointEntity();
  pointBottomLeft :  PointEntity = new PointEntity();
  pointBottomRight : PointEntity = new PointEntity();

  shapes : Shape[] = [];
  constraints : Constraint[];

  diagonal : number;
  target : Vec2 = Vec2.make(0,0); 
  spin : number = 0.0;


  constructor(
    pos : Vec3, 
    scale : Vec3,
    readonly program : ShaderProgram,
    vao: WebGLVertexArrayObject,
    readonly numIndices: number,
    readonly vertices : Float32Array = new Float32Array([]),
  ){
      super(pos, scale, program, vao, numIndices, vertices);
      this.diagonal = Math.SQRT2*this.scale.x;

      //super(pos, scale, program, vao, numIndices, vertices);
      this.pointTopLeft.pos = Vec3.add(pos, Vec3.mult(scale, Vec3.make(0.5, -0.5, 0.5)));
      this.pointTopRight.pos = Vec3.add(pos, Vec3.mult(scale, Vec3.make(-0.5, -0.5, 0.5)));
      this.pointBottomLeft.pos = Vec3.add(pos, Vec3.mult(scale, Vec3.make(0.5, -0.5, -0.5)));
      this.pointBottomRight.pos = Vec3.add(pos, Vec3.mult(scale, Vec3.make(-0.5, -0.5, -0.5)));

      this.shapes.push(new Shape(this.pointTopLeft.pos,      Vec3.multScalar(scale, 0.1), program, vao, numIndices, vertices));
      this.shapes.push(new Shape(this.pointTopRight.pos,     Vec3.multScalar(scale, 0.1), program, vao, numIndices, vertices));
      this.shapes.push(new Shape(this.pointBottomLeft.pos,   Vec3.multScalar(scale, 0.1), program, vao, numIndices, vertices));
      this.shapes.push(new Shape(this.pointBottomRight.pos,  Vec3.multScalar(scale, 0.1), program, vao, numIndices, vertices));

      this.constraints = [];
      this.constraints.push(new Constraint(this.pointTopRight, this.pointTopLeft, this.scale.x));
      this.constraints.push(new Constraint(this.pointTopRight, this.pointBottomRight, this.scale.x));

      this.constraints.push(new Constraint(this.pointTopLeft, this.pointBottomLeft, this.scale.x));
      this.constraints.push(new Constraint(this.pointBottomLeft, this.pointBottomRight, this.scale.x));

      this.constraints.push(new Constraint(this.pointBottomLeft, this.pointTopRight, this.diagonal));
      this.constraints.push(new Constraint(this.pointBottomRight, this.pointTopLeft, this.diagonal));

      this.target = Vec2.multScalar(Vec2.make(1.0 - 2.0*Math.random(), 1.0 - 2.0*Math.random()), 500.0);
  }

  applySpring(from : PointEntity, to : Vec3, force_distance : Vec3, SPRING_FORCE : number, DAMPING_FORCE : number, dt : number){
    let pos : Vec3 = Vec3.add(to, force_distance);

    const dir : Vec3 =  Vec3.sub(pos, from.pos);
    const spring_force_r : Vec3 = Vec3.sub(Vec3.multScalar(dir, SPRING_FORCE*2.0), Vec3.multScalar(from.vel, DAMPING_FORCE));
    spring_force_r.multScalar(dt);
    //console.log("diff: ", from.pos, pos, " | ", spring_force_r);
    from.vel = Vec3.add(from.vel, spring_force_r);
  }

  applySpringDist(from : PointEntity, to : Vec3, force_distance : number, SPRING_FORCE : number, DAMPING_FORCE : number, dt : number){
    const dir : Vec3 =  Vec3.multScalar(Vec3.normalize(Vec3.sub(to, from.pos)), Vec3.distance(to, from.pos) - force_distance);
    const spring_force_r : Vec3 = Vec3.sub(Vec3.multScalar(dir, SPRING_FORCE*2.0), Vec3.multScalar(from.vel, DAMPING_FORCE));
    spring_force_r.multScalar(dt);
    //console.log("diff: ", from.pos, to, " | ", spring_force_r);
    from.vel = Vec3.add(from.vel, spring_force_r);
  }
  applySpringOnAxis(from : PointEntity, to : Vec3, force_distance : number, SPRING_FORCE : number, DAMPING_FORCE : number, dt : number, axis : number, notPushBottom : boolean = false){
    if (axis == 0){
      const dir : number = Math.sign(to.x-from.pos.x)*(Math.abs(to.x-from.pos.x) - force_distance)      
      const spring_force_r : number = dir*SPRING_FORCE - from.vel.x*DAMPING_FORCE;
      from.vel.x += spring_force_r*dt;
    }
    if (axis == 1){
      const dir : number = Math.sign(to.y-from.pos.y)*(Math.abs(to.y-from.pos.y) - force_distance)      
      const spring_force_r : number = dir*SPRING_FORCE - from.vel.y*DAMPING_FORCE;
      if (notPushBottom && spring_force_r < 0){
        //this.vel.y += (spring_force_r*0.4)*dt;
        //return;
      }
      from.vel.y += spring_force_r*dt;
    }
    if (axis == 2){
      const dir : number = Math.sign(to.z-from.pos.z)*(Math.abs(to.z-from.pos.z) - force_distance)      
      const spring_force_r : number = dir*SPRING_FORCE - from.vel.z*DAMPING_FORCE;
      from.vel.z += spring_force_r*dt;
    }
  }


  applyPerlin(point : PointEntity, perlinNoise : PerlinFloor, perlin : Perlin3d, dt : number){
    const value = perlinNoise.getValue(perlin, point.pos.x, point.pos.z) + FLOOR_DIST;
    this.applySpringOnAxis(point, Vec3.make(point.pos.x, value, point.pos.z), 0.0, 2.0*SPRING_FORCE, DAMPING_FORCE*4.0, dt, 1, true);
    if (point.pos.y < value-FLOOR_DIST && point.vel.y < 0){
      point.pos.y = value - FLOOR_DIST;
    }
  }

  update(dt : number, perlinNoise : PerlinFloor, perlin : Perlin3d){
    //this.pointTopRight.vel.z += dt*0.005;
    let dir = Vec2.sub(this.target, Vec2.make(this.pointTopLeft.pos.x, this.pointTopLeft.pos.z));
    const dist = dir.distance;
    dir = Vec2.multScalar(Vec2.normalize(dir), dt);
    this.pointTopLeft.vel = Vec3.add(this.pointTopLeft.vel, Vec3.make(dir.x, 0.0, dir.y));
    this.pointTopRight.vel = Vec3.add(this.pointTopRight.vel, Vec3.make(dir.x, 0.0, dir.y));

    this.pointTopRight.vel.clamp(-2, 2, -100, 100, -2, 2);
    this.pointTopLeft.vel.clamp(-2, 2, -100, 100, -2, 2);

    if (dist < 1)
      this.target = Vec2.multScalar(Vec2.make(1.0 - 2.0*Math.random(), 1.0 - 2.0*Math.random()), 500.0);


    if (this.pointTopLeft.vel.z > 2.0) this.pointTopLeft.vel.z = 2.0;
    if (this.pointTopRight.vel.z > 2.0) this.pointTopLeft.vel.z = 2.0;

    this.applyPerlin(this.pointTopRight, perlinNoise, perlin, dt);
    this.applyPerlin(this.pointTopLeft, perlinNoise, perlin, dt);
    this.applyPerlin(this.pointBottomRight, perlinNoise, perlin, dt);
    this.applyPerlin(this.pointBottomLeft, perlinNoise, perlin, dt);
    let toApply = true;
    while (toApply){
      toApply = false;
      this.constraints.forEach((c : Constraint) => toApply ||= c.solve(dt));
    }


    this.pointTopRight.update(dt);
    this.pointTopLeft.update(dt);
    this.pointBottomRight.update(dt);
    this.pointBottomLeft.update(dt);

    this.shapes[0].pos = this.pointTopLeft.pos;
    this.shapes[1].pos = this.pointTopRight.pos;
    this.shapes[2].pos = this.pointBottomLeft.pos;
    this.shapes[3].pos = this.pointBottomRight.pos;
    /*

    this.rotationAxis = UP_VEC; Vec3.sub(this.pointTopRight.pos, this.pointTopLeft.pos);
    const yAngle = -Math.atan2(this.pointTopLeft.pos.z-this.pointTopRight.pos.z, this.pointTopLeft.pos.x - this.pointTopRight.pos.x);

    const topBottomD = Vec2.distance(Vec2.make(this.pointTopLeft.pos.x, this.pointTopLeft.pos.z), Vec2.make(this.pointBottomLeft.pos.x, this.pointBottomLeft.pos.z));
    const zAngle = Math.atan2(this.pointTopLeft.pos.y - this.pointBottomLeft.pos.y, topBottomD);

    const leftRightD = Vec2.distance(Vec2.make(this.pointTopLeft.pos.x, this.pointTopLeft.pos.z), Vec2.make(this.pointTopLeft.pos.x, this.pointTopLeft.pos.z));
    const xAngle = Math.atan2(this.pointTopLeft.pos.y - this.pointTopRight.pos.y, leftRightD);


    this.spin += dt;
    this.setRotation([
      Quat.makeFromAxis(yAngle - Math.PI/2 , UP_VEC), 
      Quat.makeFromAxis(zAngle, Vec3.make(0, 0, 1)), 
      Quat.makeFromAxis(xAngle, Vec3.make(1, 0, 0))
    ]);
    */


    this.pos = Vec3.make(0,0,0);
    this.pos.copy(this.pointBottomLeft.pos);
    //Vec3.average([this.pointTopLeft.pos, this.pointBottomLeft.pos, this.pointTopRight.pos, this.pointBottomRight.pos]);
  }
  drawSmallOnes(gl : WebGL2RenderingContext){
    this.shapes.forEach((e : Shape) => e.draw(gl));
  }

  draw(gl : WebGL2RenderingContext){
    const matWorldUniform = this.program.getUniform(gl, "matWorld")
    //console.log(this);
    let matWorld = Mat4x4.rotFromPlane(this.pointTopLeft.pos, this.pointTopRight.pos, this.pointBottomLeft.pos);
    //console.log(matWorld.values)
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));
    this.model = matWorld;

    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }



}
