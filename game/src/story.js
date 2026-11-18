// Coral Bay — story bible. Every name below is original to this game.
export const STORY = {
  city: "Coral Bay",
  tagline: "A sun-soaked coastal city where every tide brings a new score.",
  protagonist: { name: "Juno Reyes", role: "Ex-courier driver", callsign: "Juno" },
  crew: [
    { name: "Tomas Hale", alias: "Tiburon", role: "Wheelman" },
    { name: "Priya Nair", alias: "Wrench", role: "Mechanic and hacker" },
    { name: "Eddie Quinn", alias: "Faro", role: "Lookout and fixer" },
  ],
  crewName: "The Tidebreakers",
  antagonist: { name: "Victor Kessler", alias: "The Harbor King", role: "Casino and marina mogul" },
  rival: { name: "Dax Rourke", crew: "The Breakers", role: "Rival crew leader" },
  missions: [
    { id: 1, act: 1, title: "Golden Hour Run", kind: "delivery", objective: "DELIVER THE PACKAGE" },
    { id: 2, act: 1, title: "Market Shakedown", kind: "combat", objective: "CLEAR THE MARKET" },
    { id: 3, act: 1, title: "Truck Under Fire", kind: "chase", objective: "OUTRUN THE BIKES" },
    { id: 4, act: 1, title: "Silent Marina", kind: "stealth", objective: "STEAL THE BOAT QUIETLY" },
    { id: 5, act: 1, title: "First Roadblock", kind: "escape", objective: "BREAK THE ROADBLOCK" },
    { id: 6, act: 2, title: "Showroom Smash", kind: "heist", objective: "STEAL THE SUPERCAR" },
    { id: 7, act: 2, title: "Searchlight Sky", kind: "chase", objective: "LOSE THE HELICOPTER" },
    { id: 8, act: 2, title: "Dockside Ghosts", kind: "stealth", objective: "DODGE THE CAMERAS" },
    { id: 9, act: 2, title: "Radio Hill Burn", kind: "sabotage", objective: "BURN THE TOWER" },
    { id: 10, act: 2, title: "Hold The Market", kind: "defense", objective: "DEFEND THE SAFEHOUSE" },
    { id: 11, act: 3, title: "Ledger On The Yacht", kind: "heist", objective: "INFILTRATE YACHT" },
    { id: 12, act: 3, title: "Bridge On Fire", kind: "escape", objective: "ESCAPE TO THE DOCKS" },
    { id: 13, act: 3, title: "Shoreline Bank Job", kind: "heist", objective: "ROB THE BANK" },
    { id: 14, act: 3, title: "Kessler's Vault", kind: "heist", objective: "CRACK THE VAULT" },
    { id: 15, act: 3, title: "Dawn At The Lighthouse", kind: "finale", objective: "REACH THE BOAT" },
  ],
};
export const MISSION_TITLES = STORY.missions.map((m) => m.title);
export function missionById(id) { return STORY.missions.find((m) => m.id === id) || STORY.missions[0]; }
export function actMissions(act) { return STORY.missions.filter((m) => m.act === act); }
