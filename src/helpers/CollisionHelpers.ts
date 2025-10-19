import { Vec2 } from "../glMath/vec2";
import { Vec3 } from "../glMath/vec3";


export function getFloorProjection(s : Vec3[]) : Vec2[]{
  let leftMost   : Vec2 = Vec2.make(Infinity, 0);
  let rightMost  : Vec2 = Vec2.make(-Infinity, 0);
  let upMost     : Vec2 = Vec2.make(0, -Infinity);
  let bottomMost : Vec2 = Vec2.make(0, Infinity);
  for (let i = 0; i < s.length; i++) {
    if (s[i].x > rightMost.x)
      rightMost.copy(Vec2.make(s[i].x, s[i].z));
    if (s[i].x < leftMost.x)
      leftMost.copy(Vec2.make(s[i].x, s[i].z));
    if (s[i].z > upMost.y)
      upMost.copy(Vec2.make(s[i].x, s[i].z));
    if (s[i].z < bottomMost.y)
      bottomMost.copy(Vec2.make(s[i].x, s[i].z));
  }
  return [rightMost, leftMost, upMost, bottomMost];
}
