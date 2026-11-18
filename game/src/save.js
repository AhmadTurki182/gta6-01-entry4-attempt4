// Save / autosave: localStorage only, versioned slot.
export const SAVE_KEY = "coral-bay-save-v1";
export function makeSaveData(state) {
  return {
    version: 1, savedAt: new Date().toISOString(),
    mission: state.mission, cash: state.econ.cash, standing: state.econ.standing,
    health: state.player.health, armor: state.player.armor,
    x: state.player.x, z: state.player.z, timeOfDay: state.timeOfDay,
    completed: state.completed.slice(), radio: state.radio.station,
  };
}
export function saveGame(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(makeSaveData(state))); return true; } catch { return false; }
}
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; } }
