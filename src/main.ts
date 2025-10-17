import { Game } from "./Game.ts";
import { showError } from "./helpers/glHelpers.ts";
import { vShaderCode } from "./vertexShader.ts";
import { fShaderCode } from "./fragmentShader.ts";
import { Mat4x4 } from "./glMath/mat4x4.ts";
import { loadObj } from "./helpers/objLoader.ts";

async function loadText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}

let game : Game;
let canvas : HTMLCanvasElement;

function initGame(shaders : Object, models : Object){
  console.log(models["lander"]);
  canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;
  if (!canvas){
    showError("Canvas nope");
    return;
  }

  const gl = canvas.getContext('webgl2', { antialias: true });
  if (!gl){
    showError("webgl2 nope");
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  game = new Game(gl, canvas.width, canvas.height, shaders, models);
  let lastTime = performance.now();
  let dt : number;

  function step(){
    const now = performance.now();
    dt = (now-lastTime)/5;
    lastTime = now;

    if (!gl) return;
    game.update(gl, dt);
    game.draw(gl);

    requestAnimationFrame(step);
  }
  step();
}

async function getShaders(){
    const shader_source = "src/shaders";

    const shader_names = [
      "fMain", "fLight", "vLight", "vMain", "vFloor", "fFloor",
    ]; 

    let object = {};
    for (let i = 0; i < shader_names.length; i++)
      object[shader_names[i]] = await loadText(shader_source.concat("/", shader_names[i], ".glsl"));
    return object;
}
async function getModels(){
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

