#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vColor;

uniform mat4 matWorld;
uniform mat4 matViewProj;

out vec3 vOutColor;
void main(){
  gl_Position = matViewProj*matWorld * vec4(vPos, 1.0);
  
  vOutColor = vColor;
}

