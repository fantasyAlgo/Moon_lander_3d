import { create3dPosColorInterleavedVao, createStaticBufferData, createStaticIndexBuffer, showError } from "./helpers";
import { ShaderProgram } from "./shaderProgram";
import { CUBE_INDICES, CUBE_VERTICES, fireyTriangleColors, rbgTriangleColors, TABLE_INDICES, TABLE_VERTICES, triangleVertices } from "./shapesVertices";

import {Mat4x4 } from "./glMath/mat4x4.ts"
import {Vec3 } from "./glMath/vec3.ts"
import {Vec4 } from "./glMath/vec4.ts"
import { Quat } from "./glMath/Quat.ts";
import { Shape } from "./Shape.ts";
import { Vec2 } from "./glMath/Vec2.ts";
import { Camera } from "./Camera.ts";






export class Game {
  cubeVertices: WebGLBuffer;
  tableVertices : WebGLBuffer;
  cubeIndices : WebGLBuffer;
  tableIndices : WebGLBuffer;
  cubeVao : WebGLVertexArrayObject;
  tableVao : WebGLVertexArrayObject;
  total_time: number;
  shapes : Shape[];

  width : number;
  height : number;
  shaderProgram : ShaderProgram;
  lightShaderProgram : ShaderProgram;

  moveVector : Vec3;
  mouseMoveVector : Vec2;
  lastMousePos : Vec2;

  lightColor : Vec3;
  lightPos : Vec3;

  Fov : number;
  pCamera : Camera;




  constructor(gl : WebGL2RenderingContext, width: number, height : number, shaders : Object){
    this.width = width;
    this.height = height;
    this.total_time = 0.0
    this.moveVector = Vec3.make(0, 0, 0);
    this.mouseMoveVector = Vec2.make(0, 0);
    this.lastMousePos = Vec2.make(0, 0);
    this.lightColor = Vec3.make(1, 1, 1);
    this.lightPos = Vec3.make(4, 4.0, 2);

    this.Fov = 1.0;
    this.pCamera = new Camera(Vec3.make(0, 1, 5), width, height, 1.0, 0.01, 200);


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

    this.shaderProgram = new ShaderProgram(gl, shaders["vMain"], shaders["fMain"]);
    this.lightShaderProgram = new ShaderProgram(gl, shaders["vLight"], shaders["fLight"]);
    this.shaderProgram.bind(gl);

    console.log("error: ", gl.getError());
    const vPosLoc = this.shaderProgram.getAttrib(gl, "vPos");   
    const vColorLoc = this.shaderProgram.getAttrib(gl, "vColor"); 
    const vNormalLoc = this.shaderProgram.getAttrib(gl, "vNormal"); 

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
    this.cubeVao = create3dPosColorInterleavedVao(gl, cubeVertices, cubeIndices, vPosLoc, vColorLoc, vNormalLoc);
    this.tableVao = create3dPosColorInterleavedVao(gl, tableVertices, tableIndices, vPosLoc, vColorLoc, vNormalLoc);
    if (!this.cubeVao || !this.tableVao){
      showError("Vao were not created");
    }
    console.log("error: ", gl.getError());

    gl.viewport(0, 0, this.width, this.height);

    const UP_VEC = Vec3.make(0, 1, 0);
    this.shapes = [];
    this.shapes.push(new Shape(Vec3.make(0, 0.0, 0), Vec3.make(1, 0.1, 1), UP_VEC, 0, this.shaderProgram, this.tableVao, TABLE_INDICES.length));
    this.shapes.push(new Shape(Vec3.make(0, 1.0, 0), Vec3.make(0.4, 0.4, 0.4), UP_VEC, 0, this.shaderProgram, this.cubeVao, CUBE_INDICES.length));
    this.shapes.push(new Shape(Vec3.make(2, 1.0, -1), Vec3.make(1.0, 1.0, 1.0), UP_VEC, 0, this.shaderProgram, this.cubeVao, CUBE_INDICES.length));
    this.shapes.push(new Shape(this.lightPos, Vec3.make(0.2, 0.2, 0.2), UP_VEC, 0, this.lightShaderProgram, this.cubeVao, CUBE_INDICES.length));
  }

  handleKeyDown(e : KeyboardEvent){
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

  handleKeyUp(e : KeyboardEvent){
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

  handleMouseMovement(e : MouseEvent){
    this.mouseMoveVector = Vec2.make(e.movementX, e.movementY);
    this.mouseMoveVector.y *= -1.0;
  }


  update(dt : number) {
    this.total_time += dt;
    this.pCamera.update(this.moveVector, this.mouseMoveVector, dt);

    this.mouseMoveVector = Vec2.make(0,0);
  }


  draw(gl : WebGL2RenderingContext ) {

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    const matViewProj = Mat4x4.multMatrix(this.pCamera.lookAtMatrix, this.pCamera.perpective);
    this.shaderProgram.bind(gl);
    gl.uniformMatrix4fv(this.shaderProgram.getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.shaderProgram.getUniform(gl, "lightColor"), this.lightColor.x, this.lightColor.y, this.lightColor.z);
    gl.uniform3f(this.shaderProgram.getUniform(gl, "lightPos"), this.lightPos.x, this.lightPos.y, this.lightPos.z);
    gl.uniform3f(this.shaderProgram.getUniform(gl, "cameraPos"), this.pCamera.pos.x, this.pCamera.pos.y, this.pCamera.pos.z);

    this.lightShaderProgram.bind(gl);
    gl.uniformMatrix4fv(this.lightShaderProgram.getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.lightShaderProgram.getUniform(gl, "lightColor"), this.lightColor.x, this.lightColor.y, this.lightColor.z);

    this.shapes.forEach(element => {
      element.draw(gl);
    });

  }

}
