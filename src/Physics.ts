import { Shape } from "./Shape";

const GRAVITY = -0.0001;
const ATMOSPHERE_FRICTION = 0.001;

export function updateEntitiesPhysics(entities : Shape[], dt : number){
  for (let e of entities){
    updateEntity(e, dt);
  }
}

export function updateEntity(e : Shape, dt : number){
  e.vel.y += dt * (GRAVITY - ATMOSPHERE_FRICTION*e.vel.y);
}


