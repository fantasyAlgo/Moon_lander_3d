export function showError(errorText: string) {
  console.error(errorText);
  const errorBoxDiv = document.getElementById('error-box');
  if (errorBoxDiv === null) {
    return;
  }
  const errorElement = document.createElement('p');
  errorElement.innerText = errorText;
  errorBoxDiv.appendChild(errorElement);
}

export function createStaticBufferData(gl : WebGL2RenderingContext, data : ArrayBuffer){
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

export function createStaticIndexBuffer(gl : WebGL2RenderingContext, data : ArrayBuffer){
  const buffer = gl.createBuffer();
  if (!buffer){
    showError("Failed to allocate buffer");
    throw new Error("Failed to allocate buffer");
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return buffer;
}


export function create3dPosColorInterleavedVao(gl : WebGL2RenderingContext, 
  vertexBuffer : WebGLBuffer, indexBuffer : WebGLBuffer,
  posAttrib : number, colorAttrib : number, normalAttrib : number
) : WebGLVertexArrayObject {
  const vao : WebGLVertexArrayObject = gl.createVertexArray();
  if (!vao){
    throw new Error("A problem occurred with the creation of the VAO");
  }
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(posAttrib);
  gl.enableVertexAttribArray(colorAttrib);
  gl.enableVertexAttribArray(normalAttrib);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(
    posAttrib, 3, gl.FLOAT, false, 9*Float32Array.BYTES_PER_ELEMENT, 0
  );
  gl.vertexAttribPointer(
    colorAttrib, 3, gl.FLOAT, false, 9*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT
  );
  gl.vertexAttribPointer(
    normalAttrib, 3, gl.FLOAT, false, 9*Float32Array.BYTES_PER_ELEMENT, 6*Float32Array.BYTES_PER_ELEMENT
  );




  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
  return vao;
}


