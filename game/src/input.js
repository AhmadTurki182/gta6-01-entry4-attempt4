// Keyboard + mouse input, no dependencies.
export function makeInput() {
  const keys = {};
  const input = {
    keys, mouseX: 0, mouseY: 0,
    get throttle() { return (keys["KeyW"] || keys["ArrowUp"] ? 1 : 0) - (keys["KeyS"] || keys["ArrowDown"] ? 1 : 0); },
    get steer() { return (keys["KeyA"] || keys["ArrowLeft"] ? -1 : 0) + (keys["KeyD"] || keys["ArrowRight"] ? 1 : 0); },
    get brake() { return !!keys["Space"]; },
    get boost() { return !!keys["ShiftLeft"] || !!keys["ShiftRight"]; },
    get crouch() { return !!keys["KeyC"]; },
    pressed(code) { const v = !!keys[code]; keys[code] = false; return v; },
  };
  window.addEventListener("keydown", (e) => { keys[e.code] = true; if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) e.preventDefault(); });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });
  window.addEventListener("mousemove", (e) => { input.mouseX = e.clientX; input.mouseY = e.clientY; });
  window.addEventListener("blur", () => { for (const k of Object.keys(keys)) keys[k] = false; });
  return input;
}
