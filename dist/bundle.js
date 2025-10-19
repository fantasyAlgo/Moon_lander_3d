// src/helpers/glHelpers.ts
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
function createBufferData(gl, data, type) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    showError("Failed to allocate buffer");
    throw new Error("Failed to allocate buffer");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, type);
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
function create3dPosColorInterleavedVao(gl, vertexBuffer, indexBuffer, posAttrib, colorAttrib, normalAttrib, uvAttrib) {
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error("A problem occurred with the creation of the VAO");
  }
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(posAttrib);
  gl.enableVertexAttribArray(colorAttrib);
  gl.enableVertexAttribArray(normalAttrib);
  gl.enableVertexAttribArray(uvAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(
    posAttrib,
    3,
    gl.FLOAT,
    false,
    11 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorAttrib,
    3,
    gl.FLOAT,
    false,
    11 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.vertexAttribPointer(
    normalAttrib,
    3,
    gl.FLOAT,
    false,
    11 * Float32Array.BYTES_PER_ELEMENT,
    6 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.vertexAttribPointer(
    uvAttrib,
    2,
    gl.FLOAT,
    false,
    11 * Float32Array.BYTES_PER_ELEMENT,
    9 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return vao;
}
function createFloorVao(gl, vertexBuffer, indexBuffer, posAttrib, normalAttrib) {
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error("A problem occurred with the creation of the VAO");
  }
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(posAttrib);
  gl.enableVertexAttribArray(normalAttrib);
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
    normalAttrib,
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
function makeRandomMatrix(width, height) {
  let lst = [];
  for (let i = 0; i < width * height; i++) {
    lst.push(Math.random());
  }
  return new Float32Array(lst);
}
function makeHeightTextureFromData(gl, data, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R32F,
    width,
    height,
    0,
    gl.RED,
    gl.FLOAT,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

// src/helpers/shaderProgram.ts
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

// src/helpers/CoupledVertex.ts
var CoupledFloorVertex = class {
  constructor(pos, normal) {
    this.pos = pos;
    this.normal = normal;
  }
};
function webglVerticesFromCoupledFloorVertices(vertices) {
  const lst = [];
  const size = vertices.length;
  for (let i = 0; i < size; i++) {
    lst.push(vertices[i].pos.x);
    lst.push(vertices[i].pos.y);
    lst.push(vertices[i].pos.z);
    lst.push(vertices[i].normal.x);
    lst.push(vertices[i].normal.y);
    lst.push(vertices[i].normal.z);
  }
  return new Float32Array(lst);
}
var CoupledVertex = class {
  constructor(pos, color, normal, uv) {
    this.pos = pos;
    this.color = color;
    this.normal = normal;
    this.uv = uv;
  }
};
function webglVerticesFromCoupledVertices(vertices) {
  const lst = [];
  const size = vertices.length;
  for (let i = 0; i < size; i++) {
    lst.push(vertices[i].pos.x);
    lst.push(vertices[i].pos.y);
    lst.push(vertices[i].pos.z);
    lst.push(vertices[i].color.x);
    lst.push(vertices[i].color.y);
    lst.push(vertices[i].color.z);
    lst.push(vertices[i].normal.x);
    lst.push(vertices[i].normal.y);
    lst.push(vertices[i].normal.z);
    lst.push(vertices[i].uv.x);
    lst.push(vertices[i].uv.y);
  }
  return new Float32Array(lst);
}

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
  convertToVec3() {
    return Vec3.make(this.x, this.y, this.z);
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
  static make(x, y, z, w) {
    return new _Vec4(x, y, z, w);
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
  clamp(xMin, xMax, yMin, yMax, zMin, zMax) {
    this.x = this.x < xMin ? xMin : this.x > xMax ? xMax : this.x;
    this.y = this.y < yMin ? yMin : this.y > yMax ? yMax : this.y;
    this.z = this.z < zMin ? zMin : this.z > zMax ? zMax : this.z;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }
  static normalize(v) {
    if (v.distance == 0) return v;
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
  static perp(A, B) {
    const ORIGIN2 = _Vec3.make(0, 0, 0);
    const AO = _Vec3.normalize(_Vec3.sub(ORIGIN2, A));
    const AB = _Vec3.normalize(_Vec3.sub(B, A));
    const C = _Vec3.cross(AB, AO);
    let N = _Vec3.cross(C, AB);
    if (_Vec3.dot(N, AO) < 0) N = _Vec3.multScalar(N, -1);
    return _Vec3.normalize(N);
  }
};

// src/helpers/loadPerlinFloor.ts
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
  // Front face (normal: 0, 0, 1)
  -1,
  -1,
  1,
  1,
  0,
  0,
  0,
  0,
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
  0,
  0,
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
  0,
  0,
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
  0,
  0,
  1,
  0,
  0,
  // 3
  // Back face (normal: 0, 0, -1)           0.0, 0.0,
  -1,
  -1,
  -1,
  1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  // 4
  -1,
  1,
  -1,
  1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  // 5
  1,
  1,
  -1,
  1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  // 6
  1,
  -1,
  -1,
  1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  // 7
  // Top face (normal: 0, 1, 0)             0.0, 0.0,
  -1,
  1,
  -1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  -1,
  1,
  1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  1,
  1,
  1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  1,
  1,
  -1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  // Bottom face (normal: 0, -1, 0)         0.0, 0.0,
  -1,
  -1,
  -1,
  0,
  1,
  0,
  0,
  -1,
  0,
  0,
  0,
  1,
  -1,
  -1,
  0,
  1,
  0,
  0,
  -1,
  0,
  0,
  0,
  1,
  -1,
  1,
  0,
  1,
  0,
  0,
  -1,
  0,
  0,
  0,
  -1,
  -1,
  1,
  0,
  1,
  0,
  0,
  -1,
  0,
  0,
  0,
  // Right face (normal: 1, 0, 0)           0.0, 0.0,
  1,
  -1,
  -1,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  0,
  1,
  1,
  -1,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  0,
  1,
  -1,
  1,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  0,
  // Left face (normal: -1, 0, 0)           0.0, 0.0,
  -1,
  -1,
  -1,
  0,
  0,
  1,
  -1,
  0,
  0,
  0,
  0,
  -1,
  -1,
  1,
  0,
  0,
  1,
  -1,
  0,
  0,
  0,
  0,
  -1,
  1,
  1,
  0,
  0,
  1,
  -1,
  0,
  0,
  0,
  0,
  -1,
  1,
  -1,
  0,
  0,
  1,
  -1,
  0,
  0,
  0,
  0
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
  0,
  1,
  0,
  0,
  0,
  -10,
  0,
  10,
  0.2,
  0.2,
  0.2,
  0,
  1,
  0,
  0,
  1,
  10,
  0,
  10,
  0.2,
  0.2,
  0.2,
  0,
  1,
  0,
  1,
  1,
  10,
  0,
  -10,
  0.2,
  0.2,
  0.2,
  0,
  1,
  0,
  1,
  1
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
function getFloorVertices(perlin3d, chunk) {
  let lst = [];
  const W = perlin3d.grid_width;
  const H = perlin3d.grid_height;
  for (let i = H; i >= 0; i--) {
    for (let j = 0; j <= W; j++) {
      const height = 10 * perlin3d.get((i + chunk.y * H) / 50, (j + chunk.x * W) / 50);
      const rValue = Math.random() / 40;
      const pos = Vec3.make(2 * j / H - 1, height, 2 * i / W - 1);
      const vertex = new CoupledFloorVertex(pos, Vec3.make(0, rValue, 0));
      lst.push(vertex);
    }
  }
  for (let i = 1; i < H - 1; i++) {
    for (let j = 1; j < W - 1; j++) {
      const up = lst[(i - 1) * H + j].pos.y;
      const down = lst[(i - 1) * H + j].pos.y;
      const left = lst[i * H + j - 1].pos.y;
      const right = lst[i * H + j + 1].pos.y;
      lst[i * H + j].normal.x = up - down;
      lst[i * H + j].normal.z = left - right;
    }
  }
  return webglVerticesFromCoupledFloorVertices(lst);
}
function getFloorIndices(grid_width, grid_height) {
  const indices = [];
  const W = grid_width;
  const H = grid_height;
  for (let i = H; i >= 0; i--) {
    for (let j = 0; j < W; j++) {
      if (i - 1 != j) {
        indices.push(i * H + j);
        indices.push((i + 1) * H + j + 1);
        indices.push(i * H + j + 1);
      }
      if (i != j) {
        indices.push(i * H + j);
        indices.push((i + 1) * H + j);
        indices.push((i + 1) * H + j + 1);
      }
    }
  }
  console.log(indices.slice(17 * 3, 19 * 3));
  return new Uint16Array(indices);
}

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
  static perspective(aspect_ratio, fov, zNear, zFar) {
    const fovFactor = 1 / Math.tan(fov / 2);
    const normFactor = 1 / (zFar - zNear);
    const values = new Float32Array([
      fovFactor / aspect_ratio,
      0,
      0,
      0,
      0,
      fovFactor,
      0,
      0,
      0,
      0,
      (zFar + zNear) * normFactor,
      -1,
      0,
      0,
      2 * zFar * zFar * normFactor,
      0
    ]);
    const values2 = new Float32Array([
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
    return new _Mat4x4(values2);
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

// src/glMath/vec2.ts
var Vec2 = class _Vec2 {
  x;
  y;
  distance;
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.distance = Math.sqrt(x * x + y * y);
  }
  clamp(xMin, xMax, yMin, yMax) {
    this.x = this.x < xMin ? xMin : this.x > xMax ? xMax : this.x;
    this.y = this.y < yMin ? yMin : this.y > yMax ? yMax : this.y;
  }
  equal(v) {
    const EPS = 1e-3;
    return Math.abs(v.x - this.x) < EPS && Math.abs(v.y - this.y) < EPS;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
  }
  static normalize(v) {
    if (v.distance == 0) throw new Error("v is 0, cannot normalize");
    return new _Vec2(v.x / v.distance, v.y / v.distance);
  }
  static distance(v1, v2) {
    const x = v1.x - v2.x;
    const y = v1.y - v2.y;
    return Math.sqrt(x * x + y * y);
  }
  static make(x, y) {
    return new _Vec2(x, y);
  }
  static add(v1, v2) {
    return new _Vec2(v1.x + v2.x, v1.y + v2.y);
  }
  static sub(v1, v2) {
    return new _Vec2(v1.x - v2.x, v1.y - v2.y);
  }
  static mult(v1, v2) {
    return new _Vec2(v1.x * v2.x, v1.y * v2.y);
  }
  static multScalar(v1, s) {
    return new _Vec2(v1.x * s, v1.y * s);
  }
  static div(v1, v2) {
    if (v2.x == 0 || v2.y == 0) throw new Error("v2 has some 0");
    return new _Vec2(v1.x / v2.x, v1.y / v2.y);
  }
  static clone(v1) {
    return new _Vec2(v1.x, v1.y);
  }
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }
};

// src/Camera.ts
var UP_VEC = Vec3.make(0, 1, 0);
var Camera = class {
  pos;
  forward;
  perpective;
  lookAtMatrix;
  constructor(initial_pos, width, height, Fov, zNear, zFar) {
    this.perpective = Mat4x4.perspective(height / width, Fov, zNear, zFar);
    this.pos = initial_pos;
    this.forward = Vec3.normalize(Vec3.make(0.5, 0.2, -1));
  }
  update(moveVec, mouseMoveVec, player_pos, camera_dist, dt) {
    const SENSIBILITY = 0.25;
    this.pos = Vec3.add(player_pos, Vec3.multScalar(this.forward, -camera_dist));
    this.forward = Vec3.normalize(Vec3.sub(player_pos, this.pos));
    const moveMatrix = Mat4x4.T(Mat4x4.LookAtRH(Vec3.make(0, 0, 0), this.forward, UP_VEC));
    const newMouseVec = Mat4x4.multVec4(moveMatrix, Vec4.make(mouseMoveVec.x, mouseMoveVec.y, 0, 1));
    this.forward = Vec3.add(this.forward, Vec3.multScalar(newMouseVec.convertToVec3(), SENSIBILITY * dt * 0.01));
    this.pos = Vec3.add(player_pos, Vec3.multScalar(this.forward, -camera_dist));
    this.lookAtMatrix = this.getLookAt();
  }
  getLookAt() {
    return Mat4x4.LookAtRH(this.pos, Vec3.add(this.pos, this.forward), UP_VEC);
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
  rotate(v) {
    const q = _Quat.make(0, v);
    const rotated = _Quat.hamiltonProduct(_Quat.hamiltonProduct(this, q), this.conjugate());
    return rotated.vec;
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
    const vecX = q1.r * q2.vec.x + q1.vec.x * q2.r + q1.vec.y * q2.vec.z - q1.vec.z * q2.vec.y;
    const vecY = q1.r * q2.vec.y - q1.vec.x * q2.vec.z + q1.vec.y * q2.r + q1.vec.z * q2.vec.x;
    const vecZ = q1.r * q2.vec.z + q1.vec.x * q2.vec.y - q1.vec.y * q2.vec.x + q1.vec.z * q2.r;
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
  constructor(pos, scale, program, vao, numIndices, vertices = new Float32Array([])) {
    this.pos = pos;
    this.scale = scale;
    this.program = program;
    this.vao = vao;
    this.numIndices = numIndices;
    this.vertices = vertices;
    this.rot = Quat.makeFromAxis(0, Vec3.make(0, 1, 0));
  }
  model = Mat4x4.identity();
  vel = Vec3.make(0, 0, 0);
  tForce = Vec3.make(0, 0, 0);
  mass = 1;
  rot;
  rotationAxis = Vec3.make(0, 1, 0);
  rotationAngle = 0;
  modelData = [];
  setRotation(quaterions) {
    if (quaterions.length == 0) return;
    let q = quaterions[0];
    for (let i = 1; i < quaterions.length; i++)
      q = Quat.hamiltonProduct(q, quaterions[i]);
    this.rot = Quat.normalize(q);
  }
  updateWorldData() {
    let result = [];
    for (let i = 0; i < this.vertices.length; i += 11) {
      const v = Vec4.make(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2], 1);
      const rV = Mat4x4.multVec4(this.model, v);
      result.push(rV.convertToVec3());
    }
    this.modelData = result;
  }
  draw(gl) {
    const matWorldUniform = this.program.getUniform(gl, "matWorld");
    let matWorld = Mat4x4.fromQuat(this.rot);
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));
    this.model = matWorld;
    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
  getCenter() {
    let sum = Vec3.make(0, 0, 0);
    this.modelData.forEach((x) => {
      sum = Vec3.add(sum, x);
    });
    return Vec3.multScalar(sum, 1 / this.modelData.length);
  }
  static getSupportPoint(s, dir) {
    let bV = Vec3.make(0, 0, 0);
    let bestDot = -Infinity;
    for (let i = 0; i < s.length; i++) {
      const d = Vec3.dot(s[i], dir);
      if (d > bestDot) {
        bV = s[i];
        bestDot = d;
      }
    }
    return bV;
  }
};

// src/Light.ts
var Light = class extends Shape {
  constructor(pos, scale, program, vao, numIndices, color, vertices = new Float32Array([])) {
    super(pos, scale, program, vao, numIndices, vertices);
    this.color = color;
  }
};

// src/helpers/Perlin3d.ts
function fade(t) {
  return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
}
var Perlin3d = class {
  grid_width;
  grid_height;
  octaves;
  constructor(grid_width, grid_height, n_octaves = 2) {
    this.grid_height = grid_height;
    this.grid_width = grid_width;
    this.octaves = [];
    let gw = grid_width;
    let gh = grid_height;
    for (let i = 0; i < n_octaves; i++) {
      this.octaves.push(new Octave(gw, gh));
      gw *= 2;
      gh *= 2;
    }
  }
  get(x = 0, y = 0) {
    let copyX = x;
    let copyY = y;
    let value = 0;
    for (let i = 0; i < this.octaves.length; i++) {
      copyX *= 2;
      copyY *= 2;
      value += this.octaves[i].get(copyX, copyY);
    }
    return value / this.octaves.length;
  }
};
var Octave = class {
  grid;
  grid_width;
  grid_height;
  constructor(grid_width, grid_height) {
    this.grid_height = grid_height;
    this.grid_width = grid_width;
    this.grid = [];
    for (let i = 0; i < grid_width + 2; i++) {
      let lst = [];
      for (let j = 0; j < grid_height + 2; j++) {
        lst.push(Vec2.normalize(Vec2.make(1 - 2 * Math.random(), 1 - 2 * Math.random())));
      }
      this.grid.push(lst);
    }
  }
  get(x = 0, y = 0) {
    if (x < 0) x *= -1;
    if (y < 0) y *= -1;
    const percX = x - Math.floor(x);
    const percY = y - Math.floor(y);
    const iX = Math.floor(x) % this.grid_width;
    const iY = Math.floor(y) % this.grid_height;
    const vec = Vec2.make(percX, percY);
    const d00 = -Vec2.dot(Vec2.sub(vec, Vec2.make(0, 0)), this.grid[iX][iY]);
    const d10 = -Vec2.dot(Vec2.sub(vec, Vec2.make(1, 0)), this.grid[iX + 1][iY]);
    const d01 = -Vec2.dot(Vec2.sub(vec, Vec2.make(0, 1)), this.grid[iX][iY + 1]);
    const d11 = -Vec2.dot(Vec2.sub(vec, Vec2.make(1, 1)), this.grid[iX + 1][iY + 1]);
    const u = fade(percX);
    const v = fade(percY);
    const ix0 = d00 * (1 - u) + d10 * u;
    const ix1 = d01 * (1 - u) + d11 * u;
    const value = ix0 * (1 - v) + ix1 * v;
    return value;
  }
};

// src/PerlinFloor.ts
var QueueChanges = class {
  constructor(from, to, chunkI) {
    this.from = from;
    this.to = to;
    this.chunkI = chunkI;
  }
};
var PendingUpdateSwap = class {
  constructor(from, to, values) {
    this.from = from;
    this.to = to;
    this.values = values;
  }
};
var PerlinFloor = class {
  shapes = [];
  verticesVBO = [];
  floorVAOs = [];
  shader;
  noiseTexture;
  WIDTH = 20;
  HEIGHT = 20;
  cChunk;
  queueChanges = [];
  pendingUpdateSwaps = [];
  testData = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  constructor(gl, perlin3d, shader, initial_pos) {
    const nChunks = 3;
    this.shader = shader;
    const xIndxChunk = Math.floor((Math.abs(initial_pos.x) + this.WIDTH) / (this.WIDTH * 2));
    const yIndxChunk = Math.floor((Math.abs(initial_pos.z) + this.HEIGHT) / (this.HEIGHT * 2));
    const xChunk = xIndxChunk * this.WIDTH * 2 * Math.sign(initial_pos.x);
    const yChunk = yIndxChunk * this.HEIGHT * 2 * Math.sign(initial_pos.z);
    this.cChunk = Vec2.make(xChunk, yChunk);
    const floorIndicesData = getFloorIndices(perlin3d.grid_width, perlin3d.grid_height);
    const floorIndices = createStaticIndexBuffer(gl, floorIndicesData);
    console.log("error 2: ", gl.getError());
    const vPosLoc = shader.getAttrib(gl, "vPos");
    const vNormalLoc = shader.getAttrib(gl, "vNormal");
    const noise_width = 256 * 2;
    this.noiseTexture = makeHeightTextureFromData(gl, makeRandomMatrix(noise_width, noise_width), noise_width, noise_width);
    shader.bind(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.uniform1i(shader.getUniform(gl, "u_noiseTex"), 0);
    gl.uniform2f(this.shader.getUniform(gl, "chunkPos"), this.cChunk.x, this.cChunk.y);
    for (let i = 0; i < nChunks * nChunks; i++) {
      const pos = Vec2.make(Math.floor(i / nChunks) - 1, i % nChunks - 1);
      const iX = Math.floor((this.cChunk.x - this.WIDTH) / (this.WIDTH * 2));
      const iY = Math.floor((this.cChunk.y - this.HEIGHT) / (this.HEIGHT * 2));
      const floorVerticesData = getFloorVertices(perlin3d, Vec2.add(pos, Vec2.make(iX, iY)));
      this.verticesVBO.push(createBufferData(gl, floorVerticesData, gl.DYNAMIC_DRAW));
      const vao = createFloorVao(gl, this.verticesVBO[this.verticesVBO.length - 1], floorIndices, vPosLoc, vNormalLoc);
      const UP_VEC3 = Vec3.make(0, 1, 0);
      this.shapes.push(
        new Shape(Vec3.make(pos.x * this.WIDTH * 2, 0, pos.y * this.HEIGHT * 2), Vec3.make(this.WIDTH, 1, this.HEIGHT), shader, vao, floorIndicesData.length)
      );
    }
    this.pendingUpdateSwaps = [];
    console.log(this.testData.slice(0, 3), "\n", this.testData.slice(3, 6), "\n", this.testData.slice(6, 9));
    shader.unbind(gl);
  }
  getValue(p, x, y) {
    const i = (x / this.WIDTH + 1) * p.grid_width;
    const j = (y / this.HEIGHT + 1) * p.grid_height;
  }
  updateChunk(gl, perlin3d, newChunk) {
    const dx = Math.sign(this.cChunk.x - newChunk.x);
    const dy = Math.sign(this.cChunk.y - newChunk.y);
    const iX = (this.cChunk.x - this.WIDTH) / (this.WIDTH * 2);
    const iY = (this.cChunk.y - this.HEIGHT) / (this.HEIGHT * 2);
    const chunk = Vec2.make(iX, iY);
    if (dy < 0) {
      this.queueChanges.push(new QueueChanges(0, 2, chunk));
      this.queueChanges.push(new QueueChanges(3, 5, chunk));
      this.queueChanges.push(new QueueChanges(6, 8, chunk));
    }
    if (dy > 0) {
      this.queueChanges.push(new QueueChanges(2, 0, chunk));
      this.queueChanges.push(new QueueChanges(5, 3, chunk));
      this.queueChanges.push(new QueueChanges(8, 6, chunk));
    }
    if (dx < 0) {
      this.queueChanges.push(new QueueChanges(0, 6, chunk));
      this.queueChanges.push(new QueueChanges(1, 7, chunk));
      this.queueChanges.push(new QueueChanges(2, 8, chunk));
    }
    if (dx > 0) {
      this.queueChanges.push(new QueueChanges(6, 0, chunk));
      this.queueChanges.push(new QueueChanges(7, 1, chunk));
      this.queueChanges.push(new QueueChanges(8, 2, chunk));
    }
    this.cChunk = newChunk;
  }
  swap(from, to) {
    [this.verticesVBO[to], this.verticesVBO[from]] = [this.verticesVBO[from], this.verticesVBO[to]];
    [this.shapes[to].vao, this.shapes[from].vao] = [this.shapes[from].vao, this.shapes[to].vao];
    [this.testData[to], this.testData[from]] = [this.testData[from], this.testData[to]];
  }
  updateSwaps(gl) {
    if (this.queueChanges.length > 0) return;
    for (const { from, to, values } of this.pendingUpdateSwaps) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO[from]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, values);
      gl.bindVertexArray(null);
      const mid = Math.floor((from + to) / 2);
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
  update(gl, perlin3d, pos) {
    if (this.queueChanges.length > 0) {
      const el = this.queueChanges.shift();
      if (el == void 0) return;
      const iX = Math.floor((this.cChunk.x - this.WIDTH) / (this.WIDTH * 2));
      const iY = Math.floor((this.cChunk.y - this.HEIGHT) / (this.HEIGHT * 2));
      const chunkPos = Vec2.make(iX + Math.floor(el.to / 3) - 1, iY + el.to % 3 - 1);
      const new_values = getFloorVertices(perlin3d, chunkPos);
      this.pendingUpdateSwaps.push(new PendingUpdateSwap(el.from, el.to, new_values));
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error("WebGL Error in update:", error);
      }
    }
    const xIndxChunk = Math.floor((Math.abs(pos.x) + this.WIDTH) / (this.WIDTH * 2));
    const yIndxChunk = Math.floor((Math.abs(pos.z) + this.HEIGHT) / (this.HEIGHT * 2));
    const xChunk = xIndxChunk * this.WIDTH * 2 * Math.sign(pos.x);
    const yChunk = yIndxChunk * this.HEIGHT * 2 * Math.sign(pos.z);
    const chunk = Vec2.make(xChunk, yChunk);
    if (!this.cChunk.equal(chunk)) {
      this.updateChunk(gl, perlin3d, chunk);
    }
    this.shader.bind(gl);
  }
  draw(gl) {
    this.shapes.forEach((element) => {
      element.draw(gl);
    });
  }
};

// src/Player.ts
var UP_VEC2 = Vec3.make(0, 1, 0);
var Player = class extends Shape {
  constructor(pos, scale, program, vao, numIndices, vertices, camera_dist) {
    super(pos, scale, program, vao, numIndices, vertices);
    this.camera_dist = camera_dist;
    const q1 = Quat.normalize(Quat.make(0.35, Vec3.make(43, 542, 232)));
    const q2 = Quat.normalize(Quat.make(364, Vec3.make(475, 235, 323)));
    console.log("check this: ", q1, q2, Quat.hamiltonProduct(q1, q2));
  }
  update(moveVec, camera, dt) {
    const sub = Vec3.sub(Vec3.make(-moveVec.z, 0, moveVec.x), this.rotationAxis);
    this.rotationAxis = Vec3.add(this.rotationAxis, Vec3.multScalar(sub, 5e-3 * dt));
    if (this.rotationAxis.x == 0 && this.rotationAxis.y == 0 && this.rotationAxis.z == 0)
      this.rotationAxis = UP_VEC2;
    const angle = Math.atan2(camera.forward.x, camera.forward.z);
    this.setRotation([Quat.makeFromAxis(angle, UP_VEC2), Quat.makeFromAxis(Math.PI / 2, this.rotationAxis)]);
    const perp = this.rot.rotate(Vec3.make(0, 1, 0));
    if (moveVec.y > 0)
      this.vel = Vec3.add(this.vel, Vec3.multScalar(perp, 5e-4 * dt));
    this.vel.x *= 0.99;
    this.vel.z *= 0.99;
    const subY = Vec3.sub(Vec3.make(0, 1, 0), this.rotationAxis);
    if (moveVec.x == 0 && moveVec.z == 0)
      this.rotationAxis = Vec3.add(this.rotationAxis, Vec3.multScalar(subY, 5e-3 * dt));
    this.pos = Vec3.add(this.pos, Vec3.multScalar(this.vel, 2 * dt));
  }
};

// src/Physics.ts
var GRAVITY = -1e-4;
var ATMOSPHERE_FRICTION = 1e-3;
function updateEntitiesPhysics(entities, dt) {
  for (let e of entities) {
    updateEntity(e, dt);
  }
}
function updateEntity(e, dt) {
  e.vel.y += dt * (GRAVITY - ATMOSPHERE_FRICTION * e.vel.y);
}

// src/helpers/CollisionHelpers.ts
function getFloorProjection(s) {
  let leftMost = Vec2.make(Infinity, 0);
  let rightMost = Vec2.make(-Infinity, 0);
  let upMost = Vec2.make(0, -Infinity);
  let bottomMost = Vec2.make(0, Infinity);
  for (let i = 0; i < s.length; i++) {
    if (s[i].x > rightMost.x)
      rightMost.copy(Vec2.make(s[i].x, s[i].z));
    if (s[i].x < leftMost.x)
      leftMost.copy(Vec2.make(s[i].x, s[i].z));
    if (s[i].z > upMost.y)
      upMost.copy(Vec2.make(s[i].x, s[i].z));
    if (s[i].z < bottomMost.y)
      bottomMost.copy(Vec2.make(s[i].x, s[i].z));
  }
  return [rightMost, leftMost, upMost, bottomMost];
}

// src/Collision.ts
var ORIGIN = Vec3.make(0, 0, 0);
var Collision = class _Collision {
  collided;
  normal;
  depth;
  contact_points;
  constructor(collided, normal = Vec3.make(0, 0, 0), depth = 0) {
    this.collided = collided;
    this.normal = normal;
    this.depth = depth;
    this.contact_points = [];
  }
  static supportPoint(d1, d2, dir) {
    return Vec3.sub(Shape.getSupportPoint(d1, dir), Shape.getSupportPoint(d2, Vec3.multScalar(dir, -1)));
  }
  static checkShapeCollision(s1, s2) {
    const data1 = s1.modelData;
    const data2 = s2.modelData;
    const c1 = s1.getCenter();
    const c2 = s2.getCenter();
    let dir = Vec3.sub(c1, c2);
    return _Collision.GJK(data1, data2, dir);
  }
  static checkPerlinCollision(s1, p, pHandler) {
    const data = s1.modelData;
    const abab = getFloorProjection(data);
    let floorPoints = [];
    const f = (e) => {
      floorPoints.push(Vec3.make(
        e.x,
        pHandler.getValue(e.x, e.y),
        e.y
      ));
      floorPoints.push(Vec3.make(
        e.x,
        -100,
        e.y
      ));
    };
    abab.forEach(f);
    return _Collision.GJK(data, floorPoints, Vec3.make(1, 0, 0));
  }
  static GJK(data1, data2, initial_dir) {
    let dir = initial_dir;
    let p;
    let simplex = [_Collision.supportPoint(data1, data2, dir)];
    dir = Vec3.normalize(Vec3.sub(ORIGIN, simplex[0]));
    let t = 0;
    while (t++ < 128) {
      p = _Collision.supportPoint(data1, data2, dir);
      if (Vec3.dot(p, dir) <= 0) return new _Collision(false);
      simplex.push(p);
      if (_Collision.handleSimplex(simplex, dir)) {
        return new _Collision(true);
      }
    }
    return new _Collision(false);
  }
  static handleSimplex(simplex, dir) {
    if (simplex.length <= 1 || simplex.length > 4) throw new Error("GJK produced a simplex with an invalid number of vertices");
    if (simplex.length == 2) return _Collision.setNewPoint(simplex, dir);
    else if (simplex.length == 3) return _Collision.checkTriangle(simplex, dir);
    else return _Collision.checkTetrahedron(simplex, dir);
  }
  static setNewPoint(simplex, dir) {
    const A = simplex[0];
    const B = simplex[1];
    const ABP = Vec3.cross(A, B);
    const AO = Vec3.sub(ORIGIN, A);
    if (Vec3.dot(ABP, AO) > 0) dir.copy(ABP);
    else dir.copy(Vec3.multScalar(ABP, -1));
    return false;
  }
  static checkTriangle(simplex, dir) {
    if (simplex.length < 3) return false;
    const A = simplex[0];
    const B = simplex[1];
    const C = simplex[2];
    const CO = Vec3.normalize(Vec3.sub(ORIGIN, C));
    const BO = Vec3.normalize(Vec3.sub(ORIGIN, B));
    const AO = Vec3.normalize(Vec3.sub(ORIGIN, A));
    let BCPerp = Vec3.perp(C, B);
    if (Vec3.dot(BCPerp, Vec3.sub(A, C)) > 0) BCPerp = Vec3.multScalar(BCPerp, -1);
    let ACPerp = Vec3.perp(A, C);
    if (Vec3.dot(ACPerp, Vec3.sub(B, C)) > 0) ACPerp = Vec3.multScalar(ACPerp, -1);
    let ABPerp = Vec3.perp(B, A);
    if (Vec3.dot(ABPerp, Vec3.sub(C, A)) > 0) ABPerp = Vec3.multScalar(ABPerp, -1);
    const BC_CO = Vec3.dot(BCPerp, CO);
    const AC_CO = Vec3.dot(ACPerp, CO);
    const AC_AO = Vec3.dot(ACPerp, AO);
    const AB_AO = Vec3.dot(ABPerp, AO);
    const AB_BO = Vec3.dot(ABPerp, BO);
    const BC_BO = Vec3.dot(BCPerp, BO);
    if (AC_CO > 0 && BC_CO > 0) {
      simplex.length = 0;
      simplex.push(C);
      dir.copy(CO);
      return false;
    } else if (AC_AO >= 0 && AB_AO >= 0) {
      simplex.length = 0;
      simplex.push(A);
      dir.copy(AO);
      return false;
    } else if (AB_BO >= 0 && BC_BO >= 0) {
      simplex.length = 0;
      simplex.push(B);
      dir.copy(BO);
      return false;
    } else if (BC_CO >= 0) {
      simplex.splice(0, 1);
      dir.copy(BCPerp);
      return false;
    } else if (AC_AO >= 0) {
      simplex.splice(1, 1);
      dir.copy(ACPerp);
      return false;
    } else if (AB_BO >= 0) {
      simplex.splice(2, 1);
      dir.copy(ABPerp);
      return false;
    }
    let abc = Vec3.cross(Vec3.sub(B, A), Vec3.sub(C, A));
    if (Vec3.dot(abc, BO) < 0) abc = Vec3.multScalar(abc, -1);
    dir.copy(abc);
    return false;
  }
  static checkTetrahedron(simplex, dir) {
    const A = simplex[0];
    const B = simplex[1];
    const C = simplex[2];
    const D = simplex[3];
    const AO = Vec3.multScalar(A, -1);
    const BO = Vec3.multScalar(B, -1);
    let ABDPerp = Vec3.cross(Vec3.sub(B, A), Vec3.sub(D, A));
    let ACDPerp = Vec3.cross(Vec3.sub(C, A), Vec3.sub(D, A));
    let BCDPerp = Vec3.cross(Vec3.sub(C, B), Vec3.sub(D, B));
    if (Vec3.dot(ABDPerp, Vec3.sub(C, A)) > 0) ABDPerp = Vec3.multScalar(ABDPerp, -1);
    if (Vec3.dot(ACDPerp, Vec3.sub(B, A)) > 0) ACDPerp = Vec3.multScalar(ACDPerp, -1);
    if (Vec3.dot(BCDPerp, Vec3.sub(A, B)) > 0) BCDPerp = Vec3.multScalar(BCDPerp, -1);
    if (Vec3.dot(ABDPerp, AO) > 0) {
      const trs = [A, B, D];
      _Collision.checkTriangle(trs, dir);
      simplex.length = 0;
      simplex.push(...trs);
      return false;
    }
    if (Vec3.dot(ACDPerp, AO) > 0) {
      const trs = [A, C, D];
      _Collision.checkTriangle(trs, dir);
      simplex.length = 0;
      simplex.push(...trs);
      return false;
    }
    if (Vec3.dot(BCDPerp, BO) > 0) {
      const trs = [B, C, D];
      _Collision.checkTriangle(trs, dir);
      simplex.length = 0;
      simplex.push(...trs);
      return false;
    }
    return true;
  }
};

// src/Game.ts
var Game = class {
  isRunning = true;
  cubeVertices;
  tableVertices;
  cubeIndices;
  tableIndices;
  floorBuffer;
  chunk_pos;
  vaos;
  shaders;
  perlinFloor;
  total_time;
  shapes;
  width;
  height;
  moveVector;
  mouseMoveVector;
  lastMousePos;
  isShiftPressed;
  light;
  Fov;
  pCamera;
  perlin3d;
  noiseTexture;
  player;
  constructor(gl, width, height, shaders, models) {
    this.width = width;
    this.height = height;
    this.total_time = 0;
    this.moveVector = Vec3.make(0, 0, 0);
    this.mouseMoveVector = Vec2.make(0, 0);
    this.lastMousePos = Vec2.make(0, 0);
    this.perlin3d = new Perlin3d(64, 64);
    this.vaos = {};
    this.shaders = {};
    this.chunk_pos = Vec2.make(0, 0);
    this.pCamera = new Camera(Vec3.make(0, 1, 5), width, height, 1, 0.01, 100);
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const cubeVertices = createBufferData(gl, CUBE_VERTICES, gl.STATIC_DRAW);
    const tableVertices = createBufferData(gl, TABLE_VERTICES, gl.STATIC_DRAW);
    const landerVertices = createBufferData(gl, models["lander"].vertices, gl.STATIC_DRAW);
    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const tableIndices = createStaticIndexBuffer(gl, TABLE_INDICES);
    const landerIndices = createStaticIndexBuffer(gl, models["lander"].indices);
    if (!cubeVertices || !tableIndices || !tableVertices || !cubeIndices) {
      showError(`Failed to create some buffers`);
    }
    this.shaders["main"] = new ShaderProgram(gl, shaders["vMain"], shaders["fMain"]);
    this.shaders["light"] = new ShaderProgram(gl, shaders["vLight"], shaders["fLight"]);
    this.shaders["floor"] = new ShaderProgram(gl, shaders["vFloor"], shaders["fFloor"]);
    this.perlinFloor = new PerlinFloor(gl, this.perlin3d, this.shaders["floor"], Vec3.make(10, 0, 0));
    this.shaders["main"].bind(gl);
    console.log("error: ", gl.getError());
    const vPosLoc = this.shaders["main"].getAttrib(gl, "vPos");
    const vColorLoc = this.shaders["main"].getAttrib(gl, "vColor");
    const vNormalLoc = this.shaders["main"].getAttrib(gl, "vNormal");
    const vUVLoc = this.shaders["main"].getAttrib(gl, "vUV");
    if (vPosLoc < 0 || vColorLoc < 0) {
      if (vPosLoc < 0) showError("vPos wasnt found");
      if (vColorLoc < 0) showError("vColor wasnt found");
      return;
    }
    this.vaos["cube"] = create3dPosColorInterleavedVao(gl, cubeVertices, cubeIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.vaos["table"] = create3dPosColorInterleavedVao(gl, tableVertices, tableIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.vaos["lander"] = create3dPosColorInterleavedVao(gl, landerVertices, landerIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    gl.viewport(0, 0, this.width, this.height);
    this.shapes = [];
    this.player = new Player(
      Vec3.make(20, 5, 0),
      Vec3.make(0.4, 0.4, 0.4),
      this.shaders["main"],
      this.vaos["lander"],
      models["lander"].indices.length,
      models["lander"].vertices,
      4
    );
    this.light = new Light(
      Vec3.make(4, 20, 2),
      Vec3.make(1, 1, 1),
      this.shaders["light"],
      this.vaos["cube"],
      CUBE_INDICES.length,
      Vec3.make(5, 5, 5),
      CUBE_VERTICES
    );
    gl.uniform1i(this.shaders["main"].getUniform(gl, "u_noiseTex"), 0);
  }
  handleKeyDown(e) {
    if (e.key == "o") {
      this.isRunning = false;
      throw new Error("Stopped the program");
    }
    if (e.key == "n")
      this.isShiftPressed = true;
    if (e.key == "w")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 0, -1));
    if (e.key == "a")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(-1, 0, 0));
    if (e.key == "d")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(1, 0, 0));
    if (e.key == "s")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 0, 1));
    if (e.code == "Space")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 1, 0));
    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);
  }
  handleKeyUp(e) {
    if (e.key == "n")
      this.isShiftPressed = false;
    if (e.key == "w")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 0, -1));
    if (e.key == "a")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(-1, 0, 0));
    if (e.key == "d")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(1, 0, 0));
    if (e.key == "s")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 0, 1));
    if (e.code == "Space")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 1, 0));
    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);
  }
  handleMouseMovement(e) {
    this.mouseMoveVector = Vec2.make(e.movementX, e.movementY);
    this.mouseMoveVector.y *= -1;
  }
  update(gl, dt) {
    const coll = Collision.GJK(this.light, this.player);
    this.total_time += dt;
    this.player.update(this.moveVector, this.pCamera, dt);
    this.pCamera.update(Vec3.multScalar(this.moveVector, this.isShiftPressed ? 4 : 1), this.mouseMoveVector, this.player.pos, this.player.camera_dist, dt);
    this.perlinFloor.update(gl, this.perlin3d, this.player.pos);
    updateEntitiesPhysics([this.player], dt);
    this.light.updateWorldData();
    this.player.updateWorldData();
    this.mouseMoveVector = Vec2.make(0, 0);
  }
  setShaderUniform(gl, shader, matViewProj) {
    shader.bind(gl);
    gl.uniformMatrix4fv(shader.getUniform(gl, "matViewProj"), false, matViewProj.values);
    gl.uniform3f(shader.getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    gl.uniform3f(shader.getUniform(gl, "lightPos"), this.light.pos.x, this.light.pos.y, this.light.pos.z);
    gl.uniform3f(shader.getUniform(gl, "cameraPos"), this.pCamera.pos.x, this.pCamera.pos.y, this.pCamera.pos.z);
    shader.unbind(gl);
  }
  draw(gl) {
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const matViewProj = Mat4x4.multMatrix(this.pCamera.lookAtMatrix, this.pCamera.perpective);
    this.setShaderUniform(gl, this.shaders["main"], matViewProj);
    this.setShaderUniform(gl, this.shaders["floor"], matViewProj);
    this.shaders["light"].bind(gl);
    gl.uniformMatrix4fv(this.shaders["light"].getUniform(gl, "matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.shaders["light"].getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    this.shapes.forEach((element) => {
      element.draw(gl);
    });
    this.light.draw(gl);
    this.perlinFloor.draw(gl);
    this.player.draw(gl);
    gl.finish();
    this.perlinFloor.updateSwaps(gl);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("WebGL Error:", error);
      throw new Error("opengl said something went wrong");
    }
    this.shaders["light"].unbind(gl);
  }
};

// src/helpers/objLoader.ts
var ModelData = class {
  constructor(vertices, indices) {
    this.vertices = vertices;
    this.indices = indices;
  }
};
async function loadObj(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  let text = await response.text();
  let lines = text.split(/\r?\n/);
  let vertices = [];
  let normals = [];
  let uvs = [];
  let lst = [];
  let objIndices = Object;
  let indices = [];
  const WHITE_COLOR = Vec3.make(0.5, 0.5, 0.5);
  for (let line of lines) {
    const words = line.split(" ");
    if (words[0] == "v") {
      vertices.push(Vec3.make(
        Number(words[1]),
        Number(words[2]),
        Number(words[3])
      ));
    }
    if (words[0] == "vn") {
      normals.push(Vec3.make(
        Number(words[1]),
        Number(words[2]),
        Number(words[3])
      ));
    }
    if (words[0] == "vt") {
      uvs.push(Vec2.make(
        Number(words[1]),
        Number(words[2])
      ));
    }
    if (words[0] == "f") {
      let indxs = words[1].split("/");
      if (words[1] in objIndices) {
        indices.push(objIndices[words[1]]);
      } else {
        lst.push(new CoupledVertex(vertices[Number(indxs[0]) - 1], WHITE_COLOR, normals[Number(indxs[2]) - 1], uvs[Number(indxs[1]) - 1]));
        objIndices[words[1]] = lst.length - 1;
        indices.push(lst.length - 1);
      }
      if (words[2] in objIndices) {
        indices.push(objIndices[words[2]]);
      } else {
        indxs = words[2].split("/");
        lst.push(new CoupledVertex(vertices[Number(indxs[0]) - 1], WHITE_COLOR, normals[Number(indxs[2]) - 1], uvs[Number(indxs[1]) - 1]));
        objIndices[words[2]] = lst.length - 1;
        indices.push(lst.length - 1);
      }
      if (words[3] in objIndices) {
        indices.push(objIndices[words[3]]);
      } else {
        indxs = words[3].split("/");
        lst.push(new CoupledVertex(vertices[Number(indxs[0]) - 1], WHITE_COLOR, normals[Number(indxs[2]) - 1], uvs[Number(indxs[1]) - 1]));
        objIndices[words[3]] = lst.length - 1;
        indices.push(lst.length - 1);
      }
    }
  }
  console.log(vertices.length, normals.length, uvs.length, indices.length);
  return new ModelData(new Float32Array(webglVerticesFromCoupledVertices(lst)), new Uint16Array(indices));
}

// src/main.ts
async function loadText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}
var game;
var canvas;
function initGame(shaders, models) {
  console.log(models["lander"]);
  canvas = document.getElementById("demo-canvas");
  if (!canvas) {
    showError("Canvas nope");
    return;
  }
  const gl = canvas.getContext("webgl2", { antialias: true });
  if (!gl) {
    showError("webgl2 nope");
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  game = new Game(gl, canvas.width, canvas.height, shaders, models);
  let lastTime = performance.now();
  let dt;
  function step() {
    const now = performance.now();
    dt = (now - lastTime) / 5;
    lastTime = now;
    if (!gl) return;
    game.update(gl, dt);
    game.draw(gl);
    if (game.isRunning)
      requestAnimationFrame(step);
  }
  step();
}
async function getShaders() {
  const shader_source = "src/shaders";
  const shader_names = [
    "fMain",
    "fLight",
    "vLight",
    "vMain",
    "vFloor",
    "fFloor"
  ];
  let object = {};
  for (let i = 0; i < shader_names.length; i++)
    object[shader_names[i]] = await loadText(shader_source.concat("/", shader_names[i], ".glsl"));
  return object;
}
async function getModels() {
  const model_source = "../models";
  const models_names = [
    "lander"
  ];
  let object = {};
  for (let i = 0; i < models_names.length; i++)
    object[models_names[i]] = await loadObj(model_source.concat("/", models_names[i], ".obj"));
  return object;
}
try {
  (async () => {
    let shaders = await getShaders();
    let models = await getModels();
    initGame(shaders, models);
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
  if (document.pointerLockElement === canvas) {
    game.handleMouseMovement(e);
  }
});
document.addEventListener("click", () => {
  canvas.requestPointerLock();
});
