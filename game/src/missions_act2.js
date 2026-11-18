// Missions Act II (6-10): the crew hits Kessler where it hurts.
export const MISSIONS_ACT2 = [
  { id: 6, act: 2, title: "Showroom Smash", kind: "heist", district: "Sunset Strip", objective: "STEAL THE SUPERCAR", wanted: 2, reward: 2500, stealthBonus: false, briefing: "Kessler's showroom, glass and gold. Smash in, take the supercar, leave the alarm screaming." },
  { id: 7, act: 2, title: "Searchlight Sky", kind: "chase", district: "Downtown Reef", objective: "LOSE THE HELICOPTER", wanted: 3, reward: 1800, stealthBonus: false, briefing: "Three stars and a helicopter with a searchlight. Break line of sight — tunnels, alleys, anywhere dark." },
  { id: 8, act: 2, title: "Dockside Ghosts", kind: "stealth", district: "Harbor Lights", objective: "DODGE THE CAMERAS", wanted: 0, reward: 2200, stealthBonus: true, briefing: "The dock warehouse is patrolled by guards and CCTV cones. Ghost it for double pay, or go loud and settle for half." },
  { id: 9, act: 2, title: "Radio Hill Burn", kind: "sabotage", district: "Lighthouse Point", objective: "BURN THE TOWER", wanted: 4, reward: 3000, stealthBonus: false, briefing: "Kessler's radio tower sells lies over the whole bay. Burn it, then ride the bike down the hill at four stars." },
  { id: 10, act: 2, title: "Hold The Market", kind: "defense", district: "Palm Row", objective: "DEFEND THE SAFEHOUSE", wanted: 2, reward: 2000, stealthBonus: false, briefing: "The Breakers are coming for our safehouse. Hold the market until the last wave breaks." },
];
export function act2ById(id) { return MISSIONS_ACT2.find((m) => m.id === id); }
