#version 300 es
precision mediump float;


in vec2 aPos;
out vec4 vPos;

void main(){
  float width = 0.03;
  vPos = vec4(aPos.xy*vec2(width/2.0, width), 0.0, 1.0);
  gl_Position = vPos;
  gl_Position.z = 0.0f;

}
