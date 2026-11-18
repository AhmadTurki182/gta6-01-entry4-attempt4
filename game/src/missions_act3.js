// Missions Act III (11-15): take the ledger, the bank, the vault — then run.
export const MISSIONS_ACT3 = [
  { id: 11, act: 3, title: "Ledger On The Yacht", kind: "heist", district: "Marina Vista", objective: "INFILTRATE YACHT", wanted: 0, reward: 4000, stealthBonus: true, briefing: "Kessler's ledger sleeps on his yacht. Board quiet, photograph the books, slip back into the water." },
  { id: 12, act: 3, title: "Bridge On Fire", kind: "escape", district: "Downtown Reef", objective: "ESCAPE TO THE DOCKS", wanted: 4, reward: 3500, stealthBonus: false, briefing: "The bridge is blocked, the sky is burning, four stars and a helicopter. Get to the docks alive." },
  { id: 13, act: 3, title: "Shoreline Bank Job", kind: "heist", district: "Palm Row", objective: "ROB THE BANK", wanted: 5, reward: 6000, stealthBonus: false, briefing: "The shoreline bank, five stars, no way back. In fast, out faster — the whole bay will be chasing you." },
  { id: 14, act: 3, title: "Kessler's Vault", kind: "heist", district: "Sunset Strip", objective: "CRACK THE VAULT", wanted: 4, reward: 8000, stealthBonus: true, briefing: "The casino vault, three phases: the floor, the cage, the vault door. Kessler is watching every camera." },
  { id: 15, act: 3, title: "Dawn At The Lighthouse", kind: "finale", district: "Lighthouse Point", objective: "REACH THE BOAT", wanted: 5, reward: 10000, stealthBonus: false, briefing: "Dawn breaks over Coral Bay. Five stars, one lighthouse, one boat. Finish it, Juno — for the Tidebreakers." },
];
export function act3ById(id) { return MISSIONS_ACT3.find((m) => m.id === id); }
