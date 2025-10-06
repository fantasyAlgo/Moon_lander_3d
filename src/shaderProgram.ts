import { showError } from "./helpers";

export class ShaderProgram {
  id : WebGLProgram;
  constructor(gl : WebGLRenderingContext, vertexSource : string, fragmentSource : string){
    const vertexShader =  gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader){
      showError("Vertex shader nah");
      return;
    }
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
      const compileError = gl.getShaderInfoLog(vertexShader);
      showError(`Failed vertex: - ${compileError}`);
    }

    const fragmentShader =  gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader == null){
      showError("fragment shader nah")
      return;
    }

    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
      const compileError = gl.getShaderInfoLog(fragmentShader);
      showError(`Failed fragment: - ${compileError}`);
    }

    const triangleShaderProgram = gl.createProgram();
    if (!triangleShaderProgram){
      showError("Program died");
      return;
    }
    gl.attachShader(triangleShaderProgram, fragmentShader);
    gl.attachShader(triangleShaderProgram, vertexShader);
    gl.linkProgram(triangleShaderProgram);

    this.id = triangleShaderProgram;
  }
  getAttrib(gl : WebGLRenderingContext, attrib : string) : number {
    const l = gl.getAttribLocation(this.id, attrib);
    if (l < 0) throw new Error(`Failed to get attrib ${attrib}`);
    return l;
  }
  getUniform(gl : WebGLRenderingContext, uniform : string) : WebGLUniformLocation{
    const l = gl.getUniformLocation(this.id, uniform);
    if (!l) throw new Error(`Failed to get uniform ${uniform}`);
    return l;
  }


  bind(gl : WebGLRenderingContext){
    gl.useProgram(this.id);
  }
  unbind(gl : WebGLRenderingContext){
    gl.useProgram(null);
  }

}
