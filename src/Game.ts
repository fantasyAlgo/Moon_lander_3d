import { create3dPosColorInterleavedVao, createStaticBufferData, createStaticIndexBuffer, showError } from "./helpers";
import { ShaderProgram } from "./shaderProgram";
import { CUBE_INDICES, CUBE_VERTICES, fireyTriangleColors, rbgTriangleColors, TABLE_INDICES, TABLE_VERTICES, triangleVertices } from "./shapesVertices";

import {Mat4x4 } from "./glMath/mat4x4.ts"
import {Vec3 } from "./glMath/vec3.ts"
import {Vec4 } from "./glMath/vec4.ts"






export class Game {
  cubeVertices: WebGLBuffer;
  tableVertices : WebGLBuffer;
  cubeIndices : WebGLBuffer;
  tableIndices : WebGLBuffer;
  cubeVao : WebGLVertexArrayObject;
  tableVao : WebGLVertexArrayObject;
  camera_pos : Vec3;


  width : number;
  height : number;
  shaderProgram : ShaderProgram;



  constructor(gl : WebGL2RenderingContext, width: number, height : number, vertexCode : string, fragmentCode : string){
    this.width = width;
    this.height = height;

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const cubeVertices = createStaticBufferData(gl, CUBE_VERTICES);
    const tableVertices = createStaticBufferData(gl, TABLE_VERTICES);
    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const tableIndices = createStaticIndexBuffer(gl, TABLE_INDICES);

    if (!cubeVertices || !tableIndices || !tableVertices || !cubeIndices){
      showError(`Failed to create some buffers`);
    }

    this.shaderProgram = new ShaderProgram(gl, vertexCode, fragmentCode);

    const vPosLoc = this.shaderProgram.getAttrib(gl, "vPos");   
    const vColorLoc = this.shaderProgram.getAttrib(gl, "vColor"); 

    const matWorldUni = this.shaderProgram.getUniform(gl, "matWorld");
    const matViewProjUni = this.shaderProgram.getUniform(gl, "matViewProj");


    if (vPosLoc < 0 || vColorLoc < 0 ){
      if (vPosLoc < 0) showError("vPos wasnt found");
      if (vColorLoc < 0) showError("vColor wasnt found");
      return;
    }
    if (!matViewProjUni || !matWorldUni){
      showError(`Data: ${matViewProjUni}, ${matWorldUni}`);
    }
    this.cubeVao = create3dPosColorInterleavedVao(gl, cubeVertices, cubeIndices, vPosLoc, vColorLoc);
    this.tableVao = create3dPosColorInterleavedVao(gl, tableVertices, tableIndices, vPosLoc, vColorLoc);
    if (!this.cubeVao || !this.tableVao){
      showError("Vao were not created");
    }
    console.log("error: ", gl.getError());



    gl.viewport(0, 0, this.width, this.height);

    this.camera_pos = Vec3.make(0, 0, 5);

    /*
    this.shaderProgram.bind(gl);
    gl.enableVertexAttribArray(vPosLoc);
    gl.enableVertexAttribArray(vColorLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleGeoBuffer);
    gl.vertexAttribPointer(
      vPosLoc, 2, gl.FLOAT, false, 2*Float32Array.BYTES_PER_ELEMENT, 0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.rgbTriangleBuffer);
    gl.vertexAttribPointer(
      vColorLoc, 3, gl.UNSIGNED_BYTE, true, 0, 0
    );
    */

  }
  update(dt : Number) {
  }

  handleKeyDown(e){
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

  handleKeyUp(e){

  }

  handleMouseMovement(e){

  }



  draw(gl : WebGL2RenderingContext ) {

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
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
      this.width/this.height,
      1.396263,
      0.1, 100.0
    );
    console.log("matProj values:", matProj.values);


    const matViewProj = Mat4x4.multMatrix(matProj, matView);

    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl,"matWorld"), false, matWorld.values);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl,"matViewProj"), false, Mat4x4.T(matViewProj).values);

    gl.bindVertexArray(this.cubeVao);
    gl.drawElements(gl.TRIANGLES, CUBE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    console.log("error: ", gl.getError());


    

    /*

    gl.uniform2f(this.shaderProgram.getUniform(gl, "canvas_size"), this.width, this.height);
    gl.uniform2f(this.shaderProgram.getUniform(gl, "shapeLocation"), 200, 400);
    gl.uniform1f(this.shaderProgram.getUniform(gl, "shapeSize"), 200);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.uniform2f(this.shaderProgram.getUniform(gl, "shapeLocation"), 400, 500);
    gl.uniform1f(this.shaderProgram.getUniform(gl, "shapeSize"), 200);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    */
  }

}
