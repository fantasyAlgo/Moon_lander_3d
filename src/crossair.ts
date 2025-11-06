import { createBufferData, createQuodVao } from "./helpers/glHelpers";
import { QUAD_VERTICES } from "./helpers/loadPerlinFloor";
import { ShaderProgram } from "./helpers/shaderProgram";

export class Crosshair {
  vao : WebGLVertexArrayObject;
  constructor(
    gl: WebGL2RenderingContext, 
    quodVertices : WebGLBuffer,
    public shader : ShaderProgram){
      const vPosQuod = this.shader.getAttrib(gl, "aPos");
      this.vao = createQuodVao(gl, quodVertices, vPosQuod);
    }
  draw(gl : WebGL2RenderingContext){
    this.shader.bind(gl);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 1*6);
    gl.bindVertexArray(null);
  }
}
