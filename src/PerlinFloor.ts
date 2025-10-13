import { createBufferData, createFloorVao, createStaticIndexBuffer, makeHeightTextureFromData, makeRandomMatrix } from "./glHelpers";
import { Vec2 } from "./glMath/vec2";
import { Vec3 } from "./glMath/vec3";
import { Perlin3d } from "./Perlin3d";
import { ShaderProgram } from "./shaderProgram";
import { Shape } from "./Shape";
import { getFloorIndices, getFloorVertices } from "./shapesVertices";

export class PerlinFloor {
  shape : Shape;
  verticesVBO : WebGLBuffer;
  shader : ShaderProgram;
  noiseTexture : WebGLTexture;
  WIDTH : number = 5;
  HEIGHT : number = 5;
  cChunk : Vec2;




  constructor(gl : WebGL2RenderingContext, perlin3d : Perlin3d, shader : ShaderProgram){ 
    this.shader = shader;
    this.cChunk = Vec2.make(0,0);

    const floorVerticesData = getFloorVertices(perlin3d, Vec2.make(0,0));
    const floorIndicesData = getFloorIndices(perlin3d.grid_width, perlin3d.grid_height);

    this.verticesVBO = createBufferData(gl, floorVerticesData, gl.DYNAMIC_DRAW);
    const floorIndices = createStaticIndexBuffer(gl, floorIndicesData);
    console.log("error 2: ", gl.getError());

    const vPosLoc = shader.getAttrib(gl, "vPos");   
    const vNormalLoc = shader.getAttrib(gl, "vNormal"); 

    const noise_width = 256*2.0;
    this.noiseTexture = makeHeightTextureFromData(gl, makeRandomMatrix(noise_width,noise_width), noise_width, noise_width);
    shader.bind(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.uniform1i(shader.getUniform(gl, "u_noiseTex"), 0);

    const vao = createFloorVao(gl, this.verticesVBO, floorIndices, vPosLoc, vNormalLoc);
    const UP_VEC = Vec3.make(0, 1, 0);
    this.shape = new Shape(Vec3.make(0, 0 , 0), Vec3.make(this.WIDTH, 1, this.HEIGHT), UP_VEC, 0, shader, vao, floorIndicesData.length);

    shader.unbind(gl);
  }

  updateChunk(gl : WebGL2RenderingContext, perlin3d : Perlin3d){
    console.log("hes using us!");
    const iX = (this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0);
    const iY = (this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0);
    const new_values = getFloorVertices(perlin3d, Vec2.make(iX, iY));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new_values);

    this.shape.pos.x = this.cChunk.x;
    this.shape.pos.z = this.cChunk.y;

  }
  update(gl : WebGL2RenderingContext, perlin3d : Perlin3d, pos : Vec3){
    const xIndxChunk = Math.floor((Math.abs(pos.x)+this.WIDTH)/(this.WIDTH*2.0));
    const yIndxChunk = Math.floor((Math.abs(pos.z)+this.HEIGHT)/(this.HEIGHT*2.0));

    const xChunk = xIndxChunk*this.WIDTH*2.0 * Math.sign(pos.x);
    const yChunk = yIndxChunk*this.HEIGHT*2.0 * Math.sign(pos.z);
    const chunk = Vec2.make(xChunk, yChunk);
    //console.log(chunk, this.cChunk)
    if (!this.cChunk.equal(chunk)){
      this.cChunk = chunk;
      this.updateChunk(gl, perlin3d);
    }

    this.shader.bind(gl);
    gl.uniform2f(this.shader.getUniform(gl, "chunkPos"), 0, 0);
  }

  draw(gl : WebGL2RenderingContext){
    this.shape.draw(gl);
  }
}
