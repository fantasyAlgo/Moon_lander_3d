#version 300 es
precision mediump float;

in vec3 vOutColor;
in vec3 vOutNormal;
in vec3 vOutPos;
in vec2 vOutUV;


uniform vec3 lightColor;
uniform vec3 lightDir;
uniform vec3 cameraPos;
uniform sampler2D u_noiseTex;
uniform int allowTransparency; // Webgl does not have gluniform1b like in opengl (at least afaik), so i got to use ints for booleans


out vec4 outputColor;

void main(){
  float ambient = 0.01f + clamp(vOutPos.y*0.01f, -0.5, 0.1);

  float noise_height = texture(u_noiseTex, vOutUV*2.0f).r;

  vec3 normal = normalize(vOutNormal);
  vec3 lightDirN = normalize(lightDir);
  float diffuse = max(dot(lightDirN, normal), 0.0);

  float specularLight = 0.2f;
  vec3 viewDirection = normalize(cameraPos - vOutPos);
  vec3 reflectionDirection = reflect(-lightDirN, normal );
  float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16.0f);
  float specular = specAmount*specularLight;

  vec3 light = lightColor*(0.3f*diffuse + ambient + specular  + noise_height*0.05f) ;
  outputColor = vec4(vOutColor, 1.0f) * vec4(light, 1.0);
  if (allowTransparency == 1) outputColor.a = 0.1;
  //outputColor = vec4(vOutNormal, 1.0)*vec4(lightColor, 1.0) +  0.01f*diffuse + 0.0001f*vOutColor.x;
}
