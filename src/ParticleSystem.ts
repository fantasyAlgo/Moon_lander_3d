import { Vec3 } from "./glMath/vec3";
import { webglVerticesFromCoupledVertices } from "./helpers/CoupledVertex";
import { createBufferData } from "./helpers/glHelpers";
import { ShaderProgram } from "./helpers/shaderProgram";


export class ParticleSystem {
  vao : WebGLVertexArrayObject;
  shader : ShaderProgram;

  max_particles : number;
  next_particle : number = 0;
  start_particle : number = 0;
  data : WebGLBuffer;
  toSpawnParticles : number[];
  timeUniform : WebGLUniformLocation;

  constructor(gl : WebGL2RenderingContext, shader : ShaderProgram, plane_vbo : WebGLBuffer, plane_ibo : WebGLBuffer, max_particles : number){ 
    this.toSpawnParticles = [];
    this.max_particles = max_particles;
    this.next_particle = 0;
    this.shader = shader;

    shader.bind(gl);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    this.vao = vao;
    this.max_particles = max_particles;

    this.setShapeBuffer(gl, plane_vbo, plane_ibo);

    const data : Float32Array = new Float32Array(max_particles*8);
    const dataB : WebGLBuffer = createBufferData(gl, data, gl.DYNAMIC_DRAW);
    this.setDataBuffer(gl, dataB);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
    gl.bindBuffer(gl.ARRAY_BUFFER, null); 

    console.log("error in ParticleSystem: ", gl.getError())
  }
  reset(gl : WebGL2RenderingContext){
    const empty = new Float32Array(8*this.max_particles);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0.0, empty, 0, 0);
  }

  setShapeBuffer(gl : WebGL2RenderingContext, data : WebGLBuffer, indices : WebGLBuffer){
    gl.bindVertexArray(this.vao);

    const posAttrib =     this.shader.getAttrib(gl, "vPos");
    const colorAttrib =   this.shader.getAttrib(gl, "vColor");
    const normalAttrib =  this.shader.getAttrib(gl, "vNormal");
    const uvAttrib =      this.shader.getAttrib(gl, "vUV");

    gl.enableVertexAttribArray(posAttrib);
    gl.enableVertexAttribArray(colorAttrib);
    gl.enableVertexAttribArray(normalAttrib);
    gl.enableVertexAttribArray(uvAttrib);

    gl.bindBuffer(gl.ARRAY_BUFFER, data);
    gl.vertexAttribPointer(
      posAttrib, 3, gl.FLOAT, false, 11*Float32Array.BYTES_PER_ELEMENT, 0
    );
    gl.vertexAttribPointer(
      colorAttrib, 3, gl.FLOAT, false, 11*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT
    );
    gl.vertexAttribPointer(
      normalAttrib, 3, gl.FLOAT, false, 11*Float32Array.BYTES_PER_ELEMENT, 6*Float32Array.BYTES_PER_ELEMENT
    );
    gl.vertexAttribPointer(
      uvAttrib, 2, gl.FLOAT, false, 11*Float32Array.BYTES_PER_ELEMENT, 9*Float32Array.BYTES_PER_ELEMENT
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    gl.bindVertexArray(null);
  }
  setDataBuffer(gl : WebGL2RenderingContext, dataB : WebGLBuffer){
    gl.bindVertexArray(this.vao);
    const initSPos = this.shader.getAttrib(gl, "initialPos");
    const vDirSPos = this.shader.getAttrib(gl, "vDir");
    const timeSPos = this.shader.getAttrib(gl, "startTime");
    const sizePos = this.shader.getAttrib(gl, "size");
    this.timeUniform = this.shader.getUniform(gl, "cTime");

    gl.enableVertexAttribArray(initSPos);
    gl.enableVertexAttribArray(vDirSPos);
    gl.enableVertexAttribArray(timeSPos);
    gl.enableVertexAttribArray(sizePos);

    gl.bindBuffer(gl.ARRAY_BUFFER, dataB);
    gl.vertexAttribPointer(initSPos, 3, gl.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 0*Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribDivisor(initSPos, 1);

    gl.vertexAttribPointer(vDirSPos, 3, gl.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribDivisor(vDirSPos, 1);

    gl.vertexAttribPointer(timeSPos, 1, gl.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 6*Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribDivisor(timeSPos, 1);

    gl.vertexAttribPointer(sizePos, 1, gl.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 7*Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribDivisor(sizePos, 1);

    gl.bindVertexArray(null);
    
    this.data = dataB;
  }


  add(iPos : Vec3, dir : Vec3, size : number, cTime : number, pos_randomness : number = 0.1, dir_randomness : number = 0.01 ) {
    const f = () => (0.5 -  Math.random());
    const rDir = Vec3.make(f(), f(), f());
    const rPos = Vec3.make(f(), f(), f());
    rDir.multScalar(dir_randomness);
    rPos.multScalar(pos_randomness);

    iPos = Vec3.add(iPos, rPos);
    dir = Vec3.add(dir, rDir);
    //console.log("dir: ", dir.x, dir.y, dir.z);

    this.toSpawnParticles.push(iPos.x, iPos.y, iPos.z, dir.x, dir.y, dir.z, cTime, size);
  }
  update(gl : WebGL2RenderingContext, time : number){
    this.shader.bind(gl);
    gl.uniform1f(this.timeUniform, time);
    const sizeParticles = this.toSpawnParticles.length;
    if (this.next_particle + sizeParticles >= this.max_particles){
      const maxArraySize = this.max_particles - sizeParticles;

      gl.bufferSubData(gl.ARRAY_BUFFER, this.next_particle*Float32Array.BYTES_PER_ELEMENT, new Float32Array(this.toSpawnParticles).subarray(0, maxArraySize), 0, 0);
      this.next_particle = 0;
      this.toSpawnParticles = this.toSpawnParticles.slice(maxArraySize+1, sizeParticles+1);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data);
    gl.bufferSubData(gl.ARRAY_BUFFER, this.next_particle*Float32Array.BYTES_PER_ELEMENT, new Float32Array(this.toSpawnParticles), 0, 0);
    this.next_particle += sizeParticles;
    this.toSpawnParticles = [];
  }

  draw(gl : WebGL2RenderingContext){
    this.shader.bind(gl);
    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(
        gl.TRIANGLES, 
        6*6,                    // Number of indices (6 for a quad: 2 triangles)
        gl.UNSIGNED_SHORT,    // Type of indices (or gl.UNSIGNED_INT if your indices are larger)
        0,                    // Offset in the index buffer
        this.max_particles    // Number of instances
    );
  }


}
