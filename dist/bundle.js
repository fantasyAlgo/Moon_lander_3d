// src/glHelpers.ts
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

// src/CoupledVertex.ts
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

// src/glMath/Vec2.ts
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
function getFloorVertices(perlin3d) {
  let lst = [];
  const W = perlin3d.grid_width;
  const H = perlin3d.grid_height;
  const fake_normal = Vec3.make(0, 1, 0);
  for (let i = H; i >= 0; i--) {
    for (let j = 0; j <= W; j++) {
      const height = perlin3d.get(i / 20, j / 20);
      const rValue = Math.random() / 50;
      const color = Vec3.add(Vec3.make(0.2 + height * 0.1, 0.2 + height * 0.1, 0.2 + height * 0.1), Vec3.make(rValue, rValue, rValue));
      const pos = Vec3.make(2 * j / H - 1, height, 2 * i / W - 1);
      const uv = Vec2.make(1 + pos.x / 2, 1 + pos.z / 2);
      const vertex = new CoupledVertex(pos, color, fake_normal, uv);
      lst.push(vertex);
    }
  }
  for (let i = 1; i < H - 1; i++) {
    for (let j = 1; j < W - 1; j++) {
      const up = lst[(i - 1) * H + j].pos.y;
      const down = lst[(i - 1) * H + j].pos.y;
      const left = lst[i * H + j - 1].pos.y;
      const right = lst[i * H + j + 1].pos.y;
      lst[i * H + j].normal = Vec3.normalize(Vec3.make(up - down, 2, left - right));
    }
  }
  console.log(lst.length);
  return webglVerticesFromCoupledVertices(lst);
}
function getFloorIndices(grid_width, grid_height) {
  const indices = [];
  const W = grid_width;
  const H = grid_height;
  for (let i = H; i >= 0; i--) {
    for (let j = 0; j < W; j++) {
      if (i != j) {
        indices.push(i * H + j);
        indices.push((i + 1) * H + j);
        indices.push((i + 1) * H + j + 1);
      }
      if (i - 1 != j) {
        indices.push(i * H + j);
        indices.push((i + 1) * H + j + 1);
        indices.push(i * H + j + 1);
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
  constructor(pos, scale, rotationAxis, rotationAngle, program, vao, numIndices) {
    this.pos = pos;
    this.scale = scale;
    this.rotationAxis = rotationAxis;
    this.rotationAngle = rotationAngle;
    this.program = program;
    this.vao = vao;
    this.numIndices = numIndices;
  }
  matWorld = Mat4x4.identity();
  draw(gl) {
    const matWorldUniform = this.program.getUniform(gl, "matWorld");
    let matWorld = Mat4x4.fromQuat(Quat.makeFromAxis(this.rotationAngle, this.rotationAxis));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(this.scale));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(this.pos));
    this.program.bind(gl);
    gl.uniformMatrix4fv(matWorldUniform, false, matWorld.values);
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
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
  update(moveVec, mouseMoveVec, dt) {
    const SENSIBILITY = 0.3;
    const moveMatrix = Mat4x4.T(Mat4x4.LookAtRH(Vec3.make(0, 0, 0), this.forward, UP_VEC));
    const newMoveVec = Mat4x4.multVec4(moveMatrix, Vec4.make(moveVec.x, moveVec.y, moveVec.z, 1));
    const newMouseVec = Mat4x4.multVec4(moveMatrix, Vec4.make(mouseMoveVec.x, mouseMoveVec.y, 0, 1));
    this.pos = Vec3.add(this.pos, Vec3.multScalar(newMoveVec.convertToVec3(), dt * 0.01));
    this.forward = Vec3.add(this.forward, Vec3.multScalar(newMouseVec.convertToVec3(), SENSIBILITY * dt * 0.01));
    this.lookAtMatrix = this.getLookAt();
  }
  getLookAt() {
    return Mat4x4.LookAtRH(this.pos, Vec3.add(this.pos, this.forward), UP_VEC);
  }
};

// src/Light.ts
var Light = class extends Shape {
  constructor(pos, scale, rotationAxis, rotationAngle, program, vao, numIndices, color) {
    super(pos, scale, rotationAxis, rotationAngle, program, vao, numIndices);
    this.color = color;
  }
};

// src/Perlin3d.ts
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
    for (let i = 0; i < grid_width; i++) {
      let lst = [];
      for (let j = 0; j < grid_height; j++) {
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

// src/Game.ts
var Game = class {
  cubeVertices;
  tableVertices;
  cubeIndices;
  tableIndices;
  cubeVao;
  tableVao;
  floorVao;
  total_time;
  shapes;
  width;
  height;
  shaderProgram;
  lightShaderProgram;
  moveVector;
  mouseMoveVector;
  lastMousePos;
  light;
  Fov;
  pCamera;
  perlin3d;
  noiseTexture;
  constructor(gl, width, height, shaders) {
    this.width = width;
    this.height = height;
    this.total_time = 0;
    this.moveVector = Vec3.make(0, 0, 0);
    this.mouseMoveVector = Vec2.make(0, 0);
    this.lastMousePos = Vec2.make(0, 0);
    this.perlin3d = new Perlin3d(64, 64);
    this.pCamera = new Camera(Vec3.make(0, 1, 5), width, height, 1, 0.01, 200);
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const floorVerticesData = getFloorVertices(this.perlin3d);
    const floorIndicesData = getFloorIndices(this.perlin3d.grid_width, this.perlin3d.grid_height);
    const cubeVertices = createStaticBufferData(gl, CUBE_VERTICES);
    const tableVertices = createStaticBufferData(gl, TABLE_VERTICES);
    const floorVertices = createStaticBufferData(gl, floorVerticesData);
    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const tableIndices = createStaticIndexBuffer(gl, TABLE_INDICES);
    const floorIndices = createStaticIndexBuffer(gl, floorIndicesData);
    if (!cubeVertices || !tableIndices || !tableVertices || !cubeIndices) {
      showError(`Failed to create some buffers`);
    }
    this.shaderProgram = new ShaderProgram(gl, shaders["vMain"], shaders["fMain"]);
    this.lightShaderProgram = new ShaderProgram(gl, shaders["vLight"], shaders["fLight"]);
    this.shaderProgram.bind(gl);
    console.log("error: ", gl.getError());
    const vPosLoc = this.shaderProgram.getAttrib(gl, "vPos");
    const vColorLoc = this.shaderProgram.getAttrib(gl, "vColor");
    const vNormalLoc = this.shaderProgram.getAttrib(gl, "vNormal");
    const vUVLoc = this.shaderProgram.getAttrib(gl, "vUV");
    if (vPosLoc < 0 || vColorLoc < 0) {
      if (vPosLoc < 0) showError("vPos wasnt found");
      if (vColorLoc < 0) showError("vColor wasnt found");
      return;
    }
    const noise_width = 256 * 2;
    this.noiseTexture = makeHeightTextureFromData(gl, makeRandomMatrix(noise_width, noise_width), noise_width, noise_width);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.uniform1i(this.shaderProgram.getUniform(gl, "u_noiseTex"), 0);
    this.cubeVao = create3dPosColorInterleavedVao(gl, cubeVertices, cubeIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.tableVao = create3dPosColorInterleavedVao(gl, tableVertices, tableIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.floorVao = create3dPosColorInterleavedVao(gl, floorVertices, floorIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    if (!this.cubeVao || !this.tableVao) showError("Vao were not created");
    console.log("error: ", gl.getError());
    gl.viewport(0, 0, this.width, this.height);
    const UP_VEC2 = Vec3.make(0, 1, 0);
    this.shapes = [];
    const size = 5;
    this.shapes.push(new Shape(Vec3.make(0, 0, 0), Vec3.make(size, 1, size), UP_VEC2, 0, this.shaderProgram, this.floorVao, floorIndicesData.length));
    this.light = new Light(
      Vec3.make(4, 4, 2),
      Vec3.make(0.2, 0.2, 0.2),
      UP_VEC2,
      0,
      this.lightShaderProgram,
      this.cubeVao,
      CUBE_INDICES.length,
      Vec3.make(1, 1, 1)
    );
  }
  handleKeyDown(e) {
    if (e.key == "w")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 0, -1));
    if (e.key == "a")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(-1, 0, 0));
    if (e.key == "d")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(1, 0, 0));
    if (e.key == "s")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 0, 1));
    if (e.key == "e")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 1, 0));
    if (e.key == "q")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, -1, 0));
    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);
  }
  handleKeyUp(e) {
    if (e.key == "w")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 0, -1));
    if (e.key == "a")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(-1, 0, 0));
    if (e.key == "d")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(1, 0, 0));
    if (e.key == "s")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 0, 1));
    if (e.key == "e")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 1, 0));
    if (e.key == "q")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, -1, 0));
  }
  handleMouseMovement(e) {
    this.mouseMoveVector = Vec2.make(e.movementX, e.movementY);
    this.mouseMoveVector.y *= -1;
  }
  update(dt) {
    this.total_time += dt;
    this.pCamera.update(this.moveVector, this.mouseMoveVector, dt);
    this.mouseMoveVector = Vec2.make(0, 0);
  }
  draw(gl) {
    gl.clearColor(0.08, 0.08, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const matViewProj = Mat4x4.multMatrix(this.pCamera.lookAtMatrix, this.pCamera.perpective);
    this.shaderProgram.bind(gl);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl, "matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.shaderProgram.getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    gl.uniform3f(this.shaderProgram.getUniform(gl, "lightPos"), this.light.pos.x, this.light.pos.y, this.light.pos.z);
    gl.uniform3f(this.shaderProgram.getUniform(gl, "cameraPos"), this.pCamera.pos.x, this.pCamera.pos.y, this.pCamera.pos.z);
    this.lightShaderProgram.bind(gl);
    gl.uniformMatrix4fv(this.lightShaderProgram.getUniform(gl, "matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.lightShaderProgram.getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    this.shapes.forEach((element) => {
      element.draw(gl);
    });
    this.light.draw(gl);
  }
};

// src/main.ts
async function loadText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}
var game;
var canvas;
function initGame(data) {
  canvas = document.getElementById("demo-canvas");
  if (!canvas) {
    showError("Canvas nope");
    return;
  }
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    showError("webgl2 nope");
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(data["fMain"]);
  game = new Game(gl, canvas.width, canvas.height, data);
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
    const shader_source = "src/shaders";
    const shader_names = [
      "fMain",
      "fLight",
      "vLight",
      "vMain"
    ];
    let object = {};
    for (let i = 0; i < shader_names.length; i++)
      object[shader_names[i]] = await loadText(shader_source.concat("/", shader_names[i], ".glsl"));
    initGame(object);
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
