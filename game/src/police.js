// Police: 5 wanted levels, pursuit, PIT, roadblocks, spikes, heli, SEARCH mode.
export const WANTED_LEVELS = [
  { stars: 0, label: "Clean", units: 0, heli: false, roadblock: false },
  { stars: 1, label: "Suspicion", units: 1, heli: false, roadblock: false },
  { stars: 2, label: "Pursuit", units: 2, heli: false, roadblock: true },
  { stars: 3, label: "Roadblock", units: 3, heli: false, roadblock: true, spikes: true },
  { stars: 4, label: "Air Support", units: 4, heli: true, roadblock: true, spikes: true },
  { stars: 5, label: "Maximum", units: 5, heli: true, roadblock: true, spikes: true },
];
export const POLICE_FLOOR = { unitsAt3StarsWithinSeconds: 4, units: 2, heliAt4Stars: true, roadblockAt3Stars: true };
export function wantedDef(stars) { return WANTED_LEVELS[Math.max(0, Math.min(5, stars))]; }
export function makePoliceUnit(x, z) {
  return { x, z, heading: 0, speed: 0, topSpeed: 48, siren: true, color: "#1a2a4a", lightPhase: 0, pitCooldown: 0 };
}
export function spawnPolice(stars, px, pz) {
  const def = wantedDef(stars);
  const units = [];
  for (let i = 0; i < def.units; i++) {
    const a = (i / Math.max(1, def.units)) * Math.PI * 2;
    units.push(makePoliceUnit(px + Math.sin(a) * 34, pz + Math.cos(a) * 34));
  }
  return {
    units, heli: def.heli ? { x: px + 20, z: pz - 30, y: 55, heading: 0, searchlight: true } : null,
    roadblock: def.roadblock ? { x: px, z: pz + 70, spikes: !!def.spikes } : null,
    mode: stars > 0 ? "PURSUE" : "PATROL", searchTimer: 0, spawnTimer: 0,
  };
}
export function updatePolice(state, player, stars, dt) {
  const def = wantedDef(stars);
  state.mode = stars === 0 ? "PATROL" : (state.searchTimer > 0 ? "SEARCH" : "PURSUE");
  // Reinforce fast: 2 units within 4s at 3 stars.
  if (state.units.length < def.units) {
    state.spawnTimer += dt;
    if (state.spawnTimer >= 1.2) { state.spawnTimer = 0; state.units.push(makePoliceUnit(player.x + 40, player.z + 40)); }
  }
  if (def.heli && !state.heli) state.heli = { x: player.x + 20, z: player.z - 30, y: 55, heading: 0, searchlight: true };
  if (!def.heli) state.heli = null;
  if (def.roadblock && !state.roadblock) state.roadblock = { x: player.x, z: player.z + 70, spikes: !!def.spikes };
  if (!def.roadblock) state.roadblock = null;
  for (const u of state.units) {
    const dx = player.x - u.x, dz = player.z - u.z, d = Math.hypot(dx, dz) || 1;
    const want = Math.atan2(dx, dz);
    let dh = want - u.heading;
    while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2;
    u.heading += Math.max(-2.4 * dt, Math.min(2.4 * dt, dh));
    const target = d < 6 ? 12 : 44;
    u.speed += (target - u.speed) * Math.min(1, 1.6 * dt);
    u.x += Math.sin(u.heading) * u.speed * dt;
    u.z += Math.cos(u.heading) * u.speed * dt;
    u.lightPhase += dt * 8;
    // PIT: ram the player's rear quarter when alongside.
    u.pitCooldown -= dt;
    if (d < 5 && u.pitCooldown <= 0) { u.pitCooldown = 4; player.pitHit = true; }
  }
  if (state.heli) {
    state.heli.heading += dt * 0.4;
    state.heli.x += (player.x + 14 - state.heli.x) * Math.min(1, dt);
    state.heli.z += (player.z - 18 - state.heli.z) * Math.min(1, dt);
  }
  if (state.roadblock) {
    state.roadblock.x += (player.x - state.roadblock.x) * Math.min(1, 0.2 * dt);
    state.roadblock.z += (player.z + 70 - state.roadblock.z) * Math.min(1, 0.2 * dt);
  }
  return state;
}
export function spikeHit(roadblock, player) {
  if (!roadblock || !roadblock.spikes) return false;
  return Math.hypot(player.x - roadblock.x, player.z - (roadblock.z + 6)) < 6;
}
