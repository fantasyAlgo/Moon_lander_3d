#version 300 es
precision mediump float;

uniform samplerCube uSkyBox;
uniform mat4 matViewProjectionInverse;

in vec4 vPos;

out vec4 outputColor;

void main(){
  vec4 t = matViewProjectionInverse*vPos;
  vec3 s = normalize(t.xyz/t.w);
  s.y *= -1.0f;
  outputColor = texture(uSkyBox, s);
  //outputColor.xyz *= 0.13f;
  outputColor.xyz *= 0.25f;
}

