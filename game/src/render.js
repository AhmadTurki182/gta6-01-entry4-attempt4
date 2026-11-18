// Raw WebGL renderer: no library, no CDN. Boxes, ground, sky, lights.
export function createGL(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: true }) ||
    canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });
  if (!gl) return null;
  const vs = `attribute vec3 aPos; attribute vec3 aCol; uniform mat4 uMVP; varying vec3 vCol;
    void main(){ gl_Position = uMVP * vec4(aPos,1.0); vCol = aCol; }`;
  const fs = `precision mediump float; varying vec3 vCol; uniform float uLight;
    void main(){ gl_FragColor = vec4(vCol * uLight, 1.0); }`;
  function shader(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const aPos = gl.getAttribLocation(prog, "aPos");
  const aCol = gl.getAttribLocation(prog, "aCol");
  const uMVP = gl.getUniformLocation(prog, "uMVP");
  const uLight = gl.getUniformLocation(prog, "uLight");
  gl.enable(gl.DEPTH_TEST);
  return { gl, prog, aPos, aCol, uMVP, uLight };
}
export function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
export function mat4LookAt(eye, center, up) {
  const zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
  let zl = Math.hypot(zx, zy, zz); const z = [zx / zl, zy / zl, zz / zl];
  let xx = up[1] * z[2] - up[2] * z[1], xy = up[2] * z[0] - up[0] * z[2], xz = up[0] * z[1] - up[1] * z[0];
  let xl = Math.hypot(xx, xy, xz); const x = [xx / xl, xy / xl, xz / xl];
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]), -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]), -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]), 1];
}
export function mat4Mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
export function hexRGB(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
// Unit box centered at origin, scaled/translated by caller via model matrix baked into vertices.
export function boxVerts(cx, cy, cz, sx, sy, sz, color, rotY = 0) {
  const c = hexRGB(color);
  const hs = [sx / 2, sy / 2, sz / 2];
  const corners = [];
  for (const [a, b, d] of [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]) {
    const lx = a * hs[0], ly = b * hs[1], lz = d * hs[2];
    const cos = Math.cos(rotY), sin = Math.sin(rotY);
    corners.push([cx + lx * cos + lz * sin, cy + ly, cz - lx * sin + lz * cos]);
  }
  const faces = [[0, 1, 2, 3], [4, 6, 5, 7], [0, 4, 5, 1], [2, 6, 7, 3], [0, 3, 7, 4], [1, 5, 6, 2]];
  const shade = [1, 0.85, 0.7, 0.9, 0.6, 0.75];
  const pos = [], col = [];
  faces.forEach((f, fi) => {
    const tris = [[f[0], f[1], f[2]], [f[0], f[2], f[3]]];
    for (const t of tris) for (const idx of t) {
      pos.push(...corners[idx]);
      const s = shade[fi];
      col.push(c[0] * s, c[1] * s, c[2] * s);
    }
  });
  return { pos, col };
}
export function drawBoxes(renderer, boxes, mvp, light) {
  const { gl } = renderer;
  let pos = [], col = [];
  for (const b of boxes) {
    const v = boxVerts(b.x, b.y, b.z, b.sx, b.sy, b.sz, b.color, b.rotY || 0);
    pos = pos.concat(v.pos); col = col.concat(v.col);
  }
  if (!pos.length) return;
  const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STREAM_DRAW);
  gl.enableVertexAttribArray(renderer.aPos); gl.vertexAttribPointer(renderer.aPos, 3, gl.FLOAT, false, 0, 0);
  const cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STREAM_DRAW);
  gl.enableVertexAttribArray(renderer.aCol); gl.vertexAttribPointer(renderer.aCol, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(renderer.uMVP, false, new Float32Array(mvp));
  gl.uniform1f(renderer.uLight, light);
  gl.drawArrays(gl.TRIANGLES, 0, pos.length / 3);
  gl.deleteBuffer(pb); gl.deleteBuffer(cb);
}
