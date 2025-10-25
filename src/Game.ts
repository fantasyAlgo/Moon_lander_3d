import { create3dPosColorInterleavedVao, createBufferData, createFloorVao, createStaticBufferData, createStaticIndexBuffer, loadModel, makeHeightTextureFromData, makeRandomMatrix, showError } from "./helpers/glHelpers.ts";
import { ShaderProgram } from "./helpers/shaderProgram";
import { CUBE_INDICES, CUBE_VERTICES, fireyTriangleColors, getFloorIndices, getFloorVertices, PLANE_INDICES, PLANE_VERTICES, rbgTriangleColors, TABLE_INDICES, TABLE_VERTICES, triangleVertices } from "./helpers/loadPerlinFloor.ts"

import {Mat4x4 } from "./glMath/mat4x4.ts"
import {Vec3 } from "./glMath/vec3.ts"
import {Vec4 } from "./glMath/vec4.ts"
import { Quat } from "./glMath/Quat.ts";
import { Shape } from "./Shape.ts";
import { Vec2 } from "./glMath/vec2.ts";
import { Camera } from "./Camera.ts";
import { Light } from "./Light.ts";
import { Perlin3d } from "./helpers/Perlin3d.ts";
import { PerlinFloor } from "./PerlinFloor.ts";
import { Player } from "./Player.ts";
import { updateEntitiesPhysics } from "./Physics.ts";
import { Collision } from "./Collision.ts";
import { ParticleSystem } from "./ParticleSystem.ts";
import { AsteroidHandler } from "./Asteroids.ts";
import { SPAWN_ASTEROID_PROB } from "./Settings.ts";






export class Game {
  time : number = 0;
  isRunning : boolean = true;
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

  player : Player;
  pSystem : ParticleSystem;
  aSystem : AsteroidHandler;

  constructor(gl : WebGL2RenderingContext, width: number, height : number, shaders : Object, models : Object){
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

    this.pCamera = new Camera(Vec3.make(0, 1, 5), width, height, 1.0, 0.1, 80);
    
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const cubeVertices =  createBufferData(gl, CUBE_VERTICES, gl.STATIC_DRAW); 
    const planeVertices = createBufferData(gl, PLANE_VERTICES, gl.STATIC_DRAW);

    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const planeIndices = createStaticIndexBuffer(gl, PLANE_INDICES);


    this.shaders["main"] = new ShaderProgram(gl, shaders["vMain"], shaders["fMain"]);
    this.shaders["light"] = new ShaderProgram(gl, shaders["vLight"], shaders["fLight"]);
    this.shaders["floor"] = new ShaderProgram(gl, shaders["vFloor"], shaders["fFloor"]);
    this.shaders["particle"] = new ShaderProgram(gl, shaders["vParticle"], shaders["fParticle"]);

    this.perlinFloor = new PerlinFloor(gl, this.perlin3d, this.shaders["floor"], Vec3.make(10, 0, 0));
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
    this.vaos["lander"] = loadModel(gl, models["lander"], vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.vaos["sphere"] = loadModel(gl, models["sphere"], vPosLoc, vColorLoc, vNormalLoc, vUVLoc);

    gl.viewport(0, 0, this.width, this.height);

    this.shapes = [];
    /*
    for (let i = -20; i < 20; i++) {
      for (let j = -20; j < 20; j++) {
        this.shapes.push(new Shape(
          Vec3.make(i, this.perlinFloor.getValue(this.perlin3d, i, j), j),
          Vec3.make(0.2, 0.2, 0.2), this.shaders["main"], this.vaos["sphere"], models["sphere"].indices.length
        ));
      }
    }*/


    this.player = new Player(
      Vec3.make(0, 0, 0), Vec3.make(0.4, 0.4, 0.4), this.shaders["main"], this.vaos["lander"], models["lander"].indices.length, 
      models["lander"].vertices, 4.0,
    );

    this.light = new Light(
      Vec3.make(4, 20.0, 2), Vec3.make(1.0, 1.0, 1.0), this.shaders["light"], 
      this.vaos["cube"], CUBE_INDICES.length, Vec3.make(5,5,5), CUBE_VERTICES, 
    );
    this.shaders["main"].bind(gl);
    gl.uniform1i(this.shaders["main"].getUniform(gl, "u_noiseTex"), 0);

    this.pSystem = new ParticleSystem(gl, this.shaders["particle"], cubeVertices, cubeIndices , 100000);
    this.aSystem = new AsteroidHandler(gl, this.shaders["main"], 10);
    
  }

  handleKeyDown(e : KeyboardEvent){
    if (e.key == "o"){
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
    if (e.code == "Space") 
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 1, 0));
    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);
  }

  handleMouseMovement(e : MouseEvent){
    this.mouseMoveVector = Vec2.make(e.movementX, e.movementY);
    this.mouseMoveVector.y *= -1.0;
  }


  update(gl : WebGL2RenderingContext, dt : number) {
    this.time += dt;
    //if (Math.floor(this.time)%100 == 0)
    //this.pSystem.add(Vec3.make(0, 5, 0), Vec3.make(0, 0, 0), this.time, 0.2, 2);
    if (this.moveVector.y > 0)
      this.pSystem.add(this.player.pos, Vec3.multScalar(this.player.cDir, -1.0), 1.0, this.time, 0.1, 0.4);
    if (Math.random() > (1.0-SPAWN_ASTEROID_PROB)){
      this.aSystem.add(Vec3.make(this.player.pos.x, 200, this.player.pos.z));
    }

    this.total_time += dt;
    this.player.update(this.moveVector, this.pCamera, dt);
    this.pCamera.update(Vec3.multScalar(this.moveVector, this.isShiftPressed ? 4 : 1), this.mouseMoveVector, this.player.pos, this.player.camera_dist, dt);
    this.perlinFloor.update(gl, this.perlin3d, this.player.pos);
    this.aSystem.update(this.pSystem, this.perlin3d, this.perlinFloor, this.time, dt);
    //updateEntitiesPhysics([this.player], dt);
    updateEntitiesPhysics([this.player, ...this.aSystem.asteroids], dt);


    this.light.updateWorldData();
    this.player.updateWorldData();
    this.mouseMoveVector = Vec2.make(0,0);

    const coll = Collision.checkPerlinCollision(this.player, this.perlin3d, this.perlinFloor);
    if (coll.collided){
      this.player.vel.y = this.player.vel.y > 0 ? this.player.vel.y : 0.001;
    }

    this.pSystem.update(gl, this.time);

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
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    const matViewProj = Mat4x4.multMatrix(this.pCamera.lookAtMatrix, this.pCamera.perpective);
    this.setShaderUniform(gl, this.shaders["main"], matViewProj);
    this.setShaderUniform(gl, this.shaders["floor"], matViewProj);
    this.setShaderUniform(gl, this.shaders["particle"], matViewProj);

    this.shaders["light"].bind(gl);
    gl.uniformMatrix4fv(this.shaders["light"].getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.shaders["light"].getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    this.shaders["light"].unbind(gl);

    this.shapes.forEach(element => {
      element.draw(gl);
    });


    //this.light.draw(gl);
    this.perlinFloor.draw(gl);
    this.player.draw(gl);
    this.pSystem.draw(gl);
    this.aSystem.draw(gl);
    
    gl.finish();
    this.perlinFloor.updateSwaps(gl);

    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("WebGL Error:", error);
      throw new Error("opengl said something went wrong");
    }

  }

}
