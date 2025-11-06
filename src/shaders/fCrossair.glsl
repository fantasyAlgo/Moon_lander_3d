#version 300 es
precision mediump float;

in vec4 vPos;

out vec4 outputColor;
void main(){
  float thickness = 0.003;
  if (abs(vPos.x) > thickness/2.0 && abs(vPos.y) > thickness) discard;

  outputColor = vec4(1.0f, 1.0f, 1.0, 1.0);
}
