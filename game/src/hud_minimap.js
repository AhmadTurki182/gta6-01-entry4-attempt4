// HUD + minimap: exactly 5 clusters, no overlap at 1280x720.
// Cluster 1: minimap + wanted (top-left). 2: health/armor (bottom-left).
// Cluster 3: objective (top-center). 4: speed/vehicle (bottom-right). 5: radio (top-right).
export const HUD_CLUSTERS = ["minimap+wanted", "health/armor", "objective", "speed/vehicle", "radio"];
export function drawMinimap(canvas, state) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(8,20,28,0.85)";
  ctx.beginPath(); ctx.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#e8c85a"; ctx.lineWidth = 2; ctx.stroke();
  const scale = W / 1120;
  const px = (x) => W / 2 + (x - state.player.x) * scale;
  const pz = (z) => H / 2 + (z - state.player.z) * scale;
  // Roads
  ctx.strokeStyle = "rgba(200,200,200,0.5)"; ctx.lineWidth = 2;
  for (let g = -5; g <= 5; g++) {
    ctx.beginPath(); ctx.moveTo(px(g * 92), 0); ctx.lineTo(px(g * 92), H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, pz(g * 92)); ctx.lineTo(W, pz(g * 92)); ctx.stroke();
  }
  // Sea
  ctx.fillStyle = "rgba(40,110,160,0.6)";
  ctx.fillRect(0, pz(-300), W, H - pz(-300));
  // Mission marker
  if (state.target) {
    ctx.fillStyle = "#ffde59";
    ctx.beginPath(); ctx.arc(px(state.target.x), pz(state.target.z), 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#000"; ctx.stroke();
  }
  // Roadblock marker
  if (state.police.roadblock) {
    ctx.fillStyle = "#ff3c3c";
    ctx.fillRect(px(state.police.roadblock.x) - 5, pz(state.police.roadblock.z) - 5, 10, 10);
  }
  // Traffic dots
  ctx.fillStyle = "#cfe8ff";
  for (const c of state.traffic) { ctx.fillRect(px(c.x) - 1.5, pz(c.z) - 1.5, 3, 3); }
  // Police dots
  ctx.fillStyle = "#5a8aff";
  for (const u of state.police.units) { ctx.beginPath(); ctx.arc(px(u.x), pz(u.z), 3, 0, Math.PI * 2); ctx.fill(); }
  // Player arrow
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(-state.player.heading);
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}
export function starsHTML(wanted) {
  let s = "";
  for (let i = 0; i < 5; i++) s += `<span class="star ${i < wanted ? "on" : ""}">&#9733;</span>`;
  return s;
}
