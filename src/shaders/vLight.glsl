#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vColor;
in vec3 vNormal;
in vec2 vUV;

uniform mat4 matWorld;
uniform mat4 matViewProj;

out vec3 vOutColor;
out vec3 vOutNormal;
out vec2 vOutUV;
void main(){
  gl_Position = matViewProj*matWorld * vec4(vPos, 1.0);
  
  vOutColor = vColor;
  vOutNormal = vNormal;
}

