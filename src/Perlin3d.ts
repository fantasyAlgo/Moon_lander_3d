import { Vec2 } from "./glMath/Vec2";

function fade(t : number){
  return 6*Math.pow(t, 5) - 15*Math.pow(t, 4) + 10*Math.pow(t, 3);
}
export class Perlin3d {
  grid : Vec2[][];
  grid_width : number;
  grid_height : number;

  constructor(grid_width : number, grid_height : number){
    this.grid_height = grid_height;
    this.grid_width = grid_width;
    this.grid = [];
    for (let i = 0; i < grid_width; i++) {
      let lst : Vec2[] = [];
      for (let j = 0; j < grid_height; j++) {
        lst.push( Vec2.normalize(Vec2.make(1.0 - 2.0*Math.random(), 1.0 - 2.0*Math.random())) );
      }
      this.grid.push(lst);
    }
  }
  get(x : number = 0, y : number = 0){
    if (x < 0) x*=-1;
    if (y < 0) y*=-1;
    const percX = x - Math.floor(x);
    const percY = y - Math.floor(y);
    const iX : number = Math.floor(x)%this.grid_width;
    const iY : number = Math.floor(y)%this.grid_height;
    const vec : Vec2 = Vec2.make(percX, percY);

    const d00 : number = -Vec2.dot(Vec2.sub(vec , Vec2.make(0.0, 0.0)), this.grid[iX][iY]);
    const d10 : number = -Vec2.dot(Vec2.sub(vec , Vec2.make(1.0, 0.0)), this.grid[iX+1][iY]);
    const d01 : number = -Vec2.dot(Vec2.sub(vec , Vec2.make(0.0, 1.0)), this.grid[iX][iY+1]);
    const d11 : number = -Vec2.dot(Vec2.sub(vec , Vec2.make(1.0, 1.0)), this.grid[iX+1][iY+1]);

    const u : number = fade(percX);
    const v : number = fade(percY);
    const ix0 : number = d00*(1.0-u) + d10*u;
    const ix1 : number = d01*(1.0-u) + d11*u;
    const value : number = ix0*(1.0-v) + ix1*v;
    return value;

  }
}
