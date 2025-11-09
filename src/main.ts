import { Game } from "./Game.ts";
import { showError } from "./helpers/glHelpers.ts";
import { Mat4x4 } from "./glMath/mat4x4.ts";
import { loadObj, ModelData } from "./helpers/objLoader.ts";
import { getCookie, setCookie } from "./helpers/cookieHelpers.ts"

async function loadText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}



async function loadImage(url : string) : Promise<ImageBitmap> {
  const blob = await fetch(url).then(r => r.blob());
  const bitmap = await createImageBitmap(blob);
  return bitmap;
}



function saveInput() {
  const weightButton = document.getElementById("weight") as HTMLSelectElement;
  const velocityButton = document.getElementById("velocity") as HTMLSelectElement;
  const difficultyButtom = document.getElementById("difficulty") as HTMLSelectElement;
  var weight = weightButton.value;
  var velocity = velocityButton.value;
  var difficulty = difficultyButtom.value;

  localStorage.setItem("weight", weight == "" ? "200" : weight);
  localStorage.setItem("difficulty", difficulty.valueOf());
  localStorage.setItem(
  "velocity",
  velocity == "" ? "30" : velocity,
  );
}



let game : Game;
let canvas : HTMLCanvasElement;


const best_score : string | null = getCookie("best_score");
const scoreElement : HTMLElement | null = document.getElementById('best_score');
if (scoreElement != null && best_score != null)
  scoreElement.innerHTML = "best score: " + (Number(best_score)/100.0).toFixed(2);

function initGame(shaders : Object, models : Object, textures : Object, textNodes : Object){
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
   
  if (game == undefined)
    game = new Game(gl, canvas.width, canvas.height, shaders, models, textures, textNodes);
  else game.reset(gl);

  let lastTime = performance.now();
  let dt : number;

  function step(){
    if (!gl) return;

    const now = performance.now();
    dt = (now-lastTime)/5;
    lastTime = now;

    game.update(gl, dt);
    game.draw(gl);
    if (game.isRunning)
      requestAnimationFrame(step);
    if (!game.isRunning){
      if (!loader) throw new Error("loader didnt load");
      if (!gameContainer) throw new Error("gameContainer didnt load");
      if (!landingPage) throw new Error("landingPage didnt load");
      loader.classList.remove('active');
      gameContainer.classList.remove('active');
      landingPage.classList.remove('hidden');
      loadButton.disabled = false;
      document.exitPointerLock();

      let cookie = getCookie("best_score");
      if (cookie == undefined) setCookie("best_score", ""+game.total_time, 100);
      console.log("cookie: ", cookie )
      if (Number(cookie) < game.total_time)
        setCookie("best_score", ""+game.total_time, 100);

      cookie = getCookie("best_score");
      if (scoreElement != null && cookie != null)
        scoreElement.innerHTML = "best score: " + (Number(cookie)/100.0).toFixed(2);
      
    }
  }
  if (game.isRunning)
    step();
}

async function getShaders() {
    const shader_source = "src/shaders";

    const shader_names = [
      "fMain", "fLight", "vLight", "vMain", "vFloor", "fFloor", "fParticle", "vParticle", "vCubemap", "fCubemap", "vCrossair", "fCrossair"
    ]; 

    let object: { [Name: string]: string} = {};
    for (let i = 0; i < shader_names.length; i++)
      object[shader_names[i]] = await loadText(shader_source.concat("/", shader_names[i], ".glsl"));
    return object;
}
async function getModels(){
  const model_source = "models";
  const models_names = [
    "lander", "rover", "roverConvex", "bullet",
  ];
  let object: { [Name: string]: ModelData} = {};
  for (let i = 0; i < models_names.length; i++)
    object[models_names[i]] = await loadObj(model_source.concat("/", models_names[i], ".obj"));
  return object;
}

function getNodes() {
  const idNames = [
    "time"
  ];

  let object : { [Name : string] : Text} = {};
  idNames.forEach((id : string) => {
    const element = document.querySelector("#".concat(id));
    object[id] = document.createTextNode("");
    element?.appendChild(object[id]);
  });
  return object;
}

async function getImagesAsBitmap(){
  const model_source = "images";
  const image_names = [
    "random1",
    "random2",
    "random3",
    "random4",
    "random5",
    "random6",
  ];
  let object: { [Name: string]: ImageBitmap} = {};
  for (let i = 0; i < image_names.length; i++)
    object[image_names[i]] = await loadImage(model_source.concat("/", image_names[i], ".png"));
  return object;
}


const loadButton : HTMLButtonElement = document.getElementById('loadButton') as HTMLButtonElement;
const loader = document.getElementById('loader');
const progressText = document.getElementById('progressText');
const landingPage = document.getElementById('landingPage');
const gameContainer = document.getElementById('gameContainer');

async function loadGame() {
    if (!loader) throw new Error("loader didnt load");
    if (!gameContainer) throw new Error("gameContainer didnt load");
    if (!landingPage) throw new Error("landingPage didnt load");
    if (!progressText) throw new Error("progressText didnt load");


    loadButton.disabled = true;
    loader.classList.add('active');
    
    try {
      saveInput();
      let shaders = await getShaders();
      let models = await getModels();
      let textures = await getImagesAsBitmap();
      let textNodes = getNodes();

      //await new Promise(resolve => setTimeout(resolve, 300));
      gameContainer.classList.add('active');
      
      //await new Promise(resolve => setTimeout(resolve, 100));

      initGame(shaders, models, textures, textNodes);
    } catch (error) {
        console.error('Error loading game:', error);
        progressText.textContent = 'Error loading game';
        loadButton.disabled = false;
    }


}

loadButton.addEventListener('click', loadGame);



document.addEventListener("keydown", (e) => {
  if (game == undefined) return;
  if (!game.isRunning) return;
  e.preventDefault();
  game.handleKeyDown(e);
});
document.addEventListener("keyup", (e) => {
  if (game == undefined) return;
  if (!game.isRunning) return;
  e.preventDefault();
  game.handleKeyUp(e);
});

document.addEventListener("mousemove", (e) => {
  if (game == undefined) return;
  if (game.isRunning)
    game.handleMouseMovement(e);
});

document.addEventListener("mousedown", (e : MouseEvent) => {
  if (game == undefined) return;
  if (game.isRunning){
    game.handleMouseDown(e);
  }

});

document.addEventListener("mouseup", (e : MouseEvent) => {
  if (game == undefined) return;
  if (game.isRunning)
    game.handleMouseUp(e);

});




document.addEventListener("click", (e : MouseEvent) => {
  if (game == undefined) return;
  if (game.isRunning){
    canvas.requestPointerLock();
  }
});

