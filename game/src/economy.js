// Economy: cash, district standing, stealth payout x2 vs frontal.
export const ECONOMY = { stealthMultiplier: 2, frontalMultiplier: 1 };
export function makeEconomy() {
  return {
    cash: 250, standing: { "Harbor Lights": 10, "Palm Row": 10, "Downtown Reef": 0, "Marina Vista": 5, "Old Cannery": 5, "Sunset Strip": -5, "Lighthouse Point": 0 },
    earned: 0, spent: 0,
  };
}
export function missionPayout(econ, mission, stealth) {
  const mult = stealth && mission.stealthBonus ? ECONOMY.stealthMultiplier : ECONOMY.frontalMultiplier;
  const amount = mission.reward * mult;
  econ.cash += amount; econ.earned += amount;
  const d = mission.district;
  econ.standing[d] = Math.max(-100, Math.min(100, (econ.standing[d] || 0) + (stealth ? 8 : 5)));
  return { amount, stealth, multiplier: mult };
}
export function buyItem(econ, cost) {
  if (econ.cash < cost) return false;
  econ.cash -= cost; econ.spent += cost; return true;
}
export const SHOP = [
  { id: "armor", name: "Body Armor", cost: 300, desc: "+50 armor" },
  { id: "repair", name: "Full Repair", cost: 150, desc: "Fix your car" },
  { id: "health", name: "First Aid", cost: 100, desc: "+50 health" },
];
