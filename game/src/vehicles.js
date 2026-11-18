// Vehicles: 6 classes, procedural stats. First declaration lists all 6 classes.
export const VEHICLE_CLASSES = [
  { id: "sedan", name: "Sedan", topSpeed: 34, accel: 16, grip: 0.92, color: "#c94f4f" },
  { id: "sports", name: "Sports", topSpeed: 52, accel: 24, grip: 0.86, color: "#e8b73a" },
  { id: "supercar", name: "Supercar", topSpeed: 62, accel: 30, grip: 0.82, color: "#ff5a3c" },
  { id: "truck", name: "Truck", topSpeed: 26, accel: 10, grip: 0.97, color: "#7a8a9a" },
  { id: "bike", name: "Bike", topSpeed: 46, accel: 26, grip: 0.7, color: "#3a9ad6" },
  { id: "boat", name: "Boat", topSpeed: 40, accel: 14, grip: 1.0, color: "#e8e8e8" },
];
export function vehicleClass(id) { return VEHICLE_CLASSES.find((v) => v.id === id) || VEHICLE_CLASSES[0]; }
export function makeVehicle(cls, x, z, heading, color) {
  const c = vehicleClass(cls);
  return {
    cls: c.id, name: c.name, x, z, heading, speed: 0, color: color || c.color,
    topSpeed: c.topSpeed, accel: c.accel, grip: c.grip,
    damage: 0, smoke: 0, steer: 0, brakeLight: false, siren: false,
  };
}
export function updateVehicle(v, input, dt) {
  // input: {throttle:-1..1, steer:-1..1, brake}
  const target = input.throttle * v.topSpeed;
  const rate = input.throttle !== 0 ? v.accel : 10;
  v.speed += Math.max(-rate * dt, Math.min(rate * dt, target - v.speed));
  if (input.brake) v.speed *= Math.max(0, 1 - 3.2 * dt);
  v.heading += v.steer * v.speed * 0.028 * dt * (v.speed >= 0 ? 1 : -1);
  v.steer += ((input.steer || 0) - v.steer) * Math.min(1, 8 * dt);
  v.x += Math.sin(v.heading) * v.speed * dt;
  v.z += Math.cos(v.heading) * v.speed * dt;
  v.x = Math.max(-540, Math.min(540, v.x));
  v.z = Math.max(-540, Math.min(540, v.z));
  v.brakeLight = !!input.brake;
  if (v.damage > 55) v.smoke = Math.min(1, v.smoke + dt);
  return v;
}
export function collideVehicle(v, buildings) {
  for (const b of buildings) {
    if (Math.abs(v.x - b.x) < b.w / 2 + 1.6 && Math.abs(v.z - b.z) < b.d / 2 + 1.6) {
      v.speed *= -0.25;
      v.damage = Math.min(100, v.damage + 4);
      v.x -= Math.sin(v.heading) * 2; v.z -= Math.cos(v.heading) * 2;
      return true;
    }
  }
  return false;
}
