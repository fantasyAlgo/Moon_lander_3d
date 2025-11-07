import { create3dPosColorInterleavedVao, createBufferData, createFloorVao, createQuodVao, createStaticBufferData, createStaticIndexBuffer, loadModel, makeHeightTextureFromData, makeRandomMatrix, showError } from "./helpers/glHelpers.ts";
import { ShaderProgram } from "./helpers/shaderProgram";
import { CUBE_INDICES, CUBE_VERTICES, fireyTriangleColors, getFloorIndices, getFloorVertices, PLANE_INDICES, PLANE_VERTICES, QUAD_VERTICES, rbgTriangleColors, TABLE_INDICES, TABLE_VERTICES, triangleVertices } from "./helpers/loadPerlinFloor.ts"

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
import { Cubemap } from "./Cubemap.ts";
import { Rover } from "./Rover.ts";
import { BulletHandler } from "./BulletHandler.ts";
import { Crosshair } from "./crossair.ts";


export class Game {
  loaded : boolean = false;
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
  boostTimer : number;

  light : Light;

  Fov : number;
  pCamera : Camera;

  perlin3d : Perlin3d;
  noiseTexture : WebGLTexture;

  player : Player;
  rover : Rover;


  pSystem : ParticleSystem;
  aSystem : AsteroidHandler;
  bSystem : BulletHandler;
  skybox : Cubemap;
  crossair : Crosshair;


  constructor(gl : WebGL2RenderingContext, width: number, height : number, shaders : Object, models : Object, textures : Object, public textNodes : Object){
    this.loaded = true;
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
    this.boostTimer = 0.0;

    this.pCamera = new Camera(Vec3.make(0, 1, 5), width, height, 1.0, 0.1, 80);
    
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const cubeVertices =  createBufferData(gl, CUBE_VERTICES, gl.STATIC_DRAW); 
    const cubeIndices = createStaticIndexBuffer(gl, CUBE_INDICES);
    const quodVertices = createBufferData(gl, QUAD_VERTICES , gl.STATIC_DRAW);


    this.shaders["main"] = new ShaderProgram(gl, shaders["vMain"], shaders["fMain"]);
    this.shaders["light"] = new ShaderProgram(gl, shaders["vLight"], shaders["fLight"]);
    this.shaders["floor"] = new ShaderProgram(gl, shaders["vFloor"], shaders["fFloor"]);
    this.shaders["particle"] = new ShaderProgram(gl, shaders["vParticle"], shaders["fParticle"]);
    this.shaders["cubemap"] = new ShaderProgram(gl, shaders["vCubemap"], shaders["fCubemap"]);
    this.shaders["crossair"] = new ShaderProgram(gl, shaders["vCrossair"], shaders["fCrossair"]);

    this.perlinFloor = new PerlinFloor(gl, this.perlin3d, this.shaders["floor"], Vec3.make(60, 0, 60));
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
    this.vaos["rover"] = loadModel(gl, models["rover"], vPosLoc, vColorLoc, vNormalLoc, vUVLoc);
    this.vaos["bullet"] = loadModel(gl, models["bullet"], vPosLoc, vColorLoc, vNormalLoc, vUVLoc);

    gl.viewport(0, 0, this.width, this.height);

    this.shapes = [];

    this.player = new Player(
      Vec3.make(60, 0, 60), Vec3.make(0.4, 0.4, 0.4), this.shaders["main"], this.vaos["lander"], models["lander"].indices.length, 
      models["lander"].vertices, 4.0,
    );

    this.light = new Light(
      Vec3.make(-200, 20.0, -200), Vec3.make(1.0, 1.0, 1.0), this.shaders["light"], 
      this.vaos["cube"], CUBE_INDICES.length, Vec3.make(5,5,5), CUBE_VERTICES, 
    );

    this.shaders["main"].bind(gl);
    gl.uniform1i(this.shaders["main"].getUniform(gl, "u_noiseTex"), 0);

    this.pSystem = new ParticleSystem(gl, this.shaders["particle"], cubeVertices, cubeIndices , 100000);
    this.aSystem = new AsteroidHandler(gl, this.shaders["main"], 10);
    this.skybox = new Cubemap(gl, this.shaders["cubemap"], quodVertices, textures, "random");
    this.rover = new Rover(Vec3.make(60, 20, 70), Vec3.make(5, 5, 5), this.shaders["main"], this.vaos["rover"], models["rover"].indices.length, models["roverConvex"].vertices);
    console.log("bullet: ", models["bullet"].indices)
    this.bSystem = new BulletHandler(this.shaders["light"], this.vaos["bullet"], models["bullet"].indices.length, models["bullet"].vertices );
    this.crossair = new Crosshair(gl, quodVertices, this.shaders["crossair"]);
  }

  reset(gl : WebGL2RenderingContext){
    this.pSystem.reset(gl);
    this.player.reset(Vec3.make(60, 0, 60));
    this.rover.reset(Vec3.make(60, 20, 70));
    this.aSystem.reset();

    this.perlinFloor.reset(gl, this.player.pos, this.perlin3d);

    this.total_time = 0.0
    this.moveVector = Vec3.make(0, 0, 0);
    this.mouseMoveVector = Vec2.make(0, 0);
    this.lastMousePos = Vec2.make(0, 0);
    //this.chunk_pos = Vec2.make(0.0, 0.0);
    this.boostTimer = 0.0;
    this.isRunning = true;
  }

  handleKeyDown(e : KeyboardEvent){
    const ch = e.key.charAt(0).toLowerCase();
    if (ch == "o"){
      this.isRunning = false;
    }

    if (e.key == "Shift"){
      this.isShiftPressed = true;
      return;
    }

    if (ch == "w")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 0, -1));
    if (ch == "a")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(-1, 0, 0));
    if (ch == "d")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(1, 0, 0));
    if (ch == "s")
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 0, 1));

    if (ch == "e")
      this.player.stabilizer = !this.player.stabilizer;


    if (e.code == "Space") 
      this.moveVector = Vec3.add(this.moveVector, Vec3.make(0, 1, 0));
    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);
  }

  handleKeyUp(e : KeyboardEvent){
    const ch = e.key.charAt(0).toLowerCase();
    if (e.key == "Shift"){
      this.isShiftPressed = false;
      return;
    }


    if (ch == "w")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 0, -1));
    if (ch == "a")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(-1, 0, 0));
    if (ch == "d")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(1, 0, 0));
    if (ch == "s")
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 0, 1));
    if (e.code == "Space") 
      this.moveVector = Vec3.sub(this.moveVector, Vec3.make(0, 1, 0));


    this.moveVector.clamp(-1, 1, -1, 1, -1, 1);

  }
  handleMouseMovement(e : MouseEvent){
    console.log("e: ", e.x, e.y)
    this.mouseMoveVector = Vec2.make(e.movementX, e.movementY);
    this.mouseMoveVector.y *= -1.0;
  }

  handleMouseDown(e : MouseEvent){
    if (e.button == 2)
      this.player.isAiming = true;
    if (e.button == 0)
      this.bSystem.add(this.player.pos, this.pCamera.forward, this.time);

  }
  handleMouseUp(e : MouseEvent){
    if (e.button == 2) this.player.isAiming = false;
  }



  update(gl : WebGL2RenderingContext, dt : number) {
    this.textNodes["time"].nodeValue = (this.time/100.0).toFixed(2);
    this.isRunning = !(this.player.deathTime > 600.0 || this.rover.deathTime > 7.0);
    this.time += dt;
    const maxBoostTimer = 400;
    if (this.boostTimer >= 0)
      this.boostTimer += this.isShiftPressed ? dt : -dt*0.5;
    if (this.boostTimer > maxBoostTimer) this.boostTimer = -maxBoostTimer;
    if (this.boostTimer < 0.0) this.boostTimer += dt*0.5;
    const pSprinting : boolean = this.boostTimer >= 0 && this.isShiftPressed && this.boostTimer <= maxBoostTimer;


    if (this.moveVector.y > 0)
      this.pSystem.add(this.player.pos, Vec3.multScalar(this.player.cDir, -1.0), pSprinting ? 2.0 : 1.0, this.time, 0.1, 0.9);

    if (Math.random() > (1.0-SPAWN_ASTEROID_PROB)){
      if (Math.random() > 0.95)
        this.aSystem.addAttackRover(Vec3.make(this.player.pos.x, this.player.pos.y+200, this.player.pos.z), this.rover.pos, this.rover.vel);
      if (Math.random() > 0.95)
        this.aSystem.addAttackRover(Vec3.make(this.player.pos.x, this.player.pos.y+200, this.player.pos.z), this.player.pos, this.player.vel);
      else this.aSystem.add(Vec3.make(this.player.pos.x, this.player.pos.y+200, this.player.pos.z));
    }

    this.total_time += dt;
    this.player.update(this.moveVector, this.pCamera, this.boostTimer >= 0 && this.isShiftPressed && this.boostTimer <= maxBoostTimer, dt);
    this.pCamera.update(this.mouseMoveVector, this.player.pos, !this.player.isAiming ? this.player.camera_dist : this.player.camera_dist/1.6, dt);
    this.perlinFloor.update(gl, this.perlin3d, this.player.pos);
    this.aSystem.update(this.pSystem, this.perlin3d, this.perlinFloor, this.player, this.bSystem, this.rover, this.time, dt);
    this.skybox.update(gl, this.pCamera);
    this.rover.update(dt*0.01, this.perlinFloor, this.perlin3d);


    updateEntitiesPhysics([this.player], dt);


    this.light.updateWorldData();
    this.player.updateWorldData();
    this.rover.updateWorldData();
    this.mouseMoveVector = Vec2.make(0,0);

    const coll = Collision.checkPerlinCollision(this.player, this.perlin3d, this.perlinFloor);
    if (coll.collided)
      this.player.vel.y = this.player.vel.y > 0 ? this.player.vel.y : 0.001;

    this.bSystem.update(dt, this.perlin3d, this.perlinFloor, this.pSystem, this.time);
    this.pSystem.update(gl, this.time);

  }


  setShaderUniform(gl : WebGL2RenderingContext, shader : ShaderProgram, matViewProj : Mat4x4){
    shader.bind(gl);
    gl.uniformMatrix4fv(shader.getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(shader.getUniform(gl, "lightColor"), this.light.color.x, this.light.color.y, this.light.color.z);
    gl.uniform3f(shader.getUniform(gl, "lightDir"), 0.7, 1.0, 0.0);
    gl.uniform3f(shader.getUniform(gl, "cameraPos"), this.pCamera.pos.x, this.pCamera.pos.y, this.pCamera.pos.z);
    shader.unbind(gl);
  }


  draw(gl : WebGL2RenderingContext ) {


    gl.clearColor(0.00, 0.00, 0.00, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    
    const matViewProj = Mat4x4.multMatrix(this.pCamera.lookAtMatrix, this.pCamera.perpective);
    this.setShaderUniform(gl, this.shaders["main"], matViewProj);
    this.setShaderUniform(gl, this.shaders["floor"], matViewProj);
    this.setShaderUniform(gl, this.shaders["particle"], matViewProj);

    this.shaders["light"].bind(gl);
    gl.uniformMatrix4fv(this.shaders["light"].getUniform(gl,"matViewProj"), false, matViewProj.values);
    gl.uniform3f(this.shaders["light"].getUniform(gl, "lightColor"), 0.5, 0.5, 0.5);
    gl.uniform3f(this.shaders["light"].getUniform(gl, "cameraPos"), this.pCamera.pos.x, this.pCamera.pos.y, this.pCamera.pos.z);
    this.shaders["light"].unbind(gl);

    this.shaders["main"].bind(gl);
    gl.uniform1i(this.shaders["main"].getUniform(gl, "allowTransparency"), this.player.isAiming ? 1 : 0); // dumb thing, but hey webgl
    this.shaders["main"].unbind(gl);

    this.shapes.forEach(element => {
      element.draw(gl);
    });


    //this.light.draw(gl);
    this.perlinFloor.draw(gl, this.pCamera.pos, this.pCamera.forward);
    this.aSystem.draw(gl);

    this.pSystem.draw(gl);
    this.bSystem.draw(gl);
    this.rover.draw(gl);
    //this.rover.drawSmallOnes(gl);
    this.player.draw(gl);

    gl.depthFunc(gl.LEQUAL);
    this.skybox.draw(gl);

    gl.disable(gl.DEPTH_TEST);
    this.crossair.draw(gl);
    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("WebGL Error:", error);
      throw new Error("opengl said something went wrong");
    }
    gl.finish();
    this.perlinFloor.updateSwaps(gl);

    error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error("WebGL Error:", error);
      throw new Error("opengl said something went wrong in the perlinFloor thingy");
    }

  }

}
