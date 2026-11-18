// Coral Bay config: time of day, difficulty, staging defaults.
export const CONFIG = {
  title: "CORAL BAY — Open-World Crime",
  city: "Coral Bay",
  dayLengthSeconds: 480,
  goldenHour: 0.78, // 0..1 time of day; golden hour near dusk
  startCash: 250,
  startHealth: 100,
  startArmor: 0,
  fovBase: 62, fovSpeedBonus: 8,
  targetFps: 60,
};
export function timeOfDayLabel(t) {
  if (t < 0.25) return "Night";
  if (t < 0.45) return "Dawn";
  if (t < 0.7) return "Day";
  if (t < 0.85) return "Golden Hour";
  return "Night";
}
export function skyColor(t) {
  // Golden hour: warm orange; night: deep blue; day: pale blue.
  if (t >= 0.7 && t < 0.85) return [0.98, 0.62, 0.28];
  if (t < 0.25 || t >= 0.9) return [0.05, 0.08, 0.18];
  if (t < 0.45) return [0.85, 0.55, 0.45];
  return [0.55, 0.75, 0.92];
}
