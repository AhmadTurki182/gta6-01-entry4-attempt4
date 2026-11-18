// Deterministic screenshot staging: ?stage=cover|marina|showroom|bridge&seed=N&time=T&hud=1
// Fixed seed, scripted positions, camera preset, then the game pauses for the shot.
export const STAGES = {
  cover: { mission: 5, wanted: 3, time: 0.78, title: "3-star downtown pursuit, golden hour" },
  marina: { mission: 11, wanted: 0, time: 0.12, title: "On-foot stealth at the marina" },
  showroom: { mission: 6, wanted: 2, time: 0.6, title: "Showroom heist, supercar theft" },
  bridge: { mission: 12, wanted: 5, time: 0.82, title: "5-star bridge roadblock" },
};
export function parseStage(search) {
  const q = new URLSearchParams(search || "");
  const name = q.get("stage") || q.get("shot") || "";
  const base = STAGES[name] || null;
  if (!base) return null;
  return {
    name, mission: base.mission, wanted: base.wanted,
    time: q.has("time") ? parseFloat(q.get("time")) : base.time,
    seed: q.has("seed") ? parseInt(q.get("seed"), 10) : 42,
    hud: q.get("hud") !== "0",
    title: base.title,
  };
}
// Apply a stage to a live game state object (called once, before first render).
export function applyStage(state, stage) {
  state.timeOfDay = stage.time;
  state.mission = stage.mission;
  state.wanted = stage.wanted;
  state.paused = true; // freeze for the screenshot
  state.stage = stage.name;
  const P = state.player;
  if (stage.name === "cover") {
    P.x = 276; P.z = -180; P.heading = 0; P.inCar = true;
    state.vehicle.x = 276; state.vehicle.z = -180; state.vehicle.heading = 0; state.vehicle.speed = 26;
    state.police = state.police || {};
  } else if (stage.name === "marina") {
    P.x = -276; P.z = 60; P.heading = Math.PI / 2; P.inCar = false; P.crouched = true;
    state.vehicle.x = -260; state.vehicle.z = 80;
  } else if (stage.name === "showroom") {
    P.x = 276; P.z = 40; P.heading = Math.PI / 2; P.inCar = false;
    state.vehicle.x = 310; state.vehicle.z = 30; state.vehicle.cls = "supercar"; state.vehicle.color = "#ff5a3c";
  } else if (stage.name === "bridge") {
    P.x = 0; P.z = 120; P.heading = Math.PI; P.inCar = true;
    state.vehicle.x = 0; state.vehicle.z = 120; state.vehicle.heading = Math.PI; state.vehicle.speed = 20;
  }
  // Scripted input: N fixed steps of 1/60s already applied by construction; camera preset is in main.js.
  // Chase camera preset (frozen for the shot): behind the player, low, looking forward.
  // Marina gets a pulled-back elevated camera so the warehouse wall cannot swallow the frame.
  const back = stage.name === "marina" ? 16 : (P.inCar ? 13 : 9);
  state.camX = P.x - Math.sin(P.heading) * back;
  state.camZ = P.z - Math.cos(P.heading) * back;
  state.camY = stage.name === "marina" ? 10 : (P.inCar ? 6 : 5);
  return state;
}
