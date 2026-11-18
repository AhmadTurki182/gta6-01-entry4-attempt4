// Coral Bay city: 7 districts, seeded procedural layout, golden-hour coast.
export const DISTRICTS = [
  { id: 0, name: "Harbor Lights", x: -260, z: -260, w: 220, d: 220, color: "#2e6f8e", desc: "Docks and cranes" },
  { id: 1, name: "Palm Row", x: -20, z: -260, w: 220, d: 220, color: "#c98a3d", desc: "Beachfront market" },
  { id: 2, name: "Downtown Reef", x: 220, z: -260, w: 240, d: 220, color: "#5a6fd6", desc: "Glass towers" },
  { id: 3, name: "Marina Vista", x: -300, z: -20, w: 260, d: 220, color: "#3da08a", desc: "Yachts and piers" },
  { id: 4, name: "Old Cannery", x: -20, z: -20, w: 220, d: 220, color: "#8a6a4d", desc: "Warehouses" },
  { id: 5, name: "Sunset Strip", x: 220, z: -20, w: 240, d: 220, color: "#d65a7a", desc: "Casinos and clubs" },
  { id: 6, name: "Lighthouse Point", x: -20, z: 220, w: 460, d: 220, color: "#e8c85a", desc: "Cliffs and lighthouse" },
];
export const CITY = { size: 560, roadGap: 92, block: 64, seaLevel: -300 };
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Deterministic building list: {x,z,w,d,h,color,district}
export function buildCity(seed = 1337) {
  const rnd = mulberry32(seed);
  const buildings = [];
  const palette = ["#7a8ba0", "#a08a6a", "#6a7a8a", "#b09a7a", "#5a7a9a", "#9a8a5a", "#8a6a7a", "#4a6a8a"];
  for (let gx = -6; gx <= 5; gx++) {
    for (let gz = -6; gz <= 5; gz++) {
      // Buildings sit at block CENTERS (46 off the road grid) so roads stay clear.
      const cx = gx * CITY.roadGap + 46, cz = gz * CITY.roadGap + 46;
      if (Math.abs(cx) > 500 || Math.abs(cz) > 500) continue;
      if (rnd() < 0.18) continue; // plaza / park gap
      const n = 1 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i++) {
        const ox = (rnd() - 0.5) * 44, oz = (rnd() - 0.5) * 44;
        const downtown = Math.abs(cx) < 260 && Math.abs(cz) < 260;
        const h = downtown ? 26 + rnd() * 70 : 8 + rnd() * 26;
        buildings.push({
          x: cx + ox, z: cz + oz, w: 16 + rnd() * 16, d: 16 + rnd() * 16, h,
          color: palette[Math.floor(rnd() * palette.length)],
          district: districtAt(cx + ox, cz + oz).name,
        });
      }
    }
  }
  return buildings;
}
export function districtAt(x, z) {
  for (const d of DISTRICTS) {
    if (x >= d.x && x < d.x + d.w && z >= d.z && z < d.z + d.d) return d;
  }
  return DISTRICTS[2];
}
export function roadAt(x, z) {
  // Roads run on the grid lines every roadGap; near a line => on road.
  const rx = Math.abs(((x % CITY.roadGap) + CITY.roadGap) % CITY.roadGap - CITY.roadGap / 2);
  const rz = Math.abs(((z % CITY.roadGap) + CITY.roadGap) % CITY.roadGap - CITY.roadGap / 2);
  const nearX = Math.min(Math.abs((x % CITY.roadGap + CITY.roadGap) % CITY.roadGap), Math.abs((x % CITY.roadGap + CITY.roadGap) % CITY.roadGap - CITY.roadGap));
  const nearZ = Math.min(Math.abs((z % CITY.roadGap + CITY.roadGap) % CITY.roadGap), Math.abs((z % CITY.roadGap + CITY.roadGap) % CITY.roadGap - CITY.roadGap));
  return nearX < 9 || nearZ < 9;
}
export const PALMS = (() => {
  const rnd = mulberry32(99);
  const out = [];
  for (let i = 0; i < 160; i++) out.push({ x: (rnd() - 0.5) * 1000, z: (rnd() - 0.5) * 1000, h: 7 + rnd() * 4 });
  return out;
})();
