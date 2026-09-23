export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
  }

  setPosition(x, y) { this.x = Number(x) || 0; this.y = Number(y) || 0; return this; }
  setZoom(zoom) { this.zoom = Math.max(0.05, Number(zoom) || 1); return this; }

  getMatrix(aspect = 1) {
    const sx = this.zoom / Math.max(aspect, 0.0001);
    const sy = this.zoom;
    return new Float32Array([
      sx, 0, 0,
      0, sy, 0,
      -this.x * sx, -this.y * sy, 1
    ]);
  }
}
