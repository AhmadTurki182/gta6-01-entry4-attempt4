// Pedestrians: walkers, runners, panickers. Downtown frustum floor: 25 peds.
export const PED_DENSITY_FLOOR = { downtownPeds: 25, totalPeds: 70 };
import { mulberry32 } from "./world_city.js";
const SHIRTS = ["#e85a5a", "#5aa0e8", "#e8d25a", "#5ae89a", "#e89ad6", "#e8e8e8", "#3a3a3a", "#ff8a3c"];
export function spawnPeds(seed, count, cx, cz) {
  const rnd = mulberry32(seed + 7);
  const peds = [];
  for (let i = 0; i < count; i++) {
    peds.push({
      x: cx + (rnd() - 0.5) * 260, z: cz + (rnd() - 0.5) * 260,
      heading: rnd() * Math.PI * 2, speed: 1 + rnd() * 1.4,
      shirt: SHIRTS[Math.floor(rnd() * SHIRTS.length)],
      panic: 0, state: "walk", bob: rnd() * 6,
    });
  }
  // Guarantee a crowded sidewalk downtown near the player.
  for (let i = 0; i < PED_DENSITY_FLOOR.downtownPeds; i++) {
    peds.push({
      x: cx - 30 + (i % 8) * 8, z: cz + 6 + Math.floor(i / 8) * 7,
      heading: (i % 2 ? 0 : Math.PI), speed: 1.2 + (i % 3) * 0.4,
      shirt: SHIRTS[i % SHIRTS.length], panic: 0, state: "walk", bob: i,
    });
  }
  return peds;
}
export function updatePeds(peds, player, wanted, dt, time) {
  for (const p of peds) {
    const dx = p.x - player.x, dz = p.z - player.z;
    const d = Math.hypot(dx, dz);
    if (wanted >= 2 && d < 26) { p.panic = 1; p.state = "flee"; }
    else if (d > 60) { p.panic = 0; p.state = "walk"; }
    if (p.state === "flee") {
      p.heading = Math.atan2(dx, dz);
      p.speed = Math.min(6.5, p.speed + 8 * dt);
    } else {
      p.speed += (1.4 - p.speed) * Math.min(1, dt);
      if (Math.random() < 0.002) p.heading += (Math.random() - 0.5) * 2;
    }
    p.x += Math.sin(p.heading) * p.speed * dt;
    p.z += Math.cos(p.heading) * p.speed * dt;
    p.x = Math.max(-540, Math.min(540, p.x));
    p.z = Math.max(-540, Math.min(540, p.z));
    p.bob += dt * p.speed * 3;
  }
  return peds;
}
