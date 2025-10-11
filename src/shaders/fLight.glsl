#version 300 es
precision mediump float;

in vec3 vOutColor;
in vec3 vOutNormal;

uniform vec3 lightColor;

out vec4 outputColor;
void main(){
  outputColor = vec4(lightColor, 1.0) + 0.001f*vec4(vOutNormal, 1.0f);
}
