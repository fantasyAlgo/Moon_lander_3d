#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vNormal;

uniform mat4 matWorld;
uniform mat4 matViewProj;

uniform vec2 chunkPos;
uniform sampler2D u_noiseTex;

out vec3 vOutColor;
out vec3 vOutNormal;
out vec3 vOutPos;
out vec2 vOutUV;
void main(){
  vec2 vUV = 1.0f+vec2(vPos.x, vPos.z)*0.5f;
  vec4 model_pos = matWorld * vec4(vPos, 1.0);
  model_pos += vec4(chunkPos.x, 0.0, chunkPos.y, 0.0);

  float noise_height = texture(u_noiseTex, vUV).r;
  model_pos.y += noise_height*0.05f;

  gl_Position = matViewProj*model_pos;
  
  vOutColor = vec3(0.2+vPos.y*0.05) + vNormal.y;
  vOutNormal = vec3(vNormal.x, 1.0, vNormal.y);
  vOutPos = model_pos.xyz;
  vOutUV = vUV;
}

