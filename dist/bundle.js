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
  static multScalar(v1, s) {
    return new _Vec3(v1.x * s, v1.y * s, v1.z * s);
  }
  static div(v1, v2) {
    if (v2.x == 0 || v2.y == 0 || v2.z == 0) throw new Error("v2 has some 0");
    return new _Vec3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
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
  determinant(i = 0, jNotToCheck = []) {
    if (i >= 4) return 1;
    let det = 0;
    for (let k = 0; k < 4; k++) {
      if (!jNotToCheck.includes(k)) {
        const v = this.get(k, i) * this.determinant(i + 1, [k, ...jNotToCheck]);
        det = det + ((i + k) % 2 == 0 ? 1 : -1) * v;
      }
    }
    return det;
  }
  static identity(v = 1) {
    return new _Mat4x4(new Float32Array([
      v,
      0,
      0,
      0,
      0,
      v,
      0,
      0,
      0,
      0,
      v,
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
        const v = m1.get(0, i) * m2.get(j, 0) + m1.get(1, i) * m2.get(j, 1) + m1.get(2, i) * m2.get(j, 2) + m1.get(3, i) * m2.get(j, 3);
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
  static transpose(pos) {
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
      pos.x,
      pos.y,
      pos.z,
      1
    ]));
  }
  static scale(scale) {
    return new _Mat4x4(new Float32Array([
      scale.x,
      0,
      0,
      0,
      0,
      scale.y,
      0,
      0,
      0,
      0,
      scale.z,
      0,
      0,
      0,
      0,
      1
    ]));
  }
  static fromQuat(q) {
    let x = q.vec.x;
    let y = q.vec.y;
    let z = q.vec.z;
    let w = q.r;
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;
    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
    return new _Mat4x4(new Float32Array([
      1 - yy - zz,
      yx + wz,
      zx - wy,
      0,
      yx - wz,
      1 - xx - zz,
      zy + wx,
      0,
      zx + wy,
      zy - wx,
      1 - xx - yy,
      0,
      0,
      0,
      0,
      1
    ]));
  }
};

// src/glMath/Quat.ts
var Quat = class _Quat {
  r;
  vec;
  d;
  constructor(r, vector) {
    this.r = r;
    this.vec = vector;
    this.d = Math.sqrt(r * r + this.vec.x * this.vec.x + this.vec.y * this.vec.y + this.vec.z * this.vec.z);
  }
  normVectorPart() {
    this.vec = Vec3.normalize(this.vec);
  }
  conjugate() {
    return new _Quat(this.r, Vec3.make(-this.vec.x, -this.vec.y, -this.vec.z));
  }
  static make(r, vector) {
    return new _Quat(r, vector);
  }
  static add(q1, q2) {
    return new _Quat(q1.r + q2.r, Vec3.add(q1.vec, q2.vec));
  }
  static normalize(q1) {
    if (q1.d == 0) throw new Error("quat distance is 0");
    return new _Quat(q1.r / q1.d, Vec3.make(q1.vec.x / q1.d, q1.vec.y / q1.d, q1.vec.z / q1.d));
  }
  static hamiltonProduct(q1, q2) {
    const r = q1.r * q2.r - q1.vec.x * q2.vec.x - q1.vec.y * q2.vec.y - q1.vec.z * q2.vec.z;
    const vecX = q1.r * q2.vec.x - q1.vec.x * q2.r - q1.vec.y * q2.vec.z - q1.vec.z * q2.vec.y;
    const vecY = q1.r * q2.vec.y - q1.vec.x * q2.vec.z - q1.vec.y * q2.r - q1.vec.z * q2.vec.x;
    const vecZ = q1.r * q2.vec.z - q1.vec.x * q2.vec.y - q1.vec.y * q2.vec.x - q1.vec.z * q2.r;
    return new _Quat(r, Vec3.make(vecX, vecY, vecZ));
  }
  static makeFromAxis(angle, axis) {
    const nAxis = Vec3.normalize(axis);
    const r = Math.cos(angle / 2);
    let vec = Vec3.multScalar(nAxis, Math.sin(angle / 2));
    return _Quat.normalize(new _Quat(r, vec));
  }
};

// src/Shape.ts
var Shape = class {
  constructor(pos, scale, rotationAxis, rotationAngle, vao, numIndices) {
    this.pos = pos;
    this.scale = scale;
    this.rotationAxis = rotationAxis;
    this.rotationAngle = rotationAngle;
    this.vao = vao;
    this.numIndices = numIndices;
  }
  matWorld = Mat4x4.identity();
  draw(gl, matWorldUniform) {
    let matWorld = Mat4x4.fromQuat(Quat.makeFromAxis(this.rotationAngle, this.rotationAxis));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
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
  total_time;
  shapes;
  width;
  height;
  shaderProgram;
  constructor(gl, width, height, vertexCode, fragmentCode) {
    this.width = width;
    this.height = height;
    this.total_time = 0;
    this.camera_pos = Vec3.make(0, 1, 5);
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
    const UP_VEC = Vec3.make(0, 1, 0);
    this.shapes = [];
    this.shapes.push(new Shape(Vec3.make(0, 1, 0), Vec3.make(0.4, 0.4, 0.4), UP_VEC, 0, this.cubeVao, CUBE_INDICES.length));
    this.shapes.push(new Shape(Vec3.make(2, 1, -1), Vec3.make(1, 1, 1), UP_VEC, 0, this.cubeVao, CUBE_INDICES.length));
  }
  update(dt) {
    this.total_time += dt;
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
    this.shaderProgram.bind(gl);
    const matView = Mat4x4.LookAtRH(
      this.camera_pos,
      Vec3.add(this.camera_pos, Vec3.make(0, 0, -1)),
      Vec3.make(0, 1, 0)
    );
    const matProj = Mat4x4.perspective(
      this.width / this.height,
      1.396263,
      0.01,
      200
    );
    const matViewProj = Mat4x4.multMatrix(matView, matProj);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl, "matViewProj"), false, matViewProj.values);
    const matWorldLoc = this.shaderProgram.getUniform(gl, "matWorld");
    this.shapes.forEach((element) => {
      element.draw(gl, matWorldLoc);
    });
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
