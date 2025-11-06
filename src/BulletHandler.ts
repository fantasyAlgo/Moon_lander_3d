import { Mat4x4 } from "./glMath/mat4x4";
import { Quat } from "./glMath/Quat";
import { Vec3 } from "./glMath/vec3";
import { Perlin3d } from "./helpers/Perlin3d";
import { ShaderProgram } from "./helpers/shaderProgram";
import { ParticleSystem } from "./ParticleSystem";
import { PerlinFloor } from "./PerlinFloor";
import { Shape } from "./Shape";


export class BulletHandler {
  static MAX_CUNCURRENT_BULLETS : number = 2;
  static MAX_TIME : number = 200;
  static BULLET_SIZE : Vec3 = Vec3.make(0.3, 0.3, 1.0);



  bullets : Bullet[] = [];
  constructor(
    public readonly program : ShaderProgram,   
    public vao : WebGLVertexArrayObject,
    public nIndices : number,
    public readonly vertices : Float32Array = new Float32Array([]),

  ){}

  destroy(i : number, particleSystem : ParticleSystem, time : number){
    for (let j = 0; j < 20; j++) 
        particleSystem.add(this.bullets[i].pos, Vec3.make(0,0,0), 1.0, time, 1, 2);
    this.bullets.splice(i, 1);
  }

  update(dt : number, perlin : Perlin3d, perlinFloor : PerlinFloor, particleSystem : ParticleSystem, time : number){
    for (let j = 0; j < this.bullets.length; j++) {
      const b = this.bullets[j];
      b.pos = Vec3.add(b.pos, Vec3.multScalar(b.vel, dt*0.5))
      if (time-b.time > BulletHandler.MAX_TIME){
        this.destroy(j--, particleSystem, time);
        continue;
      }
      if (perlinFloor.getValue(perlin, b.pos.x, b.pos.z) > b.pos.y) this.destroy(j--, particleSystem, time);
    }
  }

  add(pos : Vec3, forward : Vec3, current_time : number){
    this.bullets.push(
      new Bullet(pos, BulletHandler.BULLET_SIZE, this.program, this.vao, this.nIndices, this.vertices, forward)
    );
    this.bullets[this.bullets.length-1].vel = forward;
    this.bullets[this.bullets.length-1].time = current_time;
  }

  draw(gl : WebGL2RenderingContext){
    this.bullets.forEach((b) => {
      b.draw(gl);
      b.updateWorldData()
    });
  }
}

export class Bullet extends Shape{
  orthMat : Mat4x4;
  constructor(
    pos : Vec3, 
    scale : Vec3,
    readonly program : ShaderProgram,
    vao: WebGLVertexArrayObject,
    readonly numIndices: number,
    readonly vertices : Float32Array = new Float32Array([]),
    forward : Vec3,
  ){
    super(pos, scale, program, vao, numIndices, vertices);
    const posVel = Vec3.add(pos, Vec3.multScalar(forward, scale.x));
    this.orthMat = Mat4x4.rotFromPlane(pos, posVel, Vec3.make(0,0,0));
  }
  draw(gl : WebGL2RenderingContext){
    const matWorldUniform = this.program.getUniform(gl, "matWorld")
    //console.log(this);
    let matWorld = this.orthMat;
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));
    this.model = matWorld;

    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

}


