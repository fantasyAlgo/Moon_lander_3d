#version 300 es
precision mediump float;


in vec3 vOutColor;
in vec3 vOutNormal;
in vec3 vOutPos;
in vec2 vOutUV;

uniform vec3 lightColor;
uniform vec3 lightPos;
uniform vec3 cameraPos;
uniform sampler2D u_noiseTex;

out vec4 outputColor;

float getCurvature(){
  vec3 n = normalize(vOutNormal);

  // Compute curvature
  vec3 dx = dFdx(n);
  vec3 dy = dFdy(n);
  vec3 xneg = n - dx;
  vec3 xpos = n + dx;
  vec3 yneg = n - dy;
  vec3 ypos = n + dy;
  float depth = length(vOutPos);
  return (cross(xneg, xpos).y - cross(yneg, ypos).x) * 4.0 / depth;
}


void main(){
  float curvature = getCurvature();
  float ambient = 0.09f + curvature;


  float noise_height = texture(u_noiseTex, vOutUV*1.5f).r;

  vec3 normal = normalize(vOutNormal);
  vec3 lightDir = normalize(lightPos - vOutPos);
  float diffuse = max(dot(lightDir, normal), 0.0);

  float specularLight = 0.3f;
  vec3 viewDirection = normalize(cameraPos - vOutPos);
  vec3 reflectionDirection = reflect(-lightDir, normal );
  float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16.0f);
  float specular = specAmount*specularLight;

  vec3 light = lightColor*(diffuse + ambient + specular + noise_height*0.08f) ;
  outputColor = vec4(vOutColor, 1.0f) * vec4(light, 1.0);
  //outputColor = vec4(vOutNormal, 1.0)*vec4(lightColor, 1.0) +  0.01f*diffuse + 0.0001f*vOutColor.x;
}
