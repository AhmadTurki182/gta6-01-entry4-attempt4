// Traffic: reactive drivers, density floor. Downtown frustum floor: 12 cars.
export const TRAFFIC_DENSITY_FLOOR = { downtownCars: 12, downtownPeds: 25, totalCars: 34 };
import { mulberry32 } from "./world_city.js";
import { makeVehicle } from "./vehicles.js";
const CLASSES = ["sedan", "sedan", "sedan", "sports", "truck", "bike"];
const COLORS = ["#c94f4f", "#3a6ad6", "#e8e8e8", "#3aa06a", "#d6a03a", "#8a5ad6", "#5a5a5a"];
export function spawnTraffic(seed, count, cx, cz) {
  const rnd = mulberry32(seed);
  const cars = [];
  for (let i = 0; i < count; i++) {
    const gx = Math.round((rnd() - 0.5) * 10) * 92 + (rnd() < 0.5 ? 0 : 0);
    const gz = Math.round((rnd() - 0.5) * 10) * 92;
    const horizontal = rnd() < 0.5;
    const lane = horizontal ? { x: gx + (rnd() - 0.5) * 60, z: gz + (rnd() < 0.5 ? -3 : 3) } : { x: gx + (rnd() < 0.5 ? -3 : 3), z: gz + (rnd() - 0.5) * 60 };
    const v = makeVehicle(CLASSES[Math.floor(rnd() * CLASSES.length)], lane.x, lane.z, horizontal ? Math.PI / 2 : 0, COLORS[Math.floor(rnd() * COLORS.length)]);
    v.speed = 8 + rnd() * 10; v.cruise = v.speed; v.panicked = false;
    cars.push(v);
  }
  // Guarantee downtown density near the player spawn.
  for (let i = 0; i < TRAFFIC_DENSITY_FLOOR.downtownCars; i++) {
    const v = makeVehicle(CLASSES[i % CLASSES.length], cx + (i - 6) * 9, cz - 18 - (i % 3) * 12, 0, COLORS[i % COLORS.length]);
    v.speed = 6 + (i % 5); v.cruise = v.speed; cars.push(v);
  }
  return cars;
}
export function updateTraffic(cars, player, wanted, dt) {
  for (const c of cars) {
    // Reactive: swerve / slow when the player or police are close; panic at high wanted.
    const dx = c.x - player.x, dz = c.z - player.z;
    const d = Math.hypot(dx, dz);
    if (d < 14) { c.panicked = true; c.speed = Math.min(c.speed + 14 * dt, c.topSpeed * 0.7); }
    else if (d > 60) c.panicked = false;
    if (wanted >= 3 && d < 40) c.speed = Math.max(2, c.speed - 6 * dt);
    else c.speed += ((c.cruise || 10) - c.speed) * Math.min(1, dt);
    c.x += Math.sin(c.heading) * c.speed * dt;
    c.z += Math.cos(c.heading) * c.speed * dt;
    if (c.x > 540) c.x = -540; if (c.x < -540) c.x = 540;
    if (c.z > 540) c.z = -540; if (c.z < -540) c.z = 540;
  }
  return cars;
}
