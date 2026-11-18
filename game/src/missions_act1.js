// Missions Act I (1-5): learn Coral Bay, earn the crew's trust.
export const MISSIONS_ACT1 = [
  { id: 1, act: 1, title: "Golden Hour Run", kind: "delivery", district: "Harbor Lights", objective: "DELIVER THE PACKAGE", wanted: 0, reward: 400, stealthBonus: false, briefing: "Juno, one package, one sunset. Drive it from the docks to Palm Row before the tide turns." },
  { id: 2, act: 1, title: "Market Shakedown", kind: "combat", district: "Palm Row", objective: "CLEAR THE MARKET", wanted: 1, reward: 650, stealthBonus: false, briefing: "The Breakers are shaking down our market stalls. Run them off — fists first, car second." },
  { id: 3, act: 1, title: "Truck Under Fire", kind: "chase", district: "Old Cannery", objective: "OUTRUN THE BIKES", wanted: 1, reward: 800, stealthBonus: false, briefing: "Dax's bikes are on the truck. Keep the cargo, lose the riders, don't stop for anything." },
  { id: 4, act: 1, title: "Silent Marina", kind: "stealth", district: "Marina Vista", objective: "STEAL THE BOAT QUIETLY", wanted: 0, reward: 1200, stealthBonus: true, briefing: "Guards sweep the marina in cones of light. Stay dark, lift the keys, wanted zero or the payout halves." },
  { id: 5, act: 1, title: "First Roadblock", kind: "escape", district: "Downtown Reef", objective: "BREAK THE ROADBLOCK", wanted: 2, reward: 1000, stealthBonus: false, briefing: "Your first real pursuit. Roadblock ahead, spike strip on the asphalt. Punch through it." },
];
export function act1ById(id) { return MISSIONS_ACT1.find((m) => m.id === id); }
