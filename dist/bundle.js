// src/helpers.ts
function showError(errorText) {
  console.error(errorText);
  const errorBoxDiv = document.getElementById("error-box");
  if (errorBoxDiv === null) {
    return;
  }
  const errorElement = document.createElement("p");
  errorElement.innerText = errorText;
  errorBoxDiv.appendChild(errorElement);
}

// src/shaderProgram.ts
var ShaderProgram = class {
  id;
  constructor(gl, vertexSource, fragmentSource) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      showError("Vertex shader nah");
      return;
    }
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const compileError = gl.getShaderInfoLog(vertexShader);
      showError(`Failed vertex: - ${compileError}`);
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader == null) {
      showError("fragment shader nah");
      return;
    }
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const compileError = gl.getShaderInfoLog(fragmentShader);
      showError(`Failed fragment: - ${compileError}`);
    }
    const triangleShaderProgram = gl.createProgram();
    if (!triangleShaderProgram) {
      showError("Program died");
      return;
    }
    gl.attachShader(triangleShaderProgram, fragmentShader);
    gl.attachShader(triangleShaderProgram, vertexShader);
    gl.linkProgram(triangleShaderProgram);
    this.id = triangleShaderProgram;
  }
  getAttrib(gl, attrib) {
    const l = gl.getAttribLocation(this.id, attrib);
    if (l < 0) throw new Error(`Failed to get attrib ${attrib}`);
    return l;
  }
  getUniform(gl, uniform) {
    const l = gl.getUniformLocation(this.id, uniform);
    if (!l) throw new Error(`Failed to get uniform ${uniform}`);
    return l;
  }
  bind(gl) {
    gl.useProgram(this.id);
  }
  unbind(gl) {
    gl.useProgram(null);
  }
};

// src/shapesVertices.ts
var triangleVertices = new Float32Array([
  0,
  0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5
]);
var rbgTriangleColors = new Uint8Array([
  255,
  0,
  0,
  0,
  255,
  0,
  0,
  0,
  255
]);
var fireyTriangleColors = new Uint8Array([
  229,
  47,
  15,
  246,
  206,
  29,
  233,
  154,
  26
]);

// src/Game.ts
function createStaticBufferData(gl, data) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    showError("Failed to allocate buffer");
    throw new Error("Failed to allocate buffer");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}
var Game = class {
  triangleGeoBuffer;
  rgbTriangleBuffer;
  fireyTriangleBuffer;
  width;
  height;
  shaderProgram;
  constructor(gl, width, height, vertexCode, fragmentCode) {
    this.width = width;
    this.height = height;
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const buffer1 = createStaticBufferData(gl, triangleVertices);
    if (!buffer1) {
      showError("triangleVertices gave error");
      return;
    }
    this.triangleGeoBuffer = createStaticBufferData(gl, triangleVertices);
    this.rgbTriangleBuffer = createStaticBufferData(gl, rbgTriangleColors);
    this.fireyTriangleBuffer = createStaticBufferData(gl, fireyTriangleColors);
    this.shaderProgram = new ShaderProgram(gl, vertexCode, fragmentCode);
    const vPosLoc = this.shaderProgram.getAttrib(gl, "vPos");
    const vColorLoc = this.shaderProgram.getAttrib(gl, "vColor");
    if (vPosLoc < 0 || vColorLoc < 0) {
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
      vPosLoc,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.rgbTriangleBuffer);
    gl.vertexAttribPointer(
      vColorLoc,
      3,
      gl.UNSIGNED_BYTE,
      true,
      0,
      0
    );
  }
  update(dt) {
  }
  draw(gl) {
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(this.shaderProgram.getUniform(gl, "canvas_size"), this.width, this.height);
    gl.uniform2f(this.shaderProgram.getUniform(gl, "shapeLocation"), 200, 400);
    gl.uniform1f(this.shaderProgram.getUniform(gl, "shapeSize"), 200);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.uniform2f(this.shaderProgram.getUniform(gl, "shapeLocation"), 400, 500);
    gl.uniform1f(this.shaderProgram.getUniform(gl, "shapeSize"), 200);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
};

// src/vertexShader.ts
var vShaderCode = `#version 300 es
precision mediump float;

in vec2 vPos;
in vec3 vColor;

uniform vec2 canvas_size;
uniform vec2 shapeLocation;
uniform float shapeSize;

out vec3 vOutColor;
void main(){
  vec2 fPosition = vPos*shapeSize + shapeLocation;
  fPosition = 2.0f*(fPosition/canvas_size) - 1.0f;
  gl_Position = vec4(fPosition, 0.0, 1.0);
  
  vOutColor = vColor;
}
`;

// src/fragmentShader.ts
var fShaderCode = `#version 300 es
precision mediump float;

in vec3 vOutColor;

out vec4 outputColor;
void main(){
  outputColor = vec4(vOutColor, 1.0f);
}
`;

// src/main.ts
function initGame() {
  const canvas = document.getElementById("demo-canvas");
  if (!canvas) {
    showError("Canvas nope");
    return;
  }
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    showError("webgl2 nope");
    return;
  }
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var game = new Game(gl, canvas.width, canvas.height, vShaderCode, fShaderCode);
  let lastTime = performance.now();
  let dt;
  function step() {
    const now = performance.now();
    dt = (now - lastTime) / 5;
    lastTime = now;
    game.update(dt);
    if (!gl) return;
    game.draw(gl);
    requestAnimationFrame(step);
  }
  step();
}
try {
  initGame();
} catch (e) {
  console.log(e);
  showError("There was a problem with the game initialization");
}
