#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vColor;
in vec3 vNormal;

uniform mat4 matWorld;
uniform mat4 matViewProj;

out vec3 vOutColor;
out vec3 vOutNormal;
out vec3 vOutPos;
void main(){
  vec4 model_pos = matWorld * vec4(vPos, 1.0);
  gl_Position = matViewProj*model_pos;
  
  vOutColor = vColor;
  vOutNormal = vNormal;
  vOutPos = model_pos.xyz;
}

