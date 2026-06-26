# NTE Leveling Calculator — Update Plans

## 1. Cartridge & Module Page Icons

Need icons for the Cartridge and Module page. For all of these:

- Cartridge · Gold
- Cartridge · Purple
- Module · Gold
- Module · Purple

**Changes:**

- Remove all **Module Purples** and **Cartridge Purples** from everything — only **Golds** going forward.
- Use **Cartridge Example 1–12** icons together to show for cartridges.
- Do the same for modules, but break them into **Types**.
- For the "filled" max out, just list all the modules.

### Module Types — Cost to Max to Level 20

> Forgot about module types — they all cost different amounts to max to 20.

| Module Type | XP   | Beetle Coins |
|-------------|------|--------------|
| Type II     | 278k | 5,560        |
| Type III    | 418k | 8,360        |
| Type IV     | 558k | 11,160       |

- Add the module types and let the user choose **how many of each** they will need.
- For the max out on the **1 → 80** tab, change it to say **"Filled modules"** rather than 8 in particular.
- Math for a maxed/filled module set = **1× Type IV + 4× Type III + 2× Type II**. Add those up in terms of resources to show the correct total.

---

## 2. Cartridge / Module XP Logo

Need an XP logo for **Cartridge / Module XP**.

---

## 3. Bug Fix — Anomaly Pilgrimage Material

**Anomaly Pilgrimage Material** is overlapping an input box on the **My Resources** page. Needs fixing.

---

## 4. ~~"Already Unlocked Ascension" Toggle~~ — SUPERSEDED

> **Removed.** This was replaced by the **per-character ascension selection** (current
> vs. "one ahead") set on the My Characters / Ability tab. Choosing "one ahead" already
> marks the current bracket's ascension as paid and removes its cost automatically, so
> the manual toggle is no longer shown anywhere.

---

## 5. Named Example Materials (Character-Specific Leveling)

Add a name to all example materials so character-specific changes to leveling can be made. In the **My Characters** tab (see #6), allow picking characters you own and setting their level (in sections of 10). Include an option for **not having the character unlocked**.

**Disclaimer for this tab:**

> "Please make sure to level a character to the nearest 10 to use the calculator and all calculations are done before ascension cost of that level range (Unless Specified). Example: At level 50 haven't done ascension to be able to level to 60."

---

## 6. New Tab — "My Characters" (Second Tab)

- Implement all characters with an icon — make these **larger and really stand out**.
- Filterable by **S-Rank / A-Rank** and by typing: **Cosmos, Anima, Chaos, Incantation, Lakshana, Psyche**.
- Default: show all characters, grouped by typing and listed **S → A**.
- Resources tied to a character only show in the **Character, Arcs, Cartridges & Modules, and Abilities & Life Skills** tabs. Selecting another character updates those tabs to that character's resources.
- When a character **is** selected, show **only their one specific material and its single icon** for each slot — never the grouped "all icons" set.
- If **Unreleased / No Character** is chosen, show the regular example materials with the broad name (e.g., *Green World Drop Material*). **This is the default on app open.**
- Add a **question-mark icon** (same size as character icons) for **"Unreleased / No Character Selected."** This is more of a test option, since example resources are being removed from the My Resources tab.

**Disclaimer when the "No Character" profile is selected** (on every tab except 1 → 80):

> "Resources couldn't sync no character selected feel free to fill in estimate data towards a future character we don't know the resources for"

This disclaimer is needed because all the old example categories still show but won't have data (nothing filled in on the My Resources tab).

---

## 7. Do Not Touch — "1 → 80" Tab

Never touch the **1 → 80** tab. It's an example tab showing what it costs to fully upgrade a brand-new character from 1 → 80.

---

## 8. Tab Renaming

Add the word **"Leveling"** to the end of these tab names and remove the trailing plural **"s"** to distinguish them as leveling tabs:

- Characters → **Character Leveling**
- Arcs → **Arc Leveling**
- Cartridges and Modules → **Cartridge and Module Leveling**
- Abilities & Life Skills → **Ability & Life Skill Leveling**

---

## 9. New Tab — "My Teams" (Before the 1 → 80 Tab)

- Teams are made up of **4 characters**.
- Let users put 4 characters into a new team.
- Based on character data and resources, show the total resources still needed to fully level the team to **80**, plus a comparison against resources already owned (what's left).
- Support building up to **10 saved teams** — nothing to input but the characters.
- Place this tab **before the 1 → 80 tab**.

---

## 10. Resource Limit Increase

Raise the limit using **M** — make the limit for any resource **999M**.

---

## 11. Fix Example Resource Icon Order

- **Blue World Drop Material** order should be **3, 1, 4, 2**.
- **Purple World Drop Material** order should be **3, 2, 1, 4**.

(For the example icon photos.)

---

## 12. Character Typing Display

Characters should display the text of their **typing** and its **logo** next to their icon.

---

## 13. Arc Material Examples — Leave As-Is

Not touching arc material examples yet — they stay in place on the resource checker and the Arc tab. This update focuses on naming the **other** examples for characters.

---

## 14. My Resources Tab Disclaimer

> "Any materal selection boxes are not calculated here either use them and add that materal here or hold on and use them when needed, but know that if you have some you can fill in some materals you might be missing currently."

---

## 15. Heterogeneous Unit & Expansion Core (Add to "My Resources")

Add **Heterogeneous Unit** and **Expansion Core** to the My Resources tab.

- **Heterogeneous Unit** — usable as any 1 green world drop material.
- **Expansion Core** — usable as one green ability upgrade material. *(Remove the Bronze > Blue > Gold wording in favor of Green > Blue > Purple wording.)*
- These fill in missing resources on calculators and show the amount used for each resource.
- **Do not use them until all current resources of that type are used or rounded itself.**
- They are used to fill in missing materials you don't have.
- Since they are only 1 of any green resource, fill rates are:
  - Green resource: **1 : 1**
  - Blue resource: **3 : 1**
  - Purple resource: **9 : 1**

---

## 16. Three-Tier Combination System

Ability Upgrades, Arc Materials, and World Materials follow a three-tier system **Green > Blue > Purple** (the same applies to Bronze > Blue > Gold — **change these to Green > Blue > Purple wording instead, and update the source of truth**).

- Combine to make the next tier: **3 Green → 1 Blue** and **3 Blue → 1 Purple**.
- If the character already has enough Greens, round them up to Blues; if they already have enough Blues, round them up to Purples.
- Show all of this next to the resource.
- **Always use the resource over combining or using a Heterogeneous Unit / Expansion Core.**

---

## 17. "My Resources" Consistency + Input Boxes

- **My Resources** must always be the **same regardless of the character selected**.
- **No grouping on My Resources except Arc Materials.** Every specific resource gets its **own input box** with its **single correct icon** — e.g. Anomaly Hunt has all **7** separate boxes, Ability Upgrades and World Materials are split per tier into their individual named boxes (using the in-game names from #18). Arc Materials stay grouped (Green/Blue/Purple). This makes it easy to apply to specific characters.

---

## 18. In-Game Names for Example Materials (icon → name mapping)

> Each **Example number maps to ONE specific icon**. That icon is the single icon
> shown for that named material — when a character is selected, only their one
> specific material/icon is shown (no grouped icons). The grouped "all icons"
> view is only for the generic/unselected case.


### Anomaly Hunt Material

| Example | In-Game Name |
|---------|--------------|
| 1 | Charging Knight Spark Plug |
| 2 | A Page from Delusion's Shore |
| 3 | Water Moon Pick |
| 4 | Nest Guard Fragment |
| 5 | Confessional Flower Seed |
| 6 | Colorful Ticket Stub |
| 7 | Tear of the Sea |

### Anomaly Pilgrimage Material

| Example | In-Game Name |
|---------|--------------|
| 1 | Dress Sleeves of Vanity |
| 2 | Good Boy Stamp |
| 3 | Eternal Memory |

### Bronze Ability Upgrade *(now Green)*

| Example | In-Game Name |
|---------|--------------|
| 1 | Nestling's Longing |
| 2 | FNG |
| 3 | First Expectations |
| 4 | Synchronicity of Thought |
| 5 | Hesitation of the Waves |

### Silver Ability Upgrade *(now Blue)*

| Example | In-Game Name |
|---------|--------------|
| 1 | Dove's Flutter |
| 2 | CO |
| 3 | Known Weariness |
| 4 | Resonance of Faith |
| 5 | Suspended Whispers |

### Gold Ability Upgrade *(now Purple)*

| Example | In-Game Name |
|---------|--------------|
| 1 | The Olive Branch |
| 2 | White Rose |
| 3 | Black Hat |
| 4 | Heart-Racing Night |
| 5 | The Second Self |

### Green World Material

| Example | In-Game Name |
|---------|--------------|
| 1 | Lost Whispers |
| 2 | Fading Silhouette |
| 3 | Blurred Numeral |
| 4 | Suspended Delusions |

### Blue World Material

| Example | In-Game Name |
|---------|--------------|
| 1 | Unsolved Numeral |
| 2 | Obscure Whispers |
| 3 | Blurred Silhouette |
| 4 | Yearning Delusions |

### Purple World Material

| Example | In-Game Name |
|---------|--------------|
| 1 | Transcendent Delusions |
| 2 | Distorted Numeral |
| 3 | Chaos Silhouette |
| 4 | Paradoxical Whispers |

> Note: The source lists the World Material examples with "Example 2/3/4" plus an unnumbered "Example" (treated as #1 above). Confirm the exact 1–4 ordering against the icon-order fixes in #11.

---

## 19. Materials → Characters Mapping

### Anomaly Hunt Materials

| Material | Characters |
|----------|------------|
| Charging Knight Spark Plug | Esper Zero, Daffodil, Sakiri |
| A Page from Delusion's Shore | Nanally, Mint |
| Water Moon Pick | Fadia, Adler |
| Nest Guard Fragment | Baicang, Haniel, Aurelia |
| Confessional Flower Seed | Hotori, Lacrimosa, Skia |
| Colorful Ticket Stub | Hathor, Edgar |
| Tear of the Sea | Jiuyuan, Chiz |

### Anomaly Pilgrimage Materials

| Material | Characters |
|----------|------------|
| Good Boy Stamp | Nanally, Mint, Aurelia, Edgar, Hathor, Chiz, Sakiri, Baicang, Esper Zero |
| Dress Sleeves of Vanity | Hotori, Jiuyuan, Daffodil, Fadia, Lacrimosa, Haniel, Adler, Skia |
| Eternal Memory | Chaos |

### Bronze Ability Upgrades *(now Green)*

| Material | Characters |
|----------|------------|
| Nestling's Longing | Chiz, Edgar, Esper Zero, Hotori |
| FNG | Mint, Nanally, Aurelia |
| First Expectations | Adler, Baicang, Sakiri |
| Synchronicity of Thought | Jiuyuan, Chaos, Fadia, Hathor |
| Hesitation of the Waves | Daffodil, Lacrimosa, Skia, Haniel |

### Silver Ability Upgrades *(now Blue)*

| Material | Characters |
|----------|------------|
| Dove's Flutter | Chiz, Edgar, Esper Zero, Hotori |
| CO | Mint, Nanally, Aurelia |
| Known Weariness | Adler, Baicang, Sakiri |
| Resonance of Faith | Jiuyuan, Chaos, Fadia, Hathor |
| Suspended Whispers | Daffodil, Lacrimosa, Esper Zero, Skia, Haniel |

### Gold Ability Upgrades *(now Purple)*

| Material | Characters |
|----------|------------|
| The Olive Branch | Chiz, Edgar, Esper Zero, Hotori |
| White Rose | Mint, Nanally, Aurelia |
| Black Hat | Adler, Baicang, Sakiri |
| Heart-Racing Night | Jiuyuan, Chaos, Fadia, Hathor |
| The Second Self | Daffodil, Lacrimosa, Skia, Haniel |

### Green World Materials

| Material | Characters |
|----------|------------|
| Fading Silhouette | Jiuyuan, Mint, Nanally, Fadia |
| Blurred Numeral | Adler, Baicang, Sakiri, Haniel |
| Suspended Delusions | Daffodil, Chaos, Skia, Aurelia, Hathor |
| Lost Whispers | Lacrimosa, Chiz, Edgar, Esper Zero, Hotori |

### Blue World Materials

| Material | Characters |
|----------|------------|
| Obscure Whispers | Lacrimosa, Chiz, Edgar, Esper Zero, Hotori |
| Blurred Silhouette | Jiuyuan, Mint, Nanally, Fadia |
| Yearning Delusions | Daffodil, Chaos, Skia, Aurelia, Hathor |
| Unsolved Numeral | Adler, Baicang, Sakiri, Haniel |

### Purple World Materials

| Material | Characters |
|----------|------------|
| Distorted Numeral | Adler, Baicang, Sakiri, Haniel |
| Chaos Silhouette | Jiuyuan, Mint, Nanally, Fadia |
| Paradoxical Whispers | Lacrimosa, Chiz, Edgar, Esper Zero, Hotori |
| Transcendent Delusions | Daffodil, Chaos, Skia, Aurelia, Hathor |
