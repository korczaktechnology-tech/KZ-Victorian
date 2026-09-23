export class InstanceBuffer{
  constructor(gl,maxInstances=4096,stride=3){
    this.gl=gl;this.maxInstances=maxInstances;this.stride=stride;
    this.data=new Float32Array(maxInstances*stride);this.buffer=gl?.createBuffer()??null;this.count=0;
  }
  resize(count){const n=Math.max(0,Math.min(this.maxInstances,count|0));this.count=n;return this.data.subarray(0,n*this.stride);}
  upload(count=this.count){
    if(!this.gl||!this.buffer)return;
    const n=Math.max(0,Math.min(this.maxInstances,count|0));this.count=n;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,this.data.subarray(0,n*this.stride),this.gl.DYNAMIC_DRAW);
  }
}
