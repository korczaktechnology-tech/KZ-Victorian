export const TERRAIN_VERTEX_SHADER=`#version 300 es
in vec3 a_position;
in vec3 a_normal;
uniform mat4 u_viewProjection;
out float v_height;
out vec3 v_normal;
void main(){v_height=a_position.y;v_normal=a_normal;gl_Position=u_viewProjection*vec4(a_position,1.0);}
`;
export const TERRAIN_FRAGMENT_SHADER=`#version 300 es
precision highp float;
in float v_height;
in vec3 v_normal;
out vec4 outColor;
void main(){vec3 low=vec3(.15,.30,.07),mid=vec3(.30,.56,.12),high=vec3(.48,.70,.20);float h=clamp((v_height+4.0)/10.0,0.0,1.0);vec3 grass=mix(mix(low,mid,smoothstep(.05,.55,h)),high,smoothstep(.55,.95,h));vec3 lightDir=normalize(vec3(-.45,.75,.8));float light=.55+.45*max(dot(normalize(v_normal),lightDir),0.0);outColor=vec4(grass*light,1.0);}
`;
