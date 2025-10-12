#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vColor;
in vec3 vNormal;
in vec2 vUV;

uniform mat4 matWorld;
uniform mat4 matViewProj;
uniform sampler2D u_noiseTex;

out vec3 vOutColor;
out vec3 vOutNormal;
out vec3 vOutPos;
out vec2 vOutUV;
void main(){
  vec4 model_pos = matWorld * vec4(vPos, 1.0);
  float noise_height = texture(u_noiseTex, vUV).r;
  model_pos.y += noise_height*0.05f;

  gl_Position = matViewProj*model_pos;
  
  vOutColor = vColor;
  vOutNormal = vNormal;
  vOutPos = model_pos.xyz;
  vOutUV = vUV;
}

