#version 300 es
precision mediump float;


in vec3 vOutColor;
in vec3 vOutNormal;
in vec3 vOutPos;
in vec2 vOutUV;
in float vVisibility;

uniform vec3 lightColor;
uniform vec3 lightDir;
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
  float ambient = 0.2f + curvature;


  float noise_height = texture(u_noiseTex, vOutUV*1.5f).r;

  vec3 normal = normalize(vOutNormal);
  vec3 lightDirN = normalize(lightDir);
  float diffuse = max(dot(lightDirN, normal), 0.0);

  float specularLight = 0.3f;
  vec3 viewDirection = normalize(cameraPos - vOutPos);
  vec3 reflectionDirection = reflect(-lightDirN, normal );
  float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16.0f);
  float specular = specAmount*specularLight;

  vec3 light = lightColor*(0.1f*diffuse + ambient + 0.5f*specular + noise_height*0.1f) ;

  outputColor = vec4(vOutColor, 1.0f) * vec4(light, 1.0);
  outputColor = mix(vec4(0.08f, 0.08f, 0.08f, 1.0f), outputColor, vVisibility);
  //outputColor = vec4(vOutNormal, 1.0)*vec4(lightColor, 1.0) +  0.01f*diffuse + 0.0001f*vOutColor.x;
}
