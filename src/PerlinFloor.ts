import { createBufferData, createFloorVao, createStaticIndexBuffer, makeHeightTextureFromData, makeRandomMatrix } from "./glHelpers";
import { Mat4x4 } from "./glMath/mat4x4";
import { Vec2 } from "./glMath/vec2";
import { Vec3 } from "./glMath/vec3";
import { Perlin3d } from "./Perlin3d";
import { ShaderProgram } from "./shaderProgram";
import { Shape } from "./Shape";
import { getFloorIndices, getFloorVertices } from "./shapesVertices";


class QueueChanges{
  constructor(
    public from : number,
    public to : number,
    public chunkI : Vec2
  ){}
};
class PendingUpdateSwap {
  constructor(
    public from : number,
    public to : number,
    public values: Float32Array,
  ){}
}


export class PerlinFloor {
  shapes : Shape[] = [];
  verticesVBO : WebGLBuffer[] = [];
  floorVAOs : WebGLVertexArrayObject[] = [];
  shader : ShaderProgram;
  noiseTexture : WebGLTexture;
  WIDTH : number =  20;
  HEIGHT : number = 20;
  cChunk : Vec2;

  queueChanges : QueueChanges[] = [];
  pendingUpdateSwaps : PendingUpdateSwap[] = [];

  testData : number[] = [1,2,3,4,5,6,7,8,9];


  constructor(gl : WebGL2RenderingContext, perlin3d : Perlin3d, shader : ShaderProgram, initial_pos : Vec3){ 
    const nChunks = 3;
    this.shader = shader;

    const xIndxChunk = Math.floor((Math.abs(initial_pos.x)+this.WIDTH)/(this.WIDTH*2.0));
    const yIndxChunk = Math.floor((Math.abs(initial_pos.z)+this.HEIGHT)/(this.HEIGHT*2.0));

    const xChunk = xIndxChunk*this.WIDTH*2.0 * Math.sign(initial_pos.x);
    const yChunk = yIndxChunk*this.HEIGHT*2.0 * Math.sign(initial_pos.z);
    this.cChunk = Vec2.make(xChunk,yChunk);

    const floorIndicesData = getFloorIndices(perlin3d.grid_width, perlin3d.grid_height);

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
    gl.uniform2f(this.shader.getUniform(gl, "chunkPos"), this.cChunk.x, this.cChunk.y);


    for (let i = 0; i < nChunks*nChunks; i++){
      const pos : Vec2 = Vec2.make(Math.floor(i/nChunks) - 1, i%nChunks - 1);
      const iX = Math.floor((this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0));
      const iY = Math.floor((this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0));
      //const pos : Vec2 = Vec2.make(i%nChunks - 1, Math.floor(i/nChunks)-1);
      const floorVerticesData = getFloorVertices(perlin3d, Vec2.add(pos, Vec2.make(iX, iY)));
      this.verticesVBO.push(createBufferData(gl, floorVerticesData, gl.DYNAMIC_DRAW));
      const vao = createFloorVao(gl, this.verticesVBO[this.verticesVBO.length-1], floorIndices, vPosLoc, vNormalLoc);
      const UP_VEC = Vec3.make(0, 1, 0);
      this.shapes.push(
        new Shape(Vec3.make(pos.x*this.WIDTH*2.0, 0 , pos.y*this.HEIGHT*2.0), Vec3.make(this.WIDTH, 1, this.HEIGHT), shader, vao, floorIndicesData.length)
      );
   }
   this.pendingUpdateSwaps = [];
   console.log(this.testData.slice(0, 3), "\n", this.testData.slice(3, 6), "\n", this.testData.slice(6, 9));

   shader.unbind(gl);
  }

  updateChunk(gl : WebGL2RenderingContext, perlin3d : Perlin3d, newChunk : Vec2){
    const dx = Math.sign(this.cChunk.x - newChunk.x);
    const dy = Math.sign(this.cChunk.y - newChunk.y);

    const iX = (this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0);
    const iY = (this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0);
    const chunk : Vec2 = Vec2.make(iX, iY);
    //console.log("ds: ", dx, dy);
    if (dy < 0){
      this.queueChanges.push(new QueueChanges(0, 2, chunk));
      this.queueChanges.push(new QueueChanges(3, 5, chunk));
      this.queueChanges.push(new QueueChanges(6, 8, chunk));
    }
    if (dy > 0){
      this.queueChanges.push(new QueueChanges(2, 0, chunk));
      this.queueChanges.push(new QueueChanges(5, 3, chunk));
      this.queueChanges.push(new QueueChanges(8, 6, chunk));
    }
    if (dx < 0){
      this.queueChanges.push(new QueueChanges(0, 6, chunk));
      this.queueChanges.push(new QueueChanges(1, 7, chunk));
      this.queueChanges.push(new QueueChanges(2, 8, chunk));
    }
    if (dx > 0){
      this.queueChanges.push(new QueueChanges(6, 0, chunk));
      this.queueChanges.push(new QueueChanges(7, 1, chunk));
      this.queueChanges.push(new QueueChanges(8, 2, chunk));
    }
    this.cChunk = newChunk;
    /*
    console.log("hes using us!");
    const iX = (this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0);
    const iY = (this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0);
    const new_values = getFloorVertices(perlin3d, Vec2.make(iX, iY));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new_values);

    this.shape.pos.x = this.cChunk.x;
    this.shape.pos.z = this.cChunk.y;
    */
  }

  swap(from : number, to : number){
    [this.verticesVBO[to], this.verticesVBO[from]] = [this.verticesVBO[from], this.verticesVBO[to]];
    [this.shapes[to].vao, this.shapes[from].vao] = [this.shapes[from].vao, this.shapes[to].vao];
    [this.testData[to], this.testData[from]] = [this.testData[from], this.testData[to]];
  }

  updateSwaps(gl : WebGL2RenderingContext){
    if (this.queueChanges.length > 0) return;
    for (const {from, to, values} of this.pendingUpdateSwaps) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO[from]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, values);

      gl.bindVertexArray(null);
      const mid = Math.floor((from + to)/2);
      this.swap(from, to);
      this.swap(from, mid); 
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error("WebGL Error in swaps:", error);
      }
    }
    this.pendingUpdateSwaps = [];
    this.shader.bind(gl);
    gl.uniform2f(this.shader.getUniform(gl, "chunkPos"), this.cChunk.x, this.cChunk.y);
  }


  update(gl : WebGL2RenderingContext, perlin3d : Perlin3d, pos : Vec3){
    //console.log(pos)
    if (this.queueChanges.length > 0){
      //console.log("hello: ", this.queueChanges.length)
      const el : QueueChanges | undefined = this.queueChanges.shift();
      if (el == undefined) return;

      //gl.finish();

      const iX = Math.floor((this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0));
      const iY = Math.floor((this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0));
      //console.log("iX, iY: ", iX, iY);
      const chunkPos = Vec2.make(iX + Math.floor(el.to/3)-1, iY + el.to%3 - 1);
      const new_values = getFloorVertices(perlin3d,  chunkPos);

      this.pendingUpdateSwaps.push(new PendingUpdateSwap(el.from, el.to, new_values))


      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error("WebGL Error in update:", error);
      }


      //console.log("########################");
      //console.log(this.testData.slice(0, 3), "\n", this.testData.slice(3, 6), "\n", this.testData.slice(6, 9));
    }

    const xIndxChunk = Math.floor((Math.abs(pos.x)+this.WIDTH)/(this.WIDTH*2.0));
    const yIndxChunk = Math.floor((Math.abs(pos.z)+this.HEIGHT)/(this.HEIGHT*2.0));

    const xChunk = xIndxChunk*this.WIDTH*2.0 * Math.sign(pos.x);
    const yChunk = yIndxChunk*this.HEIGHT*2.0 * Math.sign(pos.z);
    const chunk = Vec2.make(xChunk, yChunk);
    //console.log(chunk, this.cChunk)
    if (!this.cChunk.equal(chunk)){
      this.updateChunk(gl, perlin3d, chunk);
    }

    this.shader.bind(gl);
    
  }

  draw(gl : WebGL2RenderingContext){
    this.shapes.forEach(element => {
      element.draw(gl);
    });  
  }
}
