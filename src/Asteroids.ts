import { BulletHandler } from "./BulletHandler";
import { Collision } from "./Collision";
import { Vec2 } from "./glMath/vec2";
import { Vec3 } from "./glMath/vec3";
import { convexHull } from "./helpers/ConvexHull";
import { webglVerticesFromCoupledVertices } from "./helpers/CoupledVertex";
import { create3dPosColorInterleavedVao, createBufferData, createStaticIndexBuffer, makeRandomMatrix } from "./helpers/glHelpers";
import { ModelData } from "./helpers/objLoader";
import { Perlin3d } from "./helpers/Perlin3d";
import { ShaderProgram } from "./helpers/shaderProgram";
import { ParticleSystem } from "./ParticleSystem";
import { PerlinFloor } from "./PerlinFloor";
import { Player } from "./Player";
import { Shape } from "./Shape";


enum AsteroidCollision {
  NOTHING,
  PLAYER,
  FLOOR,
  BULLET
}



function makeAsteroidShape (n_vertices : number) : ModelData {
  const f = () : Vec3 => Vec3.make(0.5 - Math.random(), 0.5 - Math.random(), 0.5 - Math.random()); 
  let vertices : Vec3[] = [];
  const N = n_vertices;
  for (let i = 0; i < N; i++) {
    let y = 1 - (2.0*i)/(N-1);
    const radius = Math.sqrt(1 - y*y);
    const theta = i*2.39996322972865332;
    let x = Math.cos(theta)*radius;
    let z = Math.sin(theta)*radius;
    vertices.push(Vec3.add(Vec3.make(x, y, z), Vec3.multScalar(f(), 0.2)));
  }
  //console.log("N: ", n_vertices, " | ", vertices.length);
  const data : ModelData = convexHull(vertices);
  return data;
}



function makeAsteroid(gl : WebGL2RenderingContext, n_vertices : number, shader : ShaderProgram) : [WebGLVertexArrayObject, number, number[]] {
  const data : ModelData = makeAsteroidShape(n_vertices);
  let vPosData : number[] = [];
  const vNull: Vec3 = Vec3.make(-1000, 100000, -1000);
  for (let i = 0; i < data.vertices.length; i+=11){
    if (data.vertices[i] != vNull.x)
      vPosData.push(...[data.vertices[i], data.vertices[i+1], data.vertices[i+2]]);
  }
  if (vPosData.length < 3) throw new Error("vertices length is less than 3");

  const buffer = createBufferData(gl, data.vertices, gl.STATIC_DRAW);
  const indices = createStaticIndexBuffer(gl, data.indices);
  shader.bind(gl);

  const posAttrib =     shader.getAttrib(gl, "vPos");
  const colorAttrib =   shader.getAttrib(gl, "vColor");
  const normalAttrib =  shader.getAttrib(gl, "vNormal");
  const uvAttrib =      shader.getAttrib(gl, "vUV");
  const vao = create3dPosColorInterleavedVao(gl, buffer, indices, posAttrib, colorAttrib, normalAttrib, uvAttrib);

  return [vao, data.indices.length, vPosData];
}


export class AsteroidHandler {
  vaos : WebGLVertexArrayObject[] = [];
  nIndicesVao : number[] = [];
  verticesVao : number[][] = [];


  shader : ShaderProgram;

  asteroids : Shape[] = [];
  constructor(gl : WebGL2RenderingContext, shader: ShaderProgram, nPredefinedShapes : number){
    this.shader = shader;
    for (let i = 0; i < nPredefinedShapes; i++) {
      const s : [WebGLVertexArrayObject, number, number[]]= makeAsteroid(gl, (8+Math.random()*8), shader);
      this.vaos.push(s[0]);
      this.nIndicesVao.push(s[1]);
      if (s[2].length < 2) throw new Error("Problem with asteroid initialization");
      this.verticesVao.push(s[2]);

    }
  }
  checkIfNearPlayer(idx : number, player : Player){
    const pos = this.asteroids[idx].pos;
    return Vec3.distance(pos, player.pos) < (this.asteroids[idx].scale.x+3);
  }
  killAsteroid(i : number, particleSystem : ParticleSystem, time : number){
    for (let j = 0; j < 100; j++) {
        particleSystem.add(this.asteroids[i].pos, Vec3.make(0,0,0), 2.0*this.asteroids[i].scale.x, time, 1, 2);
    }
    this.asteroids.splice(i, 1);
  }
  update(particleSystem : ParticleSystem, perlin : Perlin3d, perlinFloor : PerlinFloor, player : Player, bulletHandler : BulletHandler, time : number, dt : number){
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].pos = Vec3.add(this.asteroids[i].pos, Vec3.multScalar(this.asteroids[i].vel, 0.25*dt)); 
      this.asteroids[i].updateWorldData(3);
      particleSystem.add(this.asteroids[i].pos, Vec3.multScalar(this.asteroids[i].vel, -1), 2.0*this.asteroids[i].scale.x, time, 0.2, 1.0);
      const coll : AsteroidCollision = this.checkCollision(i, perlin, perlinFloor, player, bulletHandler);
      if (coll != AsteroidCollision.NOTHING){
        this.killAsteroid(i, particleSystem, time);
        i--;
      }
      if (coll == AsteroidCollision.PLAYER) player.deadAnimation(time, particleSystem);

    }
  }

  checkCollision(i : number, perlin : Perlin3d, perlinFloor : PerlinFloor, player : Player, bulletHandler : BulletHandler) : AsteroidCollision{
    for (let j = 0; j < bulletHandler.bullets.length; j++) {
      if (Vec3.distance(this.asteroids[i].pos, bulletHandler.bullets[j].pos) > this.asteroids[i].scale.x+3) continue;
      const coll = Collision.checkShapeCollision(this.asteroids[i], bulletHandler.bullets[j]);
      if (coll.collided){
        return AsteroidCollision.BULLET;
      }
    }


    if (this.checkIfNearPlayer(i, player)){
      const coll = Collision.checkShapeCollision(this.asteroids[i], player);
      if (coll.collided)
        return AsteroidCollision.PLAYER;
    }

    if (this.asteroids[i].pos.y > 25) return AsteroidCollision.NOTHING;
    const coll = Collision.checkPerlinCollision(this.asteroids[i], perlin, perlinFloor);

    if (coll.collided) return AsteroidCollision.FLOOR;
    return AsteroidCollision.NOTHING;
  }


  add(pos : Vec3){
    const f = () : number => 0.5 - Math.random();

    const offset_pos = Vec3.multScalar(Vec3.make(f(),f(),f()), 100.0);
    const scale = Math.floor(2 + Math.random()*5);
    const indxVao = Math.floor(Math.random()*this.vaos.length);
    const vel = Vec3.make(0.5 - Math.random(), -1.0, 0.5 - Math.random()); 
    if (this.verticesVao[indxVao].length < 2) throw new Error("Vertices length cannot be less than 2");
    this.asteroids.push(
      new Shape(Vec3.add(pos, offset_pos), Vec3.make(scale, scale, scale), this.shader, this.vaos[indxVao], this.nIndicesVao[indxVao], new Float32Array(this.verticesVao[indxVao]))
    );
    this.asteroids[this.asteroids.length-1].vel = vel;
  }
  addAttackRover(pos : Vec3, rover : Vec3){
    const f = () : number => 0.5 - Math.random();

    const offset_pos = Vec3.multScalar(Vec3.make(f(),f(),f()), 100.0);
    const offset_vel = Vec3.multScalar(Vec3.make(f(),f(),f()), 0.0);


    const scale = Math.floor(2 + Math.random()*5);
    const indxVao = Math.floor(Math.random()*this.vaos.length);
    const fPos : Vec3 = Vec3.add(pos, offset_pos);
    const vel = Vec3.normalize(Vec3.add(Vec3.sub(rover, fPos), offset_vel));

    if (this.verticesVao[indxVao].length < 2) throw new Error("Vertices length cannot be less than 2");
    this.asteroids.push(
      new Shape(fPos, Vec3.make(scale, scale, scale), this.shader, this.vaos[indxVao], this.nIndicesVao[indxVao], new Float32Array(this.verticesVao[indxVao]))
    );
    this.asteroids[this.asteroids.length-1].vel = vel;
  }
  draw(gl : WebGL2RenderingContext){
    for (let asteroid of this.asteroids)
      asteroid.draw(gl);
  }

}


