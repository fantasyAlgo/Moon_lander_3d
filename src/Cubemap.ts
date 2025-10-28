import { Camera } from "./Camera";
import { Mat4x4 } from "./glMath/mat4x4";
import { webglVerticesFromCoupledVertices } from "./helpers/CoupledVertex";
import { mapBitmapToCubeMap } from "./helpers/glHelpers";
import { ShaderProgram } from "./helpers/shaderProgram";
import { Shape } from "./Shape";

export class Cubemap {
  vao : WebGLVertexArrayObject;
  texture : WebGLTexture;

  constructor(
    gl : WebGL2RenderingContext,
    public readonly program : ShaderProgram,
    vbo: WebGLBuffer,
    images: Object,
    prefix : string,
  ){
    this.setUpTexture(gl, images, prefix);
    this.setUpVao(gl, vbo);

    this.program.bind(gl);
    gl.activeTexture(gl.TEXTURE0);
    const samplerPos = this.program.getUniform(gl, "uSkyBox");
    gl.uniform1i(samplerPos, 0);
  }
  setUpTexture(gl : WebGL2RenderingContext, images : Object, prefix : String){
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const targets : GLenum[] = [
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
]
    for (let i = 1; i <= 6; i++) {
      const url = prefix.concat(i.toString());
      console.log("url: ", url);
      mapBitmapToCubeMap(gl, texture, images[url], targets[i-1]);
    }
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    this.texture = texture;

  }


  setUpVao(gl : WebGL2RenderingContext, vbo : WebGLBuffer){
    this.program.bind(gl);
    const vao : WebGLVertexArrayObject = gl.createVertexArray();
    if (!vao) throw new Error("A problem occurred with the creation of the VAO");

    gl.bindVertexArray(vao);

    const posLoc : GLuint = this.program.getAttrib(gl, "aPos");
    gl.enableVertexAttribArray(posLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(
      posLoc, 2, gl.FLOAT, false, 2*Float32Array.BYTES_PER_ELEMENT, 0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    this.vao = vao;
    this.program.unbind(gl);
  }

  update(gl : WebGL2RenderingContext, pCamera : Camera){
    this.program.bind(gl);
    const loc = this.program.getUniform(gl, "matViewProjectionInverse");

    const view = pCamera.lookAtMatrix.copy();
    view.values[12] = 0.0;
    view.values[13] = 0.0;
    view.values[14] = 0.0;

    const matrix = Mat4x4.multMatrix(view, pCamera.perpective);
    const inv = matrix.inverse();
    gl.uniformMatrix4fv(loc, false, inv.values);
  }
  draw(gl : WebGL2RenderingContext){
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    this.program.bind(gl);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 1*6);
    gl.bindVertexArray(null);
  }

}
