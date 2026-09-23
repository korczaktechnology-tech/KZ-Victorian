export function createRenderer(canvas) {
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    return {
      render() {
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  return {
    render() {
      resize();
      gl.clearColor(0.03, 0.03, 0.03, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  };
}
