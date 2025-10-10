import { create3dPosColorInterleavedVao, createStaticBufferData, createStaticIndexBuffer, showError } from "./helpers";
import { ShaderProgram } from "./shaderProgram";
import { CUBE_INDICES, CUBE_VERTICES, fireyTriangleColors, rbgTriangleColors, TABLE_INDICES, TABLE_VERTICES, triangleVertices } from "./shapesVertices";

import {Mat4x4 } from "./glMath/mat4x4.ts"
import {Vec3 } from "./glMath/vec3.ts"
import {Vec4 } from "./glMath/vec4.ts"
import { Quat } from "./glMath/Quat.ts";
import { Shape } from "./Shape.ts";






export class Game {
  cubeVertices: WebGLBuffer;
  tableVertices : WebGLBuffer;
  cubeIndices : WebGLBuffer;
  tableIndices : WebGLBuffer;
  cubeVao : WebGLVertexArrayObject;
  tableVao : WebGLVertexArrayObject;
  camera_pos : Vec3;
  total_time: number;
  shapes : Shape[];

  width : number;
  height : number;
  shaderProgram : ShaderProgram;

  moveVector : Vec3;
  Fov : number;



  constructor(gl : WebGL2RenderingContext, width: number, height : number, vertexCode : string, fragmentCode : string){
    this.width = width;
    this.height = height;
    this.total_time = 0.0
    this.camera_pos = Vec3.make(0, 1, 5);
    this.moveVector = Vec3.make(0, 0, 0);
    this.Fov = 1.396263;


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

    const UP_VEC = Vec3.make(0, 1, 0);
    this.shapes = [];
    this.shapes.push(new Shape(Vec3.make(0, 0.0, 0), Vec3.make(1, 0.1, 1), UP_VEC, 0, this.tableVao, TABLE_INDICES.length));
    this.shapes.push(new Shape(Vec3.make(0, 1.0, 0), Vec3.make(0.4, 0.4, 0.4), UP_VEC, 0, this.cubeVao, CUBE_INDICES.length));
    this.shapes.push(new Shape(Vec3.make(2, 1.0, -1), Vec3.make(1.0, 1.0, 1.0), UP_VEC, 0, this.cubeVao, CUBE_INDICES.length));
  }

  handleKeyDown(e){
    if (e.key == "o") this.Fov += 0.1;
    if (e.key == "i") this.Fov -= 0.1;


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

  handleKeyUp(e){
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

  handleMouseMovement(e){

  }


  update(dt : number) {
    this.total_time += dt;
    this.camera_pos = Vec3.add(this.camera_pos, Vec3.multScalar(this.moveVector, dt*0.01));
  }





  draw(gl : WebGL2RenderingContext ) {

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    this.shaderProgram.bind(gl);

    const matView = Mat4x4.LookAtRH(
      this.camera_pos,
      Vec3.add(this.camera_pos, Vec3.make(0, 0, -1)),
      Vec3.make(0, 1, 0)
    );
    const matProj = Mat4x4.perspective(
      this.height/this.width,
      this.Fov,
      0.001, 100.0
    );

    const matViewProj = Mat4x4.multMatrix(matView, matProj);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl,"matViewProj"), false, matViewProj.values);

    const matWorldLoc = this.shaderProgram.getUniform(gl, "matWorld");
    this.shapes.forEach(element => {
      element.draw(gl, matWorldLoc);
    });
    /*
    
    const rotMatrix = Mat4x4.fromQuat(Quat.makeFromAxis(0.7, Vec3.make(1.0, 1.0, 0.0)));
    let matWorld = Mat4x4.identity();
    matWorld = Mat4x4.multMatrix(matWorld, rotMatrix);
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.scale(Vec3.make(1, 0.5, 1)));
    matWorld = Mat4x4.multMatrix(matWorld, Mat4x4.transpose(Vec3.make(Math.cos(this.total_time/100)*0.0, 0.0, 0)));
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl,"matWorld"), false, matWorld.values);
    gl.bindVertexArray(this.tableVao);
    gl.drawElements(gl.TRIANGLES, TABLE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
    */

  }

}
