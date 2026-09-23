export class InstanceBuffer {
  constructor() {
    this.data = new Float32Array(0);
  }

  resize(count) {
    this.data = new Float32Array(count * 4);
    return this.data;
  }
}
