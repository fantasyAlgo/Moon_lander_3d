#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vColor;
in vec3 vNormal;
in vec2 vUV;

in vec3 initialPos;
in vec3 vDir;
in float startTime;
in float size;


uniform mat4 matViewProj;
uniform float cTime;

out vec3 vOutColor;
out vec3 vOutNormal;
out vec3 vOutPos;
out vec2 vOutUV;
out vec2 vRelative;

void main(){
  float dt = 0.1f*(cTime - startTime);
  float timeScale = 0.075f*dt > 1.0f ? 0.0 : 1.0f-0.075f*dt;
  vec3 oPos = initialPos + 0.5f*dt*vDir;
  vec4 model_pos = vec4(oPos, 0.0) + vec4(size*0.080f*timeScale*vPos, 1.0);
  float noise_height = vUV.x;
  model_pos.y += noise_height*0.005f;

  gl_Position = matViewProj*model_pos;
  
  vOutColor = vec3(1.0f, 0.2f, 0.0f) + 0.001f*vColor;
  vOutNormal = vNormal;
  vOutPos = model_pos.xyz;
  vOutUV = vUV;
}

