export const DEFAULT_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_instancePosition;
in float a_instanceScale;
uniform mat3 u_camera;
void main() {
  vec3 world = vec3(a_position * a_instanceScale + a_instancePosition, 1.0);
  vec3 clip = u_camera * world;
  gl_Position = vec4(clip.xy, 0.0, 1.0);
}`;

export const DEFAULT_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`;

export function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebLords: não foi possível criar shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "erro desconhecido";
    gl.deleteShader(shader);
    throw new Error(`WebLords: erro de compilação do shader: ${log}`);
  }
  return shader;
}

export function createProgram(gl, vertexSource = DEFAULT_VERTEX_SHADER, fragmentSource = DEFAULT_FRAGMENT_SHADER) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("WebLords: não foi possível criar programa WebGL.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "erro desconhecido";
    gl.deleteProgram(program);
    throw new Error(`WebLords: erro ao vincular programa WebGL: ${log}`);
  }
  return program;
}
