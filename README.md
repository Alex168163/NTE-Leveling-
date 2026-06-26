# NTE Leveling Calculator & Resource Checker

A quality-of-life **level calculator** and **resource checker** for *Neverness To Everness*.
Tells you how high you can level your **Characters**, **Arcs**, and **Cartridges & Modules**
from the green / blue / purple resources and **Beetle Coins** you have on hand — and what it
costs to get there, ascensions included.

Built as a web-feel app that also packages into a Windows **`.exe`** desktop window (Electron).

## Download (Windows)

From the **[latest release](https://github.com/Alex168163/NTE-Leveling-/releases/latest)** grab
either:
- **`...Setup.x.y.z.exe`** — installer (pick a folder, adds a Desktop shortcut), or
- **`...x.y.z-win.zip`** — portable; unzip anywhere and run `NTE Leveling Calculator.exe` inside.

### If Windows/your browser blocks it
The app isn't code-signed, so it has no SmartScreen reputation yet — it's safe, just unrecognised.
1. **Browser** ("isn't commonly downloaded / may be dangerous"): on the download, click the **⋯** or
   arrow → **Keep** / **Keep anyway**.
2. **Best step — remove the "Mark of the Web":** right-click the downloaded file → **Properties** →
   tick **Unblock** (bottom-right) → **OK**. (For the zip, unblock the **zip** before extracting.)
   PowerShell equivalent: `Unblock-File "<path to file>"`.
3. **On first run** ("Windows protected your PC"): click **More info → Run anyway**.

These warnings also fade over time as more people run it.

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
| **Abilities & Life Skills** | **Progression checker** (these take no XP): tick what you've maxed, see what's left. |
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
npm run package:win    # portable desktop app -> release/NTE Leveling Calculator-win32-x64/
                       #   run "NTE Leveling Calculator.exe" inside that folder (no install needed)
npm run dist           # full Windows installer (.exe) -> release/   (electron-builder)
```

`npm run dist` produces the shareable **installer** (`release/NTE Leveling Calculator Setup
x.y.z.exe`), which is what's attached to GitHub Releases.

> **If `npm run dist` fails with `Cannot create symbolic link : A required privilege is not
> held`:** electron-builder extracts a `winCodeSign` bundle that contains macOS symlinks, and
> creating symlinks on Windows needs **Developer Mode** (Settings → Privacy & security → For
> developers) or an admin terminal. Two ways through without elevating:
> 1. Pre-extract the bundle once (the macOS symlinks fail harmlessly, the Windows tools we
>    need extract fine), then re-run `npm run dist`:
>    ```bash
>    cd "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign"
>    7za x winCodeSign-2.6.0.7z -o"winCodeSign-2.6.0" -y   # ignore the 2 .dylib symlink errors
>    ```
> 2. Or just run `npm run package:win` for a portable (no-installer) build.

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
