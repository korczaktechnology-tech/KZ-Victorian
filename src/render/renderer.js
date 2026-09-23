import { createProgram } from "./shaders.js";
import { createQuadMesh } from "./meshes.js";
import { InstanceBuffer } from "./instances.js";
import { Camera } from "./camera.js";

export function createRenderer(canvas, options = {}) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  if (!gl) throw new Error("WebLords: WebGL 2.0 não está disponível neste navegador.");

  const program = createProgram(gl);
  const mesh = createQuadMesh(gl);
  const instances = new InstanceBuffer(gl, options.maxInstances ?? 4096);
  const camera = options.camera ?? new Camera();
  const vao = gl.createVertexArray();
  if (!vao) throw new Error("WebLords: falha ao criar VAO.");

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const instanceLocation = gl.getAttribLocation(program, "a_instancePosition");
  const scaleLocation = gl.getAttribLocation(program, "a_instanceScale");
  const cameraLocation = gl.getUniformLocation(program, "u_camera");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  if ([positionLocation, instanceLocation, scaleLocation].some((v) => v < 0) || !cameraLocation || !colorLocation) {
    throw new Error("WebLords: atributos/uniformes obrigatórios não encontrados.");
  }

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, instances.buffer);
  gl.enableVertexAttribArray(instanceLocation);
  gl.vertexAttribPointer(instanceLocation, 2, gl.FLOAT, false, 12, 0);
  gl.vertexAttribDivisor(instanceLocation, 1);
  gl.enableVertexAttribArray(scaleLocation);
  gl.vertexAttribPointer(scaleLocation, 1, gl.FLOAT, false, 12, 8);
  gl.vertexAttribDivisor(scaleLocation, 1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.bindVertexArray(null);

  let lastDrawCalls = 0;

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  function render(time, snapshot = {}) {
    resize();
    const positions = snapshot.positions ?? [];
    const count = Math.min(options.maxInstances ?? 4096, Math.floor(positions.length / 3));
    instances.resize(count);
    instances.data.set(positions.slice(0, count * 3));
    instances.upload(count);

    gl.clearColor(0.03, 0.03, 0.03, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix3fv(cameraLocation, false, camera.getMatrix(canvas.width / canvas.height));
    gl.uniform4f(colorLocation, 0.75, 0.82, 0.92, 1);
    gl.bindVertexArray(vao);
    if (count > 0) {
      gl.drawElementsInstanced(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0, count);
      lastDrawCalls = 1;
    } else {
      lastDrawCalls = 0;
    }
    gl.bindVertexArray(null);
  }

  return {
    render,
    getContext() { return gl; },
    getCamera() { return camera; },
    getDrawCalls() { return lastDrawCalls; },
    isWebGL2: true
  };
}
