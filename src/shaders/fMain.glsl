#version 300 es
precision mediump float;

in vec3 vOutColor;
in vec3 vOutNormal;
in vec3 vOutPos;

uniform vec3 lightColor;
uniform vec3 lightPos;
uniform vec3 cameraPos;

out vec4 outputColor;
void main(){
  float ambient = 0.09f;

  vec3 normal = normalize(vOutNormal);
  vec3 lightDir = normalize(lightPos - vOutPos);
  float diffuse = max(dot(lightDir, normal), 0.0);

  float specularLight = 0.9f;
  vec3 viewDirection = normalize(cameraPos - vOutPos);
  vec3 reflectionDirection = reflect(-lightDir, normal );
  float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16.0f);
  float specular = specAmount*specularLight;

  vec3 light = lightColor*(diffuse + ambient + specular) ;
  outputColor = vec4(vOutColor, 1.0f) * vec4(light, 1.0);
  //outputColor = vec4(vOutNormal, 1.0)*vec4(lightColor, 1.0) +  0.01f*diffuse + 0.0001f*vOutColor.x;
}
