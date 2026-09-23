export class InstanceBuffer {
  constructor(gl,maxInstances=4096){this.gl=gl;this.maxInstances=maxInstances;this.data=new Float32Array(0);this.buffer=gl?.createBuffer()??null;}
  resize(count){const n=Math.max(0,Math.min(this.maxInstances,count|0));this.data=new Float32Array(n*3);return this.data;}
  upload(count=this.data.length/3){if(!this.gl||!this.buffer)return;const n=Math.max(0,Math.min(this.maxInstances,count|0));this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,this.data.subarray(0,n*3),this.gl.DYNAMIC_DRAW);}
}