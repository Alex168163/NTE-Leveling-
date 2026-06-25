# NTE Leveling Calculator & Resource Checker

A quality-of-life **level calculator** and **resource checker** for *Neverness To Everness*.
Tells you how high you can level your **Characters**, **Arcs**, and **Cartridges & Modules**
from the green / blue / purple resources and **Beetle Coins** you have on hand — and what it
costs to get there, ascensions included.

Built as a web-feel app that also packages into a Windows **`.exe`** desktop window (Electron).

---

## The markdown is the source of truth

Every cost, XP value, and material requirement comes from **[`NTE_Leveling.md`](./NTE_Leveling.md)**.
At dev/build time, `scripts/parse-md.mjs` parses that file's tables into:

- `src/data/gameData.json` — all the numbers
- `src/data/icons.json` — every image grouped by material name (so all icons that
  share a name & colour show together, per spec)

**To update the data, edit `NTE_Leveling.md` and re-run `npm run gen:data`** (or just
`npm run dev` / `npm run build`, which run it automatically). No code changes needed.

---

## Tabs

| Tab | What it does |
|-----|--------------|
| **Characters** | Hunter-Guide XP + Beetle Coins + ascension mats → how high you can go, cost to a target level, per-ascension breakdown. |
| **Arcs** | Same, with Dye XP and Arc/World-Drop materials. |
| **Cartridges & Modules** | No ascensions — plan how many of each rarity to max to Lv 20 against your Manhole XP. |
| **Abilities & Life Skills** | Fun-fact **progression checker** (these take no XP): tick what you've maxed, see what's left. |
| **1 → 80 Everything** | The grand total to max one of everything. |

"Coins" always means **Beetle Coins**.

---

## Develop & run

```bash
npm install
npm run dev            # web dev server at http://localhost:5173
npm run electron:dev   # same app inside the desktop (.exe-style) window
```

## Build

```bash
npm run build          # production web build -> dist/
npm run dist           # Windows installer (.exe) -> release/   (electron-builder)
```

## Project layout

```
NTE_Leveling.md         source of truth (edit this!)
scripts/parse-md.mjs    md -> JSON + icon manifest generator
public/assets/          icons + Background.jpg
src/
  lib/        calc engine, formatting, icon resolver
  components/ icon stack, cost rows, resource inputs
  calculators/ the five tabs
  App.tsx     tab shell + theme
electron/     desktop window (secure: context-isolated, no node integration)
```

---

*Unofficial fan-made tool. Not affiliated with the developers of Neverness To Everness.*
