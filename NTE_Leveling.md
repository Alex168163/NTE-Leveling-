# NTE Leveling Calculator — Reference & Requirements

## Project Overview

This document contains the info needed to build a calculator that tells you — based on your green/blue/purple resources across the three categories (**Characters / Arcs / Cartridges & Modules**) and **Beetle Coins** — how high you can level a character in game.

### Application Requirements

- Build three separate calculators, one per category, each with a **per-10-level slider** that shows the needed resources.
- Deliver this as a standalone **application** (web-page feel, packaged in a nice `.exe` window).
- Make it **secure**, with options to update it within the local folder and repo.
- Factor in **ascensions** for costs, and list all other materials required.
- Anywhere it says **"coins"** it automatically means **Beetle Coins**.
- Use the provided pictures as **icons next to costs** (e.g., when Beetle Coins are calculated, the Beetle Coin icon shows next to the number).
- For any icon used, **all others sharing the same name and color** should also be listed. *Example: if something needs 5 Green World Drop Materials, all 4 matching icons should show next to that text.*
- Separate the calculators into **tabs**:
  - The three main calculators (**Characters / Arcs / Cartridges & Modules**)
  - A **"Costs for all abilities Max to 10 + passive skills + life skills"** tab
  - A **"1–80"** tab showing what everything maxed would cost from 1–80
- Each calculator tab should have an **input for every resource** needed for that tab (≈4-character max per resource input).
- Use the supplied **background** as the backsplash, but make a custom backdrop for anything in calc / trackers / Max Outs so it's more visible.
- Theme: fit the **NTE** look — city life, vibrant colors, super high-tech, almost **cyberpunk** vibes.

---

## Ascension Level Caps

| Ascension | Unlocks Leveling To |
|-----------|---------------------|
| Ascend 1  | Level 30 |
| Ascend 2  | Level 40 |
| Ascend 3  | Level 50 |
| Ascend 4  | Level 60 |
| Ascend 5  | Level 70 |
| Ascend 6  | Level 80 |

---

## Characters

### Leveling Costs (per 10 levels, plus ascend cost for each ascension)

| Level Range | XP    | Coins |
|-------------|-------|-------|
| 1–20        | 103k  | 26k   |
| 20–30       | 213k  | 54k   |
| 30–40       | 375k  | 93k   |
| 40–50       | 620k  | 152k  |
| 50–60       | 980k  | 245k  |
| 60–70       | 1.6m  | 400k  |
| 70–80       | 2.62m | 955k  |

### Character Ascension Upgrade Costs

| Ascension | Beetle Coins | Anomaly Hunt Material | World Drop Material |
|-----------|--------------|-----------------------|---------------------|
| 20 → 30   | 25k  | —   | 5x Green  |
| 30 → 40   | 50k  | 2x  | 12x Green |
| 40 → 50   | 75k  | 8x  | 6x Blue   |
| 50 → 60   | 100k | 16x | 12x Blue  |
| 60 → 70   | 125k | 24x | 6x Purple |
| 70 → 80   | 150k | 36x | 9x Purple |

---

## Arcs

### Leveling Costs (per 10 levels, plus ascend cost for each ascension)

| Level Range | XP    | Coins | Ascend Coins      |
|-------------|-------|-------|-------------------|
| 1–20        | 40k   | 12k   | —                 |
| 20–30       | 100k  | 30k   | Ascend 1 — 20k    |
| 30–40       | 200k  | 60k   | Ascend 2 — 40k    |
| 40–50       | 350k  | 102k  | Ascend 3 — 60k    |
| 50–60       | 560k  | 171k  | Ascend 4 — 80k    |
| 60–70       | 910k  | 273k  | Ascend 5 — 100k   |
| 70–80       | 1.49m | 447k  | Ascend 6 — 120k   |

### Arc Ascension Upgrade Costs

| Ascension | Beetle Coins | Arc Material | World Drop Material |
|-----------|--------------|--------------|---------------------|
| 20 → 30   | 20k  | 4x Green   | 4x Green   |
| 30 → 40   | 40k  | 10x Green  | 10x Green  |
| 40 → 50   | 60k  | 6x Blue    | 6x Blue    |
| 50 → 60   | 80k  | 12x Blue   | 12x Blue   |
| 60 → 70   | 100k | 6x Purple  | 6x Purple  |
| 70 → 80   | 120k | 12x Purple | 12x Purple |

---

## Cartridges & Modules

*(Cartridges and Modules have no ascension.)*

### Cost to Upgrade Cartridges

| Rarity | Max Level | XP   | Coins |
|--------|-----------|------|-------|
| Gold   | 20        | 693k | 14k   |
| Purple | 20        | 463k | 10k   |

### Cost to Upgrade Modules

| Rarity | Max Level | XP   | Coins |
|--------|-----------|------|-------|
| Gold   | 20        | 418k | 9k    |
| Purple | 20        | 188k | 4k    |

---

## Abilities — Max to 10 + Passive Skills (Progression Checker)

> This takes no XP, so it's a **progression checker** rather than part of the leveling calculator.

### Base Attack · Redirect Skill · Ultimate · Support Skill

> Per-skill cost to max one of these abilities to Lv 10. There are four such combat abilities.

| Material | Amount |
|----------|--------|
| Anomaly Pilgrimage Material   | 8x  |
| Purple World Drop Material     | 16x |
| Purple Ability Upgrade Material  | 16x |
| Blue World Drop Material        | 10x |
| Blue Ability Upgrade Material | 10x |
| Green World Drop Material       | 10x |
| Green Ability Upgrade Material | 10x |
| Beetle Coin                     | 437k |

### Passive Skill 1

| Material | Amount |
|----------|--------|
| Anomaly Pilgrimage Material      | 1x  |
| Blue Ability Upgrade Material  | 2x  |
| Beetle Coin                      | 30k |

### Passive Skill 2

| Material | Amount |
|----------|--------|
| Anomaly Pilgrimage Material      | 2x  |
| Purple Ability Upgrade Material    | 1x  |
| Beetle Coin                      | 40k |

---

## All Life Skills on One Character (Progression Checker)

> This takes no XP, so it's a **progression checker** rather than part of the leveling calculator.

| Material | Amount |
|----------|--------|
| Dreamless Seed | 56x |
| Fons           | 22k |

---

## XP Sources

> XP for certain things can only use specific sources — every XP source is not the same. A character, for example, only takes Hunter Guides for its calculations.

### Character XP

| Source                     | XP Granted   |
|----------------------------|--------------|
| Green / Rising Hunter Guide | 1k character XP  |
| Blue / Senior Hunter Guide  | 5k character XP  |
| Purple / Elite Hunter Guide | 20k character XP |

### Arc XP

| Source                   | XP Granted   |
|--------------------------|--------------|
| Green / Light Dye         | 500 arc XP   |
| Blue / Colorless Dye      | 2.5k arc XP  |
| Purple / Chaotic Dye      | 10k arc XP   |

### Cartridges / Modules XP

| Source                  | XP Granted             |
|-------------------------|------------------------|
| Green / Thug Manhole     | 1k Cartridge/Module XP  |
| Blue / Crook Manhole     | 5k Cartridge/Module XP  |
| Purple / Boss Manhole    | 20k Cartridge/Module XP |
