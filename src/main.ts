import { Game } from "./Game.ts";
import { showError } from "./helpers.ts";
import { vShaderCode } from "./vertexShader.ts";
import { fShaderCode } from "./fragmentShader.ts";

function initGame(){
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

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  var game = new Game(gl, canvas.width, canvas.height, vShaderCode, fShaderCode);
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
  initGame()
} catch (e) {
  console.log(e);
  showError("There was a problem with the game initialization");
}







