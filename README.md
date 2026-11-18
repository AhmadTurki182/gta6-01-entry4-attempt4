# CORAL BAY — Open-World Crime: 15 Missions, 3 Acts, 5-Star Police

[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/AhmadTurki182/gta6-01-entry4-attempt4/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/AhmadTurki182/gta6-01-entry4-attempt4/reward.svg)](https://make.fun/bounty/gta6-01)

**CORAL BAY** is a sun-soaked coastal open-world crime game. You are **Juno Reyes**, ex-courier of **The Tidebreakers** — Tomas "Tiburon" Hale, Priya "Wrench" Nair, and Eddie "Faro" Quinn. Your enemy is **Victor Kessler**, the Harbor King, casino and marina mogul of the bay, backed by rival crew leader **Dax Rourke** and his Breakers. Take the city back, one score at a time.

## The city

7 districts: Harbor Lights, Palm Row, Downtown Reef, Marina Vista, Old Cannery, Sunset Strip, and Lighthouse Point. Golden-hour docks, a beachfront market, glass towers, yachts, warehouses, casinos, and a cliff lighthouse — all procedural, all explorable on foot and by car.

## 15 missions in 3 acts

**Act I — Earn the crew:** 1. Golden Hour Run (delivery) · 2. Market Shakedown (combat) · 3. Truck Under Fire (chase) · 4. Silent Marina (stealth) · 5. First Roadblock (escape, 2★)

**Act II — Hit Kessler:** 6. Showroom Smash (supercar heist) · 7. Searchlight Sky (3★ helicopter chase) · 8. Dockside Ghosts (stealth, CCTV cones) · 9. Radio Hill Burn (sabotage, 4★ bike escape) · 10. Hold The Market (safehouse defense)

**Act III — Take it all:** 11. Ledger On The Yacht (yacht infiltration) · 12. Bridge On Fire (4★ escape) · 13. Shoreline Bank Job (5★ heist) · 14. Kessler's Vault (multi-phase casino vault) · 15. Dawn At The Lighthouse (5★ finale)

## Systems

- **5-star wanted system:** pursuit, PIT maneuvers, roadblocks + spike strips at 3★, helicopter + searchlight at 4★, SEARCH mode when you break line of sight.
- **Reactive traffic** (downtown floor: 12 cars) and **panicking pedestrians** (downtown floor: 25 peds) who flee when wanted rises.
- **Stealth:** guard vision cones and CCTV; ghost a mission for **double payout** vs. going loud.
- **Economy + district standing:** mission payouts, shop (armor, repair, first aid), standing per district.
- **6 vehicle classes:** Sedan, Sports, Supercar, Truck, Bike, Boat — steal any car with E.
- **Day-night cycle** with golden hour, speed-based FOV (+8°), camera lag, body roll, tire damage, smoke, collision sparks, siren lights.
- **Procedural radio:** 3 stations (CORAL FM 88.1, TIDE 101.7, LIGHTHOUSE 95.3), WebAudio only, no audio files.
- **Save / autosave** after every mission (localStorage), continue from the title screen.
- **HUD:** exactly 5 clusters — minimap + wanted stars, health/armor, objective (≤5 words), speed/vehicle, radio/cash/clock. No overlap at 1280×720.

## Controls

WASD drive · Space brake · Shift boost · E enter / steal car · F punch · C crouch · R radio · P pause · M mute

## Tech

Raw WebGL 3D, no library, no CDN, no external assets — every texture and model is procedural. Static files under `game/`, plays offline. Screenshots are real renders of this code, staged deterministically via `?stage=cover|marina|showroom|bridge&seed=42`.

## Play

Serve `game/` with any static server (e.g. `node serve.ts`) and open `http://localhost:8080`.
