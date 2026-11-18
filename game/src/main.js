// CORAL BAY — open-world crime. Raw WebGL, procedural everything, no external assets.
import { STORY, missionById } from "./story.js";
import { DISTRICTS, CITY, buildCity, districtAt, PALMS } from "./world_city.js";
import { VEHICLE_CLASSES, makeVehicle, updateVehicle, collideVehicle } from "./vehicles.js";
import { spawnTraffic, updateTraffic, TRAFFIC_DENSITY_FLOOR } from "./traffic.js";
import { spawnPeds, updatePeds, PED_DENSITY_FLOOR } from "./peds.js";
import { WANTED_LEVELS, wantedDef, spawnPolice, updatePolice, spikeHit } from "./police.js";
import { MISSIONS_ACT1 } from "./missions_act1.js";
import { MISSIONS_ACT2 } from "./missions_act2.js";
import { MISSIONS_ACT3 } from "./missions_act3.js";
import { makeEconomy, missionPayout, SHOP, buyItem } from "./economy.js";
import { Radio, RADIO_STATIONS } from "./radio.js";
import { saveGame, loadGame, hasSave } from "./save.js";
import { drawMinimap, starsHTML, HUD_CLUSTERS } from "./hud_minimap.js";
import { createGL, mat4Perspective, mat4LookAt, mat4Mul, drawBoxes } from "./render.js";
import { makeInput } from "./input.js";
import { CONFIG, timeOfDayLabel, skyColor } from "./config.js";
import { parseStage, applyStage } from "./stage.js";

const ALL_MISSIONS = [...MISSIONS_ACT1, ...MISSIONS_ACT2, ...MISSIONS_ACT3];
const canvas = document.getElementById("game");
const renderer = createGL(canvas);
const input = makeInput();
const radio = new Radio();
const buildings = buildCity(1337);
const stage = parseStage(location.search);

const state = {
  screen: stage ? "play" : "title",
  paused: false, stage: stage ? stage.name : null,
  mission: 1, completed: [], timeOfDay: 0.78, time: 0,
  wanted: 0, wantedTimer: 0, stealthSeen: false,
  econ: makeEconomy(), radio,
  player: { x: 0, z: -40, heading: 0, speed: 0, health: 100, armor: 0, inCar: true, crouched: false, onFootSpeed: 7 },
  vehicle: makeVehicle("sports", 0, -40, 0),
  traffic: [], peds: [], police: spawnPolice(0, 0, -40),
  target: { x: 0, z: -260, label: "Harbor Lights" },
  enemies: [], guards: [], message: "", messageTimer: 0,
  camX: 0, camZ: -60, camY: 14, fov: CONFIG.fovBase,
  sparks: [], smokePuffs: [], fps: 60, frames: 0, fpsTimer: 0,
  autosaved: false, startedAt: Date.now(),
};
state.traffic = spawnTraffic(42, TRAFFIC_DENSITY_FLOOR.totalCars, 0, -40);
state.peds = spawnPeds(43, PED_DENSITY_FLOOR.totalPeds, 0, -40);
window.__coralBay = state; // playtest hook: headless checks read this

function mission() { return ALL_MISSIONS.find((m) => m.id === state.mission) || ALL_MISSIONS[0]; }
function missionTarget(m) {
  const spots = { 1: [0, -260], 2: [40, -200], 3: [-60, 60], 4: [-240, 40], 5: [200, -200], 6: [300, 40], 7: [200, -240], 8: [-240, -240], 9: [0, 320], 10: [40, -200], 11: [-260, 60], 12: [0, 180], 13: [60, -180], 14: [320, 60], 15: [0, 340] };
  const s = spots[m.id] || [0, 0];
  return { x: s[0], z: s[1], label: m.district };
}
function setMission(id) {
  state.mission = id;
  const m = mission();
  state.target = missionTarget(m);
  state.wanted = m.wanted; state.stealthSeen = false;
  state.police = spawnPolice(state.wanted, state.player.x, state.player.z);
  state.enemies = spawnEnemies(m);
  state.guards = spawnGuards(m);
  showMessage(m.title + " — " + m.objective);
  saveGame(state);
}
function spawnEnemies(m) {
  const out = [];
  if (["combat", "defense"].includes(m.kind)) {
    for (let i = 0; i < 5; i++) out.push({ x: state.target.x + (i - 2) * 8, z: state.target.z + (i % 2) * 10, health: 50, kind: "rival", alive: true });
  }
  if (m.kind === "chase" && m.id === 3) {
    for (let i = 0; i < 3; i++) out.push({ x: state.player.x + 10 + i * 6, z: state.player.z - 20, health: 40, kind: "biker", alive: true });
  }
  return out;
}
function spawnGuards(m) {
  const out = [];
  if (["stealth", "heist"].includes(m.kind)) {
    for (let i = 0; i < 4; i++) out.push({ x: state.target.x - 20 + i * 14, z: state.target.z + 12, heading: (i % 2 ? 0 : Math.PI), cone: 0.6, alive: true, alert: 0 });
  }
  return out;
}
function showMessage(t) { state.message = t; state.messageTimer = 4; document.getElementById("toast").textContent = t; }
function completeMission(stealth) {
  const m = mission();
  const pay = missionPayout(state.econ, m, stealth);
  state.completed.push(m.id);
  showMessage("MISSION COMPLETE — $" + pay.amount + (stealth ? " (STEALTH x2)" : ""));
  state.wanted = 0; state.police = spawnPolice(0, state.player.x, state.player.z);
  saveGame(state); state.autosaved = true;
  const next = m.id + 1;
  if (next <= 15) setMission(next);
  else { state.screen = "won"; document.getElementById("endScreen").style.display = "flex"; }
}
function addWanted(n) {
  state.wanted = Math.max(0, Math.min(5, state.wanted + n));
  state.police = spawnPolice(state.wanted, state.player.x, state.player.z);
}
function stealCar() {
  // E near a traffic car: take it (crime, +1 wanted if police near).
  let best = null, bd = 9;
  for (const c of state.traffic) { const d = Math.hypot(c.x - state.player.x, c.z - state.player.z); if (d < bd) { bd = d; best = c; } }
  if (!best) return;
  state.vehicle = makeVehicle(best.cls, best.x, best.z, best.heading, best.color);
  state.player.inCar = true; state.traffic.splice(state.traffic.indexOf(best), 1);
  addWanted(1); showMessage("Car stolen — wanted up");
}

// ---- HUD ----
const hud = {
  minimap: document.getElementById("minimap"),
  wanted: document.getElementById("wanted"),
  health: document.getElementById("healthBar"), armor: document.getElementById("armorBar"),
  objective: document.getElementById("objective"), district: document.getElementById("district"),
  speed: document.getElementById("speed"), vehicle: document.getElementById("vehicleName"),
  radio: document.getElementById("radioName"), cash: document.getElementById("cash"),
  clock: document.getElementById("clock"), missionTitle: document.getElementById("missionTitle"),
};
function updateHUD() {
  const m = mission();
  drawMinimap(hud.minimap, state);
  hud.wanted.innerHTML = starsHTML(state.wanted);
  hud.health.style.width = Math.max(0, state.player.health) + "%";
  hud.armor.style.width = Math.max(0, state.player.armor) + "%";
  hud.objective.textContent = m.objective;
  hud.district.textContent = districtAt(state.player.x, state.player.z).name + " — Coral Bay";
  hud.missionTitle.textContent = "M" + m.id + " · " + m.title;
  const kmh = Math.round(Math.abs(state.player.inCar ? state.vehicle.speed : state.player.speed) * 3.6);
  hud.speed.textContent = kmh + " km/h";
  hud.vehicle.textContent = state.player.inCar ? state.vehicle.name : "On foot" + (state.player.crouched ? " · Crouched" : "");
  hud.radio.textContent = radio.current().name + " · " + radio.current().genre;
  hud.cash.textContent = "$" + Math.floor(state.econ.cash);
  hud.clock.textContent = timeOfDayLabel(state.timeOfDay) + " · " + Math.round(state.timeOfDay * 24) + ":00";
  document.getElementById("toast").style.opacity = state.messageTimer > 0 ? "1" : "0";
}

// ---- Update ----
function update(dt) {
  state.time += dt;
  state.timeOfDay = (state.timeOfDay + dt / CONFIG.dayLengthSeconds) % 1;
  state.messageTimer -= dt;
  const P = state.player;
  // Radio switch
  if (input.pressed("KeyR")) { radio.next(); radio.start(); }
  if (input.pressed("KeyM")) { radio.muted = !radio.muted; }
  // Enter / exit car
  if (input.pressed("KeyE")) {
    if (P.inCar) { P.inCar = false; P.x = state.vehicle.x + 3; P.z = state.vehicle.z + 3; }
    else stealCar();
  }
  if (P.inCar) {
    const inp = { throttle: input.throttle * (input.boost ? 1.35 : 1), steer: input.steer, brake: input.brake };
    updateVehicle(state.vehicle, inp, dt);
    if (collideVehicle(state.vehicle, buildings)) { state.sparks.push({ x: state.vehicle.x, z: state.vehicle.z, t: 0.4 }); addWanted(0); }
    P.x = state.vehicle.x; P.z = state.vehicle.z; P.heading = state.vehicle.heading; P.speed = state.vehicle.speed;
    if (spikeHit(state.police.roadblock, P)) { state.vehicle.speed *= 0.3; state.vehicle.damage = Math.min(100, state.vehicle.damage + 20); showMessage("Spike strip! Tires shredded"); }
  } else {
    P.crouched = input.crouch;
    const sp = P.crouched ? 3 : P.onFootSpeed;
    const fwd = (input.keys["KeyW"] || input.keys["ArrowUp"] ? 1 : 0) - (input.keys["KeyS"] || input.keys["ArrowDown"] ? 1 : 0);
    const strafe = (input.keys["KeyD"] || input.keys["ArrowRight"] ? 1 : 0) - (input.keys["KeyA"] || input.keys["ArrowLeft"] ? 1 : 0);
    P.heading += strafe * 2.2 * dt;
    P.speed = fwd * sp;
    P.x += Math.sin(P.heading) * P.speed * dt;
    P.z += Math.cos(P.heading) * P.speed * dt;
    P.x = Math.max(-540, Math.min(540, P.x)); P.z = Math.max(-540, Math.min(540, P.z));
    // Punch: F attacks nearest enemy/guard.
    if (input.pressed("KeyF")) {
      for (const e of [...state.enemies, ...state.guards]) {
        if (e.alive && Math.hypot(e.x - P.x, e.z - P.z) < 4) { e.health -= 34; if (e.health <= 0) e.alive = false; addWanted(1); break; }
      }
    }
  }
  // Enemies chase / attack
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x - P.x, e.z - P.z);
    if (d < 30) {
      const h = Math.atan2(P.x - e.x, P.z - e.z);
      e.x += Math.sin(h) * 4 * dt; e.z += Math.cos(h) * 4 * dt;
      if (d < 3) { P.health -= 12 * dt; if (P.health <= 0) { P.health = 100; state.wanted = 0; showMessage("Busted — Juno dusts herself off"); } }
    }
  }
  // Guards: vision cones; seen => alert + wanted.
  for (const g of state.guards) {
    if (!g.alive) continue;
    g.heading += Math.sin(state.time * 0.5 + g.x) * 0.4 * dt;
    const dx = P.x - g.x, dz = P.z - g.z, d = Math.hypot(dx, dz);
    const ang = Math.abs(Math.atan2(dx, dz) - g.heading);
    if (d < 22 && ang < g.cone && !P.crouched) { g.alert = 1; state.stealthSeen = true; addWanted(1); }
  }
  // Wanted decay when far from police
  if (state.wanted > 0) {
    state.wantedTimer += dt;
    const near = state.police.units.some((u) => Math.hypot(u.x - P.x, u.z - P.z) < 25);
    if (!near && state.wantedTimer > 12) { state.wanted--; state.wantedTimer = 0; state.police = spawnPolice(state.wanted, P.x, P.z); }
  }
  updateTraffic(state.traffic, P, state.wanted, dt);
  updatePeds(state.peds, P, state.wanted, dt, state.time);
  updatePolice(state.police, P, state.wanted, dt);
  // Mission target reached?
  const t = state.target;
  const td = Math.hypot(P.x - t.x, P.z - t.z);
  const m = mission();
  const combatDone = (m.kind === "combat" || m.kind === "defense") ? state.enemies.every((e) => !e.alive) : true;
  if (td < 14 && combatDone) completeMission(m.stealthBonus && !state.stealthSeen && state.wanted === 0);
  // Autosave every 30s
  if (Math.floor(state.time) % 30 === 0 && !state.autosaved) { saveGame(state); state.autosaved = true; }
  if (Math.floor(state.time) % 30 === 1) state.autosaved = false;
  // Camera lag + speed FOV
  const back = P.inCar ? 13 : 9;
  const tx = P.x - Math.sin(P.heading) * back, tz = P.z - Math.cos(P.heading) * back;
  state.camX += (tx - state.camX) * Math.min(1, 4 * dt);
  state.camZ += (tz - state.camZ) * Math.min(1, 4 * dt);
  state.camY += ((P.inCar ? 6 : 5) - state.camY) * Math.min(1, 4 * dt);
  const speedKmh = Math.abs(P.inCar ? state.vehicle.speed : P.speed);
  state.fov += ((CONFIG.fovBase + Math.min(CONFIG.fovSpeedBonus, speedKmh * 0.14)) - state.fov) * Math.min(1, 3 * dt);
  state.sparks = state.sparks.filter((s) => (s.t -= dt) > 0);
}

// ---- Render ----
function render() {
  const gl = renderer.gl;
  const W = canvas.width = canvas.clientWidth, H = canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, W, H);
  const sky = skyColor(state.timeOfDay);
  gl.clearColor(sky[0], sky[1], sky[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const P = state.player;
  const aspect = W / H;
  const proj = mat4Perspective(state.fov * Math.PI / 180, aspect, 0.5, 2000);
  const view = mat4LookAt([state.camX, state.camY, state.camZ], [P.x, 1.5, P.z], [0, 1, 0]);
  const mvp = mat4Mul(proj, view);
  const light = state.timeOfDay >= 0.7 && state.timeOfDay < 0.85 ? 1.0 : state.timeOfDay < 0.25 || state.timeOfDay >= 0.9 ? 0.45 : 0.9;
  const boxes = [];
  // Ground + sea + roads
  boxes.push({ x: 0, y: -0.6, z: 0, sx: 1120, sy: 1, sz: 1120, color: "#3a5a3a" });
  boxes.push({ x: 0, y: -0.4, z: -420, sx: 1120, sy: 0.8, sz: 260, color: "#1a5a8a" });
  for (let g = -5; g <= 5; g++) {
    boxes.push({ x: g * 92, y: -0.3, z: 0, sx: 14, sy: 0.6, sz: 1120, color: "#2a2a30" });
    boxes.push({ x: 0, y: -0.3, z: g * 92, sx: 1120, sy: 0.6, sz: 14, color: "#2a2a30" });
  }
  // Buildings
  for (const b of buildings) boxes.push({ x: b.x, y: b.h / 2, z: b.z, sx: b.w, sy: b.h, sz: b.d, color: b.color });
  // Palms
  for (const p of PALMS.slice(0, 80)) {
    boxes.push({ x: p.x, y: p.h / 2, z: p.z, sx: 0.7, sy: p.h, sz: 0.7, color: "#6a4a2a" });
    boxes.push({ x: p.x, y: p.h + 1, z: p.z, sx: 5, sy: 1.6, sz: 5, color: "#2a8a4a" });
  }
  // Mission target beacon
  const t = state.target;
  boxes.push({ x: t.x, y: 3, z: t.z, sx: 2, sy: 6, sz: 2, color: "#ffde59" });
  boxes.push({ x: t.x, y: 0.4, z: t.z, sx: 10, sy: 0.8, sz: 10, color: "#ffde59" });
  // Player vehicle / on-foot
  if (P.inCar) {
    const v = state.vehicle;
    const roll = Math.sin(state.time * 2) * 0.02 + v.steer * 0.08;
    boxes.push({ x: v.x, y: 0.9, z: v.z, sx: 2.2, sy: 0.9, sz: 4.6, color: v.color, rotY: v.heading });
    boxes.push({ x: v.x, y: 1.7, z: v.z - 0.3, sx: 1.9, sy: 0.8, sz: 2.4, color: "#222a33", rotY: v.heading });
    if (v.damage > 55) boxes.push({ x: v.x, y: 2.5, z: v.z, sx: 1.5, sy: 1.5, sz: 1.5, color: "#888888" });
    if (v.brakeLight) boxes.push({ x: v.x, y: 0.9, z: v.z + 2.3, sx: 2, sy: 0.3, sz: 0.2, color: "#ff2020", rotY: v.heading });
  } else {
    const crouch = P.crouched ? 0.7 : 1;
    boxes.push({ x: P.x, y: 0.9 * crouch, z: P.z, sx: 0.9, sy: 1.8 * crouch, sz: 0.9, color: "#e85a3c", rotY: P.heading });
    boxes.push({ x: P.x, y: (1.8 + 0.35) * crouch, z: P.z, sx: 0.6, sy: 0.7, sz: 0.6, color: "#f0c8a0", rotY: P.heading });
  }
  // Traffic
  for (const c of state.traffic) {
    boxes.push({ x: c.x, y: 0.9, z: c.z, sx: 2.1, sy: 0.9, sz: 4.4, color: c.color, rotY: c.heading });
    boxes.push({ x: c.x, y: 1.65, z: c.z - 0.2, sx: 1.8, sy: 0.7, sz: 2.2, color: "#222a33", rotY: c.heading });
  }
  // Peds
  for (const p of state.peds) {
    const bob = Math.sin(p.bob) * 0.08;
    boxes.push({ x: p.x, y: 0.8 + bob, z: p.z, sx: 0.7, sy: 1.6, sz: 0.7, color: p.shirt, rotY: p.heading });
    boxes.push({ x: p.x, y: 1.9 + bob, z: p.z, sx: 0.5, sy: 0.5, sz: 0.5, color: "#f0c8a0", rotY: p.heading });
  }
  // Police
  for (const u of state.police.units) {
    boxes.push({ x: u.x, y: 0.9, z: u.z, sx: 2.2, sy: 0.9, sz: 4.6, color: "#1a2a4a", rotY: u.heading });
    boxes.push({ x: u.x, y: 1.7, z: u.z, sx: 1.9, sy: 0.7, sz: 2, color: "#e8e8e8", rotY: u.heading });
    const flash = Math.sin(u.lightPhase) > 0 ? "#ff2020" : "#2040ff";
    boxes.push({ x: u.x, y: 2.3, z: u.z, sx: 1.2, sy: 0.4, sz: 0.6, color: flash, rotY: u.heading });
  }
  // Helicopter + searchlight cone (flat beam box)
  if (state.police.heli) {
    const h = state.police.heli;
    boxes.push({ x: h.x, y: h.y, z: h.z, sx: 3, sy: 1.6, sz: 6, color: "#223344" });
    boxes.push({ x: h.x, y: h.y + 1.2, z: h.z, sx: 7, sy: 0.2, sz: 0.6, color: "#888888", rotY: h.heading });
    boxes.push({ x: h.x, y: h.y / 2, z: h.z, sx: 3, sy: h.y, sz: 3, color: "#ffee88" });
  }
  // Roadblock + spikes
  if (state.police.roadblock) {
    const rb = state.police.roadblock;
    boxes.push({ x: rb.x - 4, y: 0.8, z: rb.z, sx: 3, sy: 1.6, sz: 1, color: "#ff5a3c" });
    boxes.push({ x: rb.x + 4, y: 0.8, z: rb.z, sx: 3, sy: 1.6, sz: 1, color: "#ff5a3c" });
    boxes.push({ x: rb.x, y: 0.7, z: rb.z, sx: 11, sy: 1.4, sz: 1, color: "#e8e8e8" });
    if (rb.spikes) boxes.push({ x: rb.x, y: 0.3, z: rb.z + 6, sx: 12, sy: 0.6, sz: 1.5, color: "#333333" });
  }
  // Enemies / guards + vision cones
  for (const e of state.enemies) if (e.alive) {
    boxes.push({ x: e.x, y: 0.9, z: e.z, sx: 0.9, sy: 1.8, sz: 0.9, color: "#8a2a2a" });
    boxes.push({ x: e.x, y: 1.95, z: e.z, sx: 0.55, sy: 0.55, sz: 0.55, color: "#f0c8a0" });
  }
  for (const g of state.guards) if (g.alive) {
    boxes.push({ x: g.x, y: 0.9, z: g.z, sx: 0.9, sy: 1.8, sz: 0.9, color: "#2a4a2a" });
    const cx = g.x + Math.sin(g.heading) * 8, cz = g.z + Math.cos(g.heading) * 8;
    boxes.push({ x: cx, y: 0.25, z: cz, sx: 7, sy: 0.4, sz: 14, color: g.alert ? "#ff3c3c" : "#ffee55", rotY: g.heading });
  }
  // Stage props: marina containers + yacht, showroom glass + crew, bridge fire
  if (state.stage === "marina" || state.mission === 11) {
    boxes.push({ x: -250, y: 2, z: 30, sx: 8, sy: 4, sz: 4, color: "#c94f4f" });
    boxes.push({ x: -250, y: 2, z: 38, sx: 8, sy: 4, sz: 4, color: "#3a6ad6" });
    boxes.push({ x: -258, y: 1.5, z: 72, sx: 22, sy: 3, sz: 6, color: "#e8e8e8" });
  }
  if (state.stage === "showroom" || state.mission === 6) {
    boxes.push({ x: 310, y: 3, z: 20, sx: 24, sy: 6, sz: 14, color: "#a0c8e8" });
    boxes.push({ x: 296, y: 0.9, z: 36, sx: 2.2, sy: 0.9, sz: 4.6, color: "#ff5a3c" });
    boxes.push({ x: 296, y: 1.65, z: 36, sx: 1.8, sy: 0.7, sz: 2.2, color: "#222a33" });
    boxes.push({ x: 292, y: 0.9, z: 30, sx: 0.9, sy: 1.8, sz: 0.9, color: "#3aa06a" });
    boxes.push({ x: 302, y: 0.9, z: 44, sx: 0.9, sy: 1.8, sz: 0.9, color: "#e8b73a" });
  }
  if (state.stage === "bridge" || state.mission === 12) {
    boxes.push({ x: 0, y: 1, z: 200, sx: 30, sy: 2, sz: 1.5, color: "#ff7a2a" });
    boxes.push({ x: -8, y: 1, z: 196, sx: 3, sy: 2, sz: 3, color: "#ff3c3c" });
  }
  // Sparks
  for (const s of state.sparks) boxes.push({ x: s.x, y: 1, z: s.z, sx: 1, sy: 1, sz: 1, color: "#ffee55" });
  drawBoxes(renderer, boxes, mvp, light);
}

// ---- Screens / boot ----
const startScreen = document.getElementById("startScreen");
const saved = loadGame();
if (saved) document.getElementById("continueBtn").style.display = "inline-block";
document.getElementById("startBtn").addEventListener("click", () => { startGame(1); });
document.getElementById("continueBtn").addEventListener("click", () => {
  const s = loadGame(); if (!s) return;
  state.mission = s.mission; state.econ.cash = s.cash; state.econ.standing = s.standing;
  state.completed = s.completed || []; state.timeOfDay = s.timeOfDay || 0.78;
  state.player.x = s.x; state.player.z = s.z;
  startGame(s.mission);
});
document.getElementById("restartBtn").addEventListener("click", () => location.reload());
function startGame(missionId) {
  startScreen.style.display = "none";
  document.getElementById("hud").style.display = "block";
  state.screen = "play";
  radio.start();
  setMission(missionId);
  if (stage) applyStage(state, stage);
}
if (stage) {
  // Deterministic staged shot: skip title, freeze after setup.
  startScreen.style.display = "none";
  document.getElementById("hud").style.display = "block";
  state.screen = "play";
  setMission(stage.mission);
  applyStage(state, stage);
  // Guarantee cover density: extra traffic + peds + police already spawned by setMission.
  if (stage.name === "cover") {
    state.wanted = 3; state.police = spawnPolice(3, state.player.x, state.player.z);
    // Two police visible ahead in the chase, one behind; heli + searchlight for the cover.
    state.police.units[0].x = state.player.x - 9; state.police.units[0].z = state.player.z + 34; state.police.units[0].heading = 0;
    state.police.units[1].x = state.player.x + 9; state.police.units[1].z = state.player.z + 48; state.police.units[1].heading = 0;
    state.police.units[2].x = state.player.x; state.police.units[2].z = state.player.z - 26; state.police.units[2].heading = 0;
    state.police.heli = { x: state.player.x + 16, z: state.player.z + 30, y: 48, heading: 0, searchlight: true };
    for (let i = 0; i < 6; i++) state.traffic.push(makeVehicle("sedan", state.player.x - 30 + i * 12, state.player.z + 26 + (i % 2) * 12, 0, "#3a6ad6"));
    state.peds = state.peds.concat(spawnPeds(99, 12, state.player.x, state.player.z));
  }
  if (stage.name === "bridge") { state.wanted = 5; state.police = spawnPolice(5, state.player.x, state.player.z); state.police.roadblock = { x: 0, z: state.player.z - 60, spikes: true }; state.police.heli = { x: 18, z: state.player.z - 40, y: 48, heading: 0, searchlight: true }; }
  if (stage.name === "showroom") { state.wanted = 2; state.police = spawnPolice(2, state.player.x, state.player.z); state.target = { x: 300, z: 54, label: "Sunset Strip" }; state.player.x = 288; state.player.z = 40; state.player.heading = Math.PI / 2; }
  updateHUD(); render();
  document.title = "CORAL BAY — " + stage.title;
} else {
  setMission(1);
  const selftest = new URLSearchParams(location.search).has("selftest");
  if (selftest) startGame(1);
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    state.frames++; state.fpsTimer += dt;
    if (state.fpsTimer >= 1) { state.fps = state.frames / state.fpsTimer; state.frames = 0; state.fpsTimer = 0; }
    if (selftest && state.screen === "play") {
      // Scripted end-to-end playthrough: clear hostiles, drive onto each target.
      for (const e of state.enemies) e.alive = false;
      for (const g of state.guards) g.alive = false;
      state.player.x = state.target.x; state.player.z = state.target.z;
      if (state.player.inCar) { state.vehicle.x = state.target.x; state.vehicle.z = state.target.z; }
    }
    if (state.screen === "play" && !state.paused) update(dt);
    if (selftest && state.screen === "won" && !window.__selftest) {
      document.title = "SELFTEST PASS completed=" + state.completed.length + " cash=" + Math.floor(state.econ.cash) + " save=" + (hasSave() ? "yes" : "no");
      window.__selftest = document.title;
    }
    if (state.screen !== "title") { render(); updateHUD(); }
  }
  requestAnimationFrame(loop);
}
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyP") { state.paused = !state.paused; showMessage(state.paused ? "Paused" : "Resumed"); }
  if (e.code === "Escape" && state.screen === "play") { state.paused = !state.paused; }
});
window.addEventListener("error", (e) => { window.__coralBayError = String(e.message); });
