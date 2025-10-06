#version 300 es
precision mediump float;

in vec2 vPos;
in vec3 vColor;

uniform vec2 canvas_size;
uniform vec2 shapeLocation;
uniform float shapeSize;

out vec3 vOutColor;
void main(){
  vec2 fPosition = vPos*shapeSize + shapeLocation;
  fPosition = 2.0f*(fPosition/canvas_size) - 1.0f;
  gl_Position = vec4(fPosition, 0.0, 1.0);
  
  vOutColor = vColor;
}

