import { create3dPosColorInterleavedVao, createBufferData, createFloorVao, createStaticBufferData, createStaticIndexBuffer, makeHeightTextureFromData, makeRandomMatrix, showError } from "./glHelpers.ts";
import { ShaderProgram } from "./shaderProgram";
import { CUBE_INDICES, CUBE_VERTICES, fireyTriangleColors, getFloorIndices, getFloorVertices, rbgTriangleColors, TABLE_INDICES, TABLE_VERTICES, triangleVertices } from "./shapesVertices";

import {Mat4x4 } from "./glMath/mat4x4.ts"
import {Vec3 } from "./glMath/vec3.ts"
import {Vec4 } from "./glMath/vec4.ts"
import { Quat } from "./glMath/Quat.ts";
import { Shape } from "./Shape.ts";
import { Vec2 } from "./glMath/vec2.ts";
import { Camera } from "./Camera.ts";
import { Light } from "./Light.ts";
import { Perlin3d } from "./Perlin3d.ts";
import { PerlinFloor } from "./PerlinFloor.ts";






export class Game {
  cubeVertices: WebGLBuffer;
  tableVertices : WebGLBuffer;
  cubeIndices : WebGLBuffer;
  tableIndices : WebGLBuffer;

  floorBuffer : WebGLBuffer;
  chunk_pos : Vec2;

  
  vaos : {[key: string]: WebGLVertexArrayObject};
  shaders : {[key: string] : ShaderProgram};

  perlinFloor : PerlinFloor;


  total_time: number;
  shapes : Shape[];

  width : number;
  height : number;

  moveVector : Vec3;
  mouseMoveVector : Vec2;
  lastMousePos : Vec2;
  isShiftPressed : boolean;

  light : Light;

  Fov : number;
  pCamera : Camera;

  perlin3d : Perlin3d;
  noiseTexture : WebGLTexture;

  constructor(gl : WebGL2RenderingContext, width: number, height : number, shaders : Object){
    this.width = width;
    this.height = height;
    this.total_time = 0.0
    this.moveVector = Vec3.make(0, 0, 0);
    this.mouseMoveVector = Vec2.make(0, 0);
    this.lastMousePos = Vec2.make(0, 0);
    this.perlin3d = new Perlin3d(64, 64);
    this.vaos = {};
    this.shaders = {};
    this.chunk_pos = Vec2.make(0.0, 0.0);
    //console.log("perlin: ", this.perlin3d.get(0.2, 0.2));

    this.pCamera = new Camera(Vec3.make(0, 1, 5), width, height, 1.0, 0.01, 100);
    
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const cubeVertices =  createBufferData(gl, CUBE_VERTICES, gl.STATIC_DRAW); 
    const tableVertices = createBufferData(gl, TABLE_VERTICES, gl.STATIC_DRAW);

    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const tableIndices = createStaticIndexBuffer(gl, TABLE_INDICES);


    if (!cubeVertices || !tableIndices || !tableVertices || !cubeIndices){
      showError(`Failed to create some buffers`);
    }

    this.shaders["main"] = new ShaderProgram(gl, shaders["vMain"], shaders["fMain"]);
    this.shaders["light"] = new ShaderProgram(gl, shaders["vLight"], shaders["fLight"]);
    this.shaders["floor"] = new ShaderProgram(gl, shaders["vFloor"], shaders["fFloor"]);

    this.perlinFloor = new PerlinFloor(gl, this.perlin3d, this.shaders["floor"]);
    this.shaders["main"].bind(gl);

    console.log("error: ", gl.getError());
    const vPosLoc = this.shaders["main"].getAttrib(gl, "vPos");   
    const vColorLoc = this.shaders["main"].getAttrib(gl, "vColor"); 
    const vNormalLoc = this.shaders["main"].getAttrib(gl, "vNormal"); 
    const vUVLoc= this.shaders["main"].getAttrib(gl, "vUV"); 

    if (vPosLoc < 0 || vColorLoc < 0 ){
      if (vPosLoc < 0) showError("vPos wasnt found");
      if (vColorLoc < 0) showError("vColor wasnt found");
      return;
    }

    this.vaos["cube"] = create3dPosColorInterleavedVao(gl, cubeVertices, cubeIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.vaos["table"] = create3dPosColorInterleavedVao(gl, tableVertices, tableIndices, vPosLoc, vColorLoc, vNormalLoc, vUVLoc);

    gl.viewport(0, 0, this.width, this.height);

    const UP_VEC = Vec3.make(0, 1, 0);
    this.shapes = [];
    //this.shapes.push(new Shape(Vec3.make(0, 1.0, 0), Vec3.make(0.4, 0.4, 0.4), UP_VEC, 0, this.shaders["main"], this.cubeVao, CUBE_INDICES.length));
    //this.shapes.push(new Shape(Vec3.make(2, 1.0, -1), Vec3.make(1.0, 1.0, 1.0), UP_VEC, 0, this.shaders["main"], this.cubeVao, CUBE_INDICES.length));
    
    this.light = new Light(
      Vec3.make(4, 20.0, 2), Vec3.make(0.2, 0.2, 0.2), UP_VEC, 0, this.shaders["light"], this.vaos["cube"], CUBE_INDICES.length, Vec3.make(5,5,5)
    );
  }

  handleKeyDown(e : KeyboardEvent){
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
    if (e.key == "e") 
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 1, 0));
    if (e.key == "q") 
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, -1, 0));
    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);
  }

  handleKeyUp(e : KeyboardEvent){
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
    if (e.key == "e") 
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 1, 0));
    if (e.key == "q") 
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, -1, 0));
  }

  handleMouseMovement(e : MouseEvent){
    this.mouseMoveVector = Vec2.make(e.movementX, e.movementY);
    this.mouseMoveVector.y *= -1.0;
  }


  update(gl : WebGL2RenderingContext, dt : number) {

    this.total_time += dt;
    this.pCamera.update(Vec3.multScalar(this.moveVector, this.isShiftPressed ? 4 : 1), this.mouseMoveVector, dt);
    this.mouseMoveVector = Vec2.make(0,0);

    this.perlinFloor.update(gl, this.perlin3d, this.pCamera.pos);
  }


  setShaderUniform(gl : WebGL2RenderingContext, shader : ShaderProgram, matViewProj : Mat4x4){
    shader.bind(gl);
    gl.uniformMatrix4fv(shader.getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(shader.getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    gl.uniform3f(shader.getUniform(gl, "lightPos"), this.light.pos.x, this.light.pos.y, this.light.pos.z);
    gl.uniform3f(shader.getUniform(gl, "cameraPos"), this.pCamera.pos.x, this.pCamera.pos.y, this.pCamera.pos.z);
    shader.unbind(gl);
  }


  draw(gl : WebGL2RenderingContext ) {

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    const matViewProj = Mat4x4.multMatrix(this.pCamera.lookAtMatrix, this.pCamera.perpective);
    this.setShaderUniform(gl, this.shaders["main"], matViewProj);
    this.setShaderUniform(gl, this.shaders["floor"], matViewProj);

    this.shaders["light"].bind(gl);
    gl.uniformMatrix4fv(this.shaders["light"].getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.shaders["light"].getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);

    this.shapes.forEach(element => {
      element.draw(gl);
    });
    this.light.draw(gl);
    this.perlinFloor.draw(gl);
    
    gl.finish();
    this.perlinFloor.updateSwaps(gl);
  }

}
