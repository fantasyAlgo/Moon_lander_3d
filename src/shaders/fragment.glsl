#version 300 es
precision mediump float;

in vec3 vOutColor;

out vec4 outputColor;
void main(){
  outputColor = vec4(vOutColor, 1.0f);
}
