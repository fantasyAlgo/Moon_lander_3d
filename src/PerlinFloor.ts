import { createBufferData, createFloorVao, createStaticIndexBuffer, makeHeightTextureFromData, makeRandomMatrix } from "./helpers/glHelpers";
import { Mat4x4 } from "./glMath/mat4x4";
import { Vec2 } from "./glMath/vec2";
import { Vec3 } from "./glMath/vec3";
import { Perlin3d } from "./helpers/Perlin3d";
import { ShaderProgram } from "./helpers/shaderProgram";
import { Shape } from "./Shape";
import { getFloorIndices, getFloorVertices } from "./helpers/loadPerlinFloor";

class QueueChanges{
  constructor(
    public from : number,
    public to : number,
    public chunkI : Vec2,
    public dir : boolean,
  ){}
};
class PendingUpdateSwap {
  constructor(
    public from : number,
    public to : number,
    public values: Float32Array,
    public dir : boolean,
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
  nChunks : number;

  queueChanges : QueueChanges[] = [];
  pendingUpdateSwaps : PendingUpdateSwap[] = [];

  testData : number[] = [];

  constructor(gl : WebGL2RenderingContext, perlin3d : Perlin3d, shader : ShaderProgram, initial_pos : Vec3){ 
    const nChunks = 5;
    this.nChunks = nChunks;
    this.testData = Array.from({ length: nChunks }, (_, i) => i + 1);
    this.WIDTH = 50;
    this.HEIGHT = 50;
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
      const offset = Math.floor(this.nChunks/2.0);
      const pos : Vec2 = Vec2.make(Math.floor(i/nChunks) - offset, i%nChunks - offset);
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
   //console.log(this.testData.slice(0, 3), "\n", this.testData.slice(3, 6), "\n", this.testData.slice(6, 9));
   shader.unbind(gl);
  }

  getValue(p : Perlin3d, x : number, y : number) : number{
    const iX = Math.floor((this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0));
    const iY = Math.floor((this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0));

    const j : number = ((x-this.cChunk.x)/this.WIDTH + 1)*(p.grid_width/2.0);
    const i : number = ((y-this.cChunk.y)/this.HEIGHT + 1)*(p.grid_height/2.0);
    //console.log(x, y, i, j)
    return 10.0*p.get((i+iY*p.grid_height)/50.0, (j+iX*p.grid_width)/50.0);
  }

  updateChunk(gl : WebGL2RenderingContext, perlin3d : Perlin3d, newChunk : Vec2){
    const dx = Math.sign(this.cChunk.x - newChunk.x);
    const dy = Math.sign(this.cChunk.y - newChunk.y);

    const iX = (this.cChunk.x - this.WIDTH)/(this.WIDTH*2.0);
    const iY = (this.cChunk.y - this.HEIGHT)/(this.HEIGHT*2.0);
    const chunk : Vec2 = Vec2.make(iX, iY);
    console.log("ds: ", dx, dy);
    if (dy < 0){
      for (let i = 0; i < this.nChunks*this.nChunks; i+=this.nChunks)
        this.queueChanges.push(new QueueChanges(i, i+this.nChunks-1, chunk, false));
    }
    if (dy > 0){
      for (let i = 0; i < this.nChunks*this.nChunks; i+=this.nChunks)
        this.queueChanges.push(new QueueChanges(i+this.nChunks-1, i, chunk, false));
      //console.log("q: ", this.queueChanges);
    }
    if (dx < 0){
      const start = this.nChunks*(this.nChunks-1);
      for (let i = 0; i < this.nChunks; i+=1)
        this.queueChanges.push(new QueueChanges(i, start+i, chunk, true));
    }
    if (dx > 0){
      const start = this.nChunks*(this.nChunks-1);
      for (let i = 0; i < this.nChunks; i+=1)
        this.queueChanges.push(new QueueChanges(start+i, i, chunk, true));
    }
    this.cChunk = newChunk;
  }

  swap(from : number, to : number){
    [this.verticesVBO[to], this.verticesVBO[from]] = [this.verticesVBO[from], this.verticesVBO[to]];
    [this.shapes[to].vao, this.shapes[from].vao] = [this.shapes[from].vao, this.shapes[to].vao];
    [this.testData[to], this.testData[from]] = [this.testData[from], this.testData[to]];
  }

  updateSwaps(gl : WebGL2RenderingContext){
    if (this.queueChanges.length > 0) return;
    for (const {from, to, values, dir} of this.pendingUpdateSwaps) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO[from]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, values);

      gl.bindVertexArray(null);
      //const mid = Math.floor((from + to)/2);
      this.swap(from, to);
      const sign = (from < to);
      const toAdd = -Math.sign(from-to)*(dir ? this.nChunks : 1);
      if (sign) for (let i = from; i < to-toAdd; i += toAdd) this.swap(i, i+toAdd); 
      else for (let i = from; i > to-toAdd; i += toAdd) this.swap(i, i+toAdd); 


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
      const chunkPos = Vec2.make(iX + Math.floor(el.to/this.nChunks)-Math.floor(this.nChunks/2), iY + el.to%this.nChunks - Math.floor(this.nChunks/2));
      //const chunkPos = Vec2.make(iX + Math.floor(el.to/3)-1, iY + el.to%3 - 1);
      const new_values = getFloorVertices(perlin3d,  chunkPos);

      this.pendingUpdateSwaps.push(new PendingUpdateSwap(el.from, el.to, new_values, el.dir));


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

  draw(gl : WebGL2RenderingContext, cameraPos : Vec3, forward : Vec3){
    const length = this.nChunks*this.nChunks
    const playerIndx = Math.floor(length/2.0);
    const checkPoint = (p : Vec3) => {
      const cPos = Vec3.make(this.cChunk.x + p.x, p.y, this.cChunk.y+p.z);
      const diff = Vec3.normalize(Vec3.sub(cPos, cameraPos));
      return Vec3.dot(forward, diff) > 0.5;
    }

    for (let i = 0; i < length; i++) {
      const element = this.shapes[i];
      if (i == playerIndx) {
        element.draw(gl);
        continue;
      }

      if (checkPoint(Vec3.make(element.pos.x-this.WIDTH, element.pos.y, element.pos.z+this.HEIGHT))){
        element.draw(gl);
        continue;
      }
      if (checkPoint(Vec3.make(element.pos.x+this.WIDTH, element.pos.y, element.pos.z+this.HEIGHT))){
        element.draw(gl);
        continue;
      }
      if (checkPoint(Vec3.make(element.pos.x-this.WIDTH, element.pos.y, element.pos.z-this.HEIGHT))){
        element.draw(gl);
        continue;
      }
      if (checkPoint(Vec3.make(element.pos.x+this.WIDTH, element.pos.y, element.pos.z-this.HEIGHT))){
        element.draw(gl);
        continue;
      }

     
    }
  }
}
