import { Game } from "./Game.ts";
import { showError } from "./helpers.ts";
import { vShaderCode } from "./vertexShader.ts";
import { fShaderCode } from "./fragmentShader.ts";
import { Mat4x4 } from "./glMath/mat4x4.ts";

async function loadText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}

let game : Game;

function initGame(data){
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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(data["vertexCode"]);

  game = new Game(gl, canvas.width, canvas.height, data["vertexCode"], data["fragmentCode"]);
  let lastTime = performance.now();
  let dt : number;

  function step(){
    const now = performance.now();
    dt = (now-lastTime)/5;
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
    const vertexCode = await loadText("src/shaders/vertex.glsl");
    const fragmentCode = await loadText("src/shaders/fragment.glsl");
    initGame({ vertexCode, fragmentCode });
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
  game.handleMouseMovement(e);
});



