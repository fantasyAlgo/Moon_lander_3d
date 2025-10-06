import { showError } from "./helpers";
import { ShaderProgram } from "./shaderProgram";
import { fireyTriangleColors, rbgTriangleColors, triangleVertices } from "./shapesVertices";


function createStaticBufferData(gl : WebGLRenderingContext, data : ArrayBuffer){
  const buffer = gl.createBuffer();
  if (!buffer){
    showError("Failed to allocate buffer");
    throw new Error("Failed to allocate buffer");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}


export class Game {
  triangleGeoBuffer : WebGLBuffer;
  rgbTriangleBuffer : WebGLBuffer;
  fireyTriangleBuffer : WebGLBuffer;
  width : number;
  height : number;
  shaderProgram : ShaderProgram;



  constructor(gl : WebGLRenderingContext, width: number, height : number, vertexCode : string, fragmentCode : string){
    this.width = width;
    this.height = height;

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const buffer1 = createStaticBufferData(gl, triangleVertices);
    if (!buffer1){
      showError("triangleVertices gave error");
      return;
    }

    this.triangleGeoBuffer = createStaticBufferData(gl, triangleVertices);
    this.rgbTriangleBuffer = createStaticBufferData(gl, rbgTriangleColors);
    this.fireyTriangleBuffer = createStaticBufferData(gl, fireyTriangleColors);

    this.shaderProgram = new ShaderProgram(gl, vertexCode, fragmentCode);

    const vPosLoc = this.shaderProgram.getAttrib(gl, "vPos");   
    const vColorLoc = this.shaderProgram.getAttrib(gl, "vColor"); 

    if (vPosLoc < 0 || vColorLoc < 0 ){
      if (vPosLoc < 0) showError("vPos wasnt found");
      if (vColorLoc < 0) showError("vColor wasnt found");
      return;
    }

    gl.viewport(0, 0, this.width, this.height);

    this.shaderProgram.bind(gl);
    gl.enableVertexAttribArray(vPosLoc);
    gl.enableVertexAttribArray(vColorLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleGeoBuffer);
    gl.vertexAttribPointer(
      vPosLoc, 2, gl.FLOAT, false, 2*Float32Array.BYTES_PER_ELEMENT, 0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.rgbTriangleBuffer);
    gl.vertexAttribPointer(
      vColorLoc, 3, gl.UNSIGNED_BYTE, true, 0, 0
    );

  }
  update(dt : Number) {
  }

  draw(gl : WebGLRenderingContext ) {
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform2f(this.shaderProgram.getUniform(gl, "canvas_size"), this.width, this.height);
    gl.uniform2f(this.shaderProgram.getUniform(gl, "shapeLocation"), 200, 400);
    gl.uniform1f(this.shaderProgram.getUniform(gl, "shapeSize"), 200);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.uniform2f(this.shaderProgram.getUniform(gl, "shapeLocation"), 400, 500);
    gl.uniform1f(this.shaderProgram.getUniform(gl, "shapeSize"), 200);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

}
