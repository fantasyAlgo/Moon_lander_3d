import { Vec3 } from "./glMath/vec3";
import { convexHull } from "./helpers/ConvexHull";
import { webglVerticesFromCoupledVertices } from "./helpers/CoupledVertex";
import { create3dPosColorInterleavedVao, createBufferData, createStaticIndexBuffer, makeRandomMatrix } from "./helpers/glHelpers";
import { ModelData } from "./helpers/objLoader";
import { ShaderProgram } from "./helpers/shaderProgram";
import { ParticleSystem } from "./ParticleSystem";
import { Shape } from "./Shape";



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
  console.log("N: ", n_vertices, " | ", vertices.length);
  const data : ModelData = convexHull(vertices);
  return data;
}



function makeAsteroid(gl : WebGL2RenderingContext, n_vertices : number, shader : ShaderProgram) : [WebGLVertexArrayObject, number, number[]] {
  const data : ModelData = makeAsteroidShape(n_vertices);
  let vPos : number[] = [];
  for (let i = 0; i < data.vertices.length; i+=11) vPos.push(...[data.vertices[i], data.vertices[i+1], data.vertices[i+2]]);

  const buffer = createBufferData(gl, data.vertices, gl.STATIC_DRAW);
  const indices = createStaticIndexBuffer(gl, data.indices);
  shader.bind(gl);

  const posAttrib =     shader.getAttrib(gl, "vPos");
  const colorAttrib =   shader.getAttrib(gl, "vColor");
  const normalAttrib =  shader.getAttrib(gl, "vNormal");
  const uvAttrib =      shader.getAttrib(gl, "vUV");
  const vao = create3dPosColorInterleavedVao(gl, buffer, indices, posAttrib, colorAttrib, normalAttrib, uvAttrib);

  return [vao, data.indices.length, vPos];
}


export class AsteroidHandler {
  vaos : WebGLVertexArrayObject[] = [];
  nIndicesVao : number[] = [];
  verticesVao : number[][] = [[]];


  shader : ShaderProgram;

  asteroids : Shape[] = [];
  constructor(gl : WebGL2RenderingContext, shader: ShaderProgram, nPredefinedShapes : number){
    this.shader = shader;
    for (let i = 0; i < nPredefinedShapes; i++) {
      const s : [WebGLVertexArrayObject, number, number[]]= makeAsteroid(gl, (5+Math.random()*10), shader);
      this.vaos.push(s[0]);
      this.nIndicesVao.push(s[1]);
      this.verticesVao.push(s[2]);

    }
  }
  update(particleSystem : ParticleSystem, time : number, dt : number){
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].pos = Vec3.add(this.asteroids[i].pos, Vec3.multScalar(this.asteroids[i].vel, 0.25*dt));
      particleSystem.add(this.asteroids[i].pos, Vec3.multScalar(this.asteroids[i].vel, -1), time, 0.1, 0.4);
    }
  }
  add(pos : Vec3){
    const f = () : number => 0.5 - Math.random();

    const offset_pos = Vec3.multScalar(Vec3.make(f(),f(),f()), 50.0);
    const scale = Math.floor(2 + Math.random()*5);
    const indxVao = Math.floor(Math.random()*this.vaos.length);
    const vel = Vec3.make(0.5 - Math.random(), 0.0, 0.5 - Math.random()); 
    this.asteroids.push(
      new Shape(Vec3.add(pos, offset_pos), Vec3.make(scale, scale, scale), this.shader, this.vaos[indxVao], this.nIndicesVao[indxVao], new Float32Array(this.verticesVao[indxVao]))
    );
    this.asteroids[this.asteroids.length-1].vel = vel;
  }
  draw(gl : WebGL2RenderingContext){
    for (let asteroid of this.asteroids)
      asteroid.draw(gl);
  }

}


