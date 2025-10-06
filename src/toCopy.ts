import { fShaderCode } from "./fragmentShader.ts";
import { vShaderCode } from "./vertexShader.ts";

const triangleVertices = new Float32Array([
  0.0, 0.5,
  -0.5, -0.5,
  0.5, -0.5
]);

const rbgTriangleColors = new Uint8Array([
  255, 0, 0,
  0, 255, 0,
  0, 0, 255,
]);
const fireyTriangleColors = new Uint8Array([
  229, 47, 15,
  246, 206, 29,
  233, 154, 26,
]);






function showError(errorText: string) {
  console.error(errorText);
  const errorBoxDiv = document.getElementById('error-box');
  if (errorBoxDiv === null) {
    return;
  }
  const errorElement = document.createElement('p');
  errorElement.innerText = errorText;
  errorBoxDiv.appendChild(errorElement);
}

function helloTriangle(){
  const canvas = document.getElementById("demo-canvas") as HTMLCanvasElement | null;
  if (!canvas){
    showError("Canvas nope");
    return;
  }
  const gl = canvas.getContext('webgl2');
  if (!gl){
    showError("webgl2 nope");
    return;
  }

  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const triangleVerticlesBuffer : Float32Array = triangleVertices;
  const triangleGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVerticlesBuffer, gl.STATIC_DRAW);


  const rgbTriangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rgbTriangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, rbgTriangleColors, gl.STATIC_DRAW);

  const fireyTriangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fireyTriangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, fireyTriangleColors, gl.STATIC_DRAW);



  const vertexShader =  gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader){
    showError("Vertex shader nah");
    return;
  }
  gl.shaderSource(vertexShader, vShaderCode);
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

  gl.shaderSource(fragmentShader, fShaderCode);
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
  // To check if it linked correctly
  const vPosLoc = gl.getAttribLocation(triangleShaderProgram, "vPos");
  const vColorLoc = gl.getAttribLocation(triangleShaderProgram, "vColor");

  if (vPosLoc < 0 || vColorLoc < 0){
    if (vPosLoc < 0)
      showError("vPos wasnt found");
    if (vColorLoc  < 0)
    showError("vColor wasnt found");
    return;
  }


  const sPosLocUniform = gl.getUniformLocation(triangleShaderProgram, "shapeLocation");
  const canvasSizeUniform = gl.getUniformLocation(triangleShaderProgram, "canvas_size");
  const sSizeLocUniform = gl.getUniformLocation(triangleShaderProgram, "shapeSize");
  if (sPosLocUniform === null || canvasSizeUniform === null || sSizeLocUniform === null){
    showError(`Uniform not loaded correctly: pos: ${sPosLocUniform}, ${canvasSizeUniform}, ${sSizeLocUniform}`);
    return;
  }



  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.useProgram(triangleShaderProgram);
  gl.enableVertexAttribArray(vPosLoc);
  gl.enableVertexAttribArray(vColorLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.vertexAttribPointer(
    vPosLoc, 2, gl.FLOAT, false, 2*Float32Array.BYTES_PER_ELEMENT, 0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, rgbTriangleBuffer);
  gl.vertexAttribPointer(
    vColorLoc, 3, gl.UNSIGNED_BYTE, true, 0, 0
  );




  gl.uniform2f(canvasSizeUniform, canvas.width, canvas.height);
  gl.uniform2f(sPosLocUniform, 200, 400);
  gl.uniform1f(sSizeLocUniform, 200);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.uniform2f(sPosLocUniform, 400, 500);
  gl.uniform1f(sSizeLocUniform, 200);


  gl.drawArrays(gl.TRIANGLES, 0, 3);

  

}


try {
  helloTriangle();
} catch (e) {
  showError("baka");
}

