#version 300 es
precision mediump float;

in vec3 vPos;
in vec3 vColor;
in vec3 vNormal;
in vec2 vUV;

uniform mat4 matWorld;
uniform mat4 matViewProj;
uniform vec3 cameraPos;


out vec3 vOutColor;
out vec3 vOutNormal;
out vec3 vOutPos;
out vec2 vOutUV;
void main(){
  vec4 model_pos = matWorld * vec4(vPos, 1.0);
  float noise_height = vUV.x;
  model_pos.y += noise_height*0.005f;

  vec4 posView = model_pos;
  
  if (true){
    float fragmentDist = length(cameraPos-posView.xyz);
    float curvature = 0.001f;
    float curved = posView.y - curvature * pow(fragmentDist, 2.0);
    posView.y = curved;
  }

  gl_Position = matViewProj*posView;
  
  vOutColor = vColor;
  vec4 weirdN = vec4(vNormal, 1.0f)*matWorld - vec4(vec3(0.0f), 1.0f)*matWorld ;
  vOutNormal = vNormal;//normalize(weirdN.xyz);
  vOutPos = model_pos.xyz;
  vOutUV = vUV;
}

