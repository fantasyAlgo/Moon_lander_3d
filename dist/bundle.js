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
function createStaticIndexBuffer(gl, data) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    showError("Failed to allocate buffer");
    throw new Error("Failed to allocate buffer");
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return buffer;
}
function create3dPosColorInterleavedVao(gl, vertexBuffer, indexBuffer, posAttrib, colorAttrib) {
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error("A problem occurred with the creation of the VAO");
  }
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(posAttrib);
  gl.enableVertexAttribArray(colorAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(
    posAttrib,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorAttrib,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return vao;
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
    if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)) {
      const errorMessage = gl.getProgramInfoLog(triangleShaderProgram);
      showError(`Failed to link GPU program: ${errorMessage}`);
      throw new Error("Failed to link program");
    }
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
var CUBE_VERTICES = new Float32Array([
  // Front face
  -1,
  -1,
  1,
  1,
  0,
  0,
  // 0
  1,
  -1,
  1,
  1,
  0,
  0,
  // 1
  1,
  1,
  1,
  1,
  0,
  0,
  // 2
  -1,
  1,
  1,
  1,
  0,
  0,
  // 3
  // Back face
  -1,
  -1,
  -1,
  1,
  0,
  0,
  // 4
  -1,
  1,
  -1,
  1,
  0,
  0,
  // 5
  1,
  1,
  -1,
  1,
  0,
  0,
  // ...
  1,
  -1,
  -1,
  1,
  0,
  0,
  // Top face
  -1,
  1,
  -1,
  0,
  1,
  0,
  -1,
  1,
  1,
  0,
  1,
  0,
  1,
  1,
  1,
  0,
  1,
  0,
  1,
  1,
  -1,
  0,
  1,
  0,
  // Bottom face
  -1,
  -1,
  -1,
  0,
  1,
  0,
  1,
  -1,
  -1,
  0,
  1,
  0,
  1,
  -1,
  1,
  0,
  1,
  0,
  -1,
  -1,
  1,
  0,
  1,
  0,
  // Right face
  1,
  -1,
  -1,
  0,
  0,
  1,
  1,
  1,
  -1,
  0,
  0,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  -1,
  1,
  0,
  0,
  1,
  // Left face
  -1,
  -1,
  -1,
  0,
  0,
  1,
  -1,
  -1,
  1,
  0,
  0,
  1,
  -1,
  1,
  1,
  0,
  0,
  1,
  -1,
  1,
  -1,
  0,
  0,
  1
]);
var CUBE_INDICES = new Uint16Array([
  0,
  1,
  2,
  0,
  2,
  3,
  // front
  4,
  5,
  6,
  4,
  6,
  7,
  // back
  8,
  9,
  10,
  8,
  10,
  11,
  // top
  12,
  13,
  14,
  12,
  14,
  15,
  // bottom
  16,
  17,
  18,
  16,
  18,
  19,
  // right
  20,
  21,
  22,
  20,
  22,
  23
  // left
]);
var TABLE_VERTICES = new Float32Array([
  // Top face
  -10,
  0,
  -10,
  0.2,
  0.2,
  0.2,
  -10,
  0,
  10,
  0.2,
  0.2,
  0.2,
  10,
  0,
  10,
  0.2,
  0.2,
  0.2,
  10,
  0,
  -10,
  0.2,
  0.2,
  0.2
]);
var TABLE_INDICES = new Uint16Array([
  0,
  1,
  2,
  0,
  2,
  3
  // top
]);

// src/glMath/vec4.ts
var Vec4 = class _Vec4 {
  x;
  y;
  z;
  w;
  distance;
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.distance = Math.sqrt(x * x + y * y + z * z + w * w);
  }
  static normalize(v) {
    if (v.distance == 0) throw new Error("v is 0, cannot normalize");
    return new _Vec4(v.x / v.distance, v.y / v.distance, v.z / v.distance, v.w / v.distance);
  }
  static distance(v1, v2) {
    const x = v1.x - v2.x;
    const y = v1.y - v2.y;
    const z = v1.z - v1.z;
    const w = v1.w - v1.w;
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }
  static add(v1, v2) {
    return new _Vec4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w + v2.w);
  }
  static sub(v1, v2) {
    return new _Vec4(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, v1.w - v2.w);
  }
  static mult(v1, v2) {
    return new _Vec4(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z, v1.w * v2.w);
  }
  static clone(v1) {
    return new _Vec4(v1.x, v1.y, v1.z, v1.w);
  }
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
  }
  static cross(a, b) {
    return new _Vec4(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x, 1);
  }
};

// src/glMath/vec3.ts
var Vec3 = class _Vec3 {
  x;
  y;
  z;
  distance;
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.distance = Math.sqrt(x * x + y * y + z * z);
  }
  convertVec4() {
    return new Vec4(this.x, this.y, this.z, 1);
  }
  static normalize(v) {
    if (v.distance == 0) throw new Error("v is 0, cannot normalize");
    return new _Vec3(v.x / v.distance, v.y / v.distance, v.z / v.distance);
  }
  static distance(v1, v2) {
    const x = v1.x - v2.x;
    const y = v1.y - v2.y;
    const z = v1.z - v1.z;
    return Math.sqrt(x * x + y * y + z * z);
  }
  static make(x, y, z) {
    return new _Vec3(x, y, z);
  }
  static add(v1, v2) {
    return new _Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }
  static sub(v1, v2) {
    return new _Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }
  static mult(v1, v2) {
    return new _Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
  }
  static clone(v1) {
    return new _Vec3(v1.x, v1.y, v1.z);
  }
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
  static cross(a, b) {
    return new _Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  }
};

// src/glMath/mat4x4.ts
var Mat4x4 = class _Mat4x4 {
  values;
  constructor(values) {
    if (values.length != 16)
      throw new Error(`Values length is different than 16: ${values.length}`);
    this.values = values;
  }
  get(i, j) {
    return this.values[j * 4 + i];
  }
  set(i, j, v) {
    if (j * 4 + i > 16) throw new Error("Index too high");
    this.values[j * 4 + i] = v;
  }
  multScalar(n) {
    for (let i = 0; i < 16; i++)
      this.values[i] *= n;
  }
  static identity() {
    return new _Mat4x4(new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]));
  }
  static create(val = 0) {
    return new _Mat4x4(new Float32Array([
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val,
      val
    ]));
  }
  static add(m1, m2) {
    let values = [];
    for (let i = 0; i < 16; i++) {
      const v = m1.values[i] + m2.values[i];
      values.push(v);
    }
    return new _Mat4x4(new Float32Array(values));
  }
  static sub(m1, m2) {
    let values = [];
    for (let i = 0; i < 16; i++) {
      const v = m1.values[i] - m2.values[i];
      values.push(v);
    }
    return new _Mat4x4(new Float32Array(values));
  }
  static multMatrix(m1, m2) {
    let values = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const v = m1.get(i, 0) * m2.get(0, j) + m1.get(i, 1) * m2.get(1, j) + m1.get(i, 2) * m2.get(2, j) + m1.get(i, 3) * m2.get(3, j);
        values.push(v);
      }
    }
    return new _Mat4x4(new Float32Array(values));
  }
  static multVec4(m1, vec) {
    let values = [];
    for (let i = 0; i < 4; i++) {
      const v = m1.get(i, 0) * vec.x + m1.get(i, 1) * vec.y + m1.get(i, 2) * vec.z + m1.get(i, 3) * vec.w;
      values.push(v);
    }
    return new Vec4(values[0], values[1], values[2], values[3]);
  }
  static LookAtRH(eye, target, up) {
    const zAxis = Vec3.normalize(Vec3.sub(eye, target));
    const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
    const yAxis = Vec3.cross(zAxis, xAxis);
    const values2 = new Float32Array([
      xAxis.x,
      yAxis.x,
      zAxis.x,
      0,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      0,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      0,
      -Vec3.dot(xAxis, eye),
      -Vec3.dot(yAxis, eye),
      -Vec3.dot(zAxis, eye),
      1
    ]);
    const values = new Float32Array([
      xAxis.x,
      xAxis.y,
      xAxis.z,
      0,
      // X column
      yAxis.x,
      yAxis.y,
      yAxis.z,
      0,
      // Y column
      zAxis.x,
      zAxis.y,
      zAxis.z,
      0,
      // Z column
      -Vec3.dot(xAxis, eye),
      -Vec3.dot(yAxis, eye),
      -Vec3.dot(zAxis, eye),
      1
      // translation column
    ]);
    return new _Mat4x4(values2);
  }
  static perspective(aspect_ratio, fov, zFar, zNear) {
    const fovFactor = 1 / Math.tan(fov / 2);
    const normFactor = zFar / (zFar - zNear);
    const values = new Float32Array([
      fovFactor * aspect_ratio,
      0,
      0,
      0,
      0,
      fovFactor,
      0,
      0,
      0,
      0,
      normFactor,
      -1,
      0,
      0,
      -normFactor * zNear,
      0
    ]);
    return new _Mat4x4(values);
  }
  static T(m) {
    let values = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const v = m.get(i, j);
        values.push(v);
      }
    }
    return new _Mat4x4(new Float32Array(values));
  }
};

// src/Game.ts
var Game = class {
  cubeVertices;
  tableVertices;
  cubeIndices;
  tableIndices;
  cubeVao;
  tableVao;
  camera_pos;
  width;
  height;
  shaderProgram;
  constructor(gl, width, height, vertexCode, fragmentCode) {
    this.width = width;
    this.height = height;
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const cubeVertices = createStaticBufferData(gl, CUBE_VERTICES);
    const tableVertices = createStaticBufferData(gl, TABLE_VERTICES);
    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const tableIndices = createStaticIndexBuffer(gl, TABLE_INDICES);
    if (!cubeVertices || !tableIndices || !tableVertices || !cubeIndices) {
      showError(`Failed to create some buffers`);
    }
    this.shaderProgram = new ShaderProgram(gl, vertexCode, fragmentCode);
    const vPosLoc = this.shaderProgram.getAttrib(gl, "vPos");
    const vColorLoc = this.shaderProgram.getAttrib(gl, "vColor");
    const matWorldUni = this.shaderProgram.getUniform(gl, "matWorld");
    const matViewProjUni = this.shaderProgram.getUniform(gl, "matViewProj");
    if (vPosLoc < 0 || vColorLoc < 0) {
      if (vPosLoc < 0) showError("vPos wasnt found");
      if (vColorLoc < 0) showError("vColor wasnt found");
      return;
    }
    if (!matViewProjUni || !matWorldUni) {
      showError(`Data: ${matViewProjUni}, ${matWorldUni}`);
    }
    this.cubeVao = create3dPosColorInterleavedVao(gl, cubeVertices, cubeIndices, vPosLoc, vColorLoc);
    this.tableVao = create3dPosColorInterleavedVao(gl, tableVertices, tableIndices, vPosLoc, vColorLoc);
    if (!this.cubeVao || !this.tableVao) {
      showError("Vao were not created");
    }
    console.log("error: ", gl.getError());
    gl.viewport(0, 0, this.width, this.height);
    this.camera_pos = Vec3.make(0, 0, 5);
  }
  update(dt) {
  }
  handleKeyDown(e) {
    if (e.key == "w")
      this.camera_pos.z += 0.1;
    if (e.key == "a")
      this.camera_pos.x -= 0.1;
    if (e.key == "d")
      this.camera_pos.x += 0.1;
    if (e.key == "s")
      this.camera_pos.z -= 0.1;
    if (e.key == "e") this.camera_pos.y += 0.1;
    if (e.key == "q") this.camera_pos.y -= 0.1;
  }
  handleKeyUp(e) {
  }
  handleMouseMovement(e) {
  }
  draw(gl) {
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    this.shaderProgram.bind(gl);
    const matWorld = Mat4x4.identity();
    const matView = Mat4x4.LookAtRH(
      this.camera_pos,
      Vec3.make(0, 0, 0),
      Vec3.make(0, 1, 0)
    );
    console.log("matView values:", matView.values);
    const matProj = Mat4x4.perspective(
      this.width / this.height,
      1.396263,
      0.1,
      100
    );
    console.log("matProj values:", matProj.values);
    const matViewProj = Mat4x4.multMatrix(matProj, matView);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl, "matWorld"), false, matWorld.values);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl, "matViewProj"), false, Mat4x4.T(matViewProj).values);
    gl.bindVertexArray(this.cubeVao);
    gl.drawElements(gl.TRIANGLES, CUBE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    console.log("error: ", gl.getError());
  }
};

// src/main.ts
async function loadText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}
var game;
function initGame(data) {
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
  console.log(data["vertexCode"]);
  game = new Game(gl, canvas.width, canvas.height, data["vertexCode"], data["fragmentCode"]);
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
  (async () => {
    const vertexCode = await loadText("src/shaders/vertex.glsl");
    const fragmentCode = await loadText("src/shaders/fragment.glsl");
    initGame({ vertexCode, fragmentCode });
  })();
} catch (e) {
  console.log(e);
  showError("There was a problem with the game initialization");
}
document.addEventListener("keydown", (e) => {
  game.handleKeyDown(e);
});
document.addEventListener("keyup", (e) => {
  game.handleKeyUp(e);
});
document.addEventListener("mousemove", (e) => {
  game.handleMouseMovement(e);
});
