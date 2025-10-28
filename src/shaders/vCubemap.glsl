#version 300 es
precision mediump float;


in vec4 aPos;
out vec4 vPos;

void main(){
  vPos = aPos;
  gl_Position = vPos;
  gl_Position.z = 1.0f;

}
