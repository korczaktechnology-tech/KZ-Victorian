export const DEFAULT_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const DEFAULT_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() {
  outColor = vec4(1.0);
}
`;
