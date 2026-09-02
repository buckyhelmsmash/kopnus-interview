# CashEase Design System

Design tokens and component specs extracted from the Figma source via the Figma MCP server.

**Source:** [E-Wallet Mobile Apps - CashEase (Community)](https://www.figma.com/design/yssi3szWnG6f64W9ONygXV/E-Wallet-Mobile-Apps---CashEase--Community-)
**Frames extracted:** `homepage` (#67:738), `transfer` type selector (#70:2048), `friends list` (#79:2301), `set amount` (#82:363), `success` (#105:445)
**Frame size:** 430 × 932 (iPhone-class mobile canvas)

> Extraction method: Framelink Figma MCP (`get_figma_data`). This file is the single source of truth for tokens; they are mirrored into the shadcn/Tailwind theme (`globals.css`).

---

## 1. Color tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `primary` | `#662AB2` | Brand purple. Page background top, primary buttons, active nav, scan button, dashed add-border |
| `primary-dark` | `#5C26A1` | Decorative background ellipses (darker purple) |
| `primary-tint` | `#F9F5FE` | Light purple surface — transaction icon chips, transfer-type cards, point pill bg |
| `white` | `#FFFFFF` | Card surfaces, navbar, text on purple |
| `ink` | `#121212` | Primary text (near-black) |
| `black` | `#000000` | Titles / friend names |
| `muted` | `#999999` | Secondary text (timestamps, inactive nav labels) |
| `success` | `#03B961` | Positive amounts (top up income) |
| `danger` | `#F90B1B` | Negative amounts (outgoing transactions) |
| `link` | `#059D8B` | "See all" links (teal) |
| `divider` | `#F1F1F1` | Navbar top border |
| `avatar-placeholder` | `#D9D9D9` | Fallback behind avatar images |

### Accent colors (transaction/bank icons)
| Hex | Usage |
| --- | --- |
| `#1F4396` | Bank icon (BRI) |
| `#FFC600` | Bank icon (Maybank) |

---

## 2. Typography

Figma uses **Product Sans** (Google's brand font, not publicly licensed). **Assumption:** we substitute a visually close, freely available font — **`Inter`** (or Geist, already in the scaffold) — and document the swap. Weights map cleanly (400/500/700).

| Role | Family / weight | Size | Where |
| --- | --- | --- | --- |
| Balance amount | Bold 700 | 32px | "Rp 24.321.900" |
| Section heading | Bold 700 | 20px | "Send again", "Latest Transfer", page title "Transfer" |
| Transfer-type card label | Medium 500 | 18px | "Transfer to Friends/Bank" |
| Transaction name | Medium 500 | 18px | "Alexandria", "Transfer" |
| Amount (row) | Bold 700 | 16–18px | "-Rp 600.000" |
| Body / balance label | Medium 500 | 16px | "Your Balance", menu labels |
| Link | Regular 400 | 16px | "See all" |
| Points | Bold 700 | 14px | "1.972 Points" |
| Timestamp / caption | Regular 400 | 14px | "Yesterday · 19:12" |
| Nav label | Medium 500 | 14px | "Home", "Report" |
| Friend name | Regular 400 | 14px | avatar labels |

---

## 3. Spacing, radius, elevation

### Radius
| Token | Value | Usage |
| --- | --- | --- |
| `radius-card` | 12px | Main-menu card, transfer-type cards |
| `radius-sheet` | 40px (top only) | White content sheet on transfer page (`40px 40px 0 0`) |
| `radius-pill` | 1000px | Point pill, icon chips, scan button, add button |
| `radius-chip` | 4px | Battery indicator |

### Spacing (gaps/padding seen)
- Section vertical gaps: `24px`, `32px`
- Card inner padding: `16px 0` (main menu), `20px` (transfer-type card), `12px` (icon chip)
- Screen horizontal inset: `20px` (content sits at x=20, width 390 on a 430 canvas)
- Small gaps: `4px`, `8px`, `12px`, `16px`

### Elevation (shadows)
| Token | Value | Usage |
| --- | --- | --- |
| `shadow-card` | `0px 4px 25px rgba(26,26,26,0.1)` | Main-menu card |
| `shadow-navbar` | `0px -8px 20px rgba(172,172,172,0.1)` | Bottom navbar |
| `shadow-scan` | `0px 4px 20px rgba(26,26,26,0.2)` | Floating scan button |

---

## 4. Layout structure

### Home (`homepage`)
- Purple background with two darker decorative ellipses + an `elips bg` white sheet.
- **StatusBar** (mocked iOS bar) → **header** (logo left, points pill right) → **total balance** (label + amount + hide icon) → **main-menu** white card (Transfer / Top Up / Withdraw / More) → **Send again** (horizontal friend avatars + Add New) → **Latest Transaction** list → **navbar** (Home / Report / Scan(center FAB) / History / Profile).

### Transfer flow (5 screens — friends flow only; bank flow excluded)

The transfer feature is a multi-screen flow. All screens share the purple bg + decorative ellipses + a white content sheet with `40px` top radius, and a title row (back arrow · title · help icon).

```
Home (#67:738)
  └ Transfer menu button (#67:752)
     → Transfer type (#70:2048)          — cards: "Transfer to Friends" / "Transfer to Bank"
        └ "Transfer to Friends" (#70:2052)
           → Friends list (#79:2301)      — search box + "All Contact" list (avatar·name·phone·chevron)
              └ tap a contact (#82:135)
                 → Set Amount (#82:363)    — the amount form (see below)
                    └ "Proceed to Transfer" (#94:1742)
                       → Success (#105:445) — receipt + "Back to Home"
```

> **Bank flow excluded** by decision — "Transfer to Bank" card is shown but out of scope; documented in README.

#### Transfer type selector (#70:2048)
- Two cards (185px, `#F9F5FE` bg, 12px radius, 20px padding): "Transfer to Friends" / "Transfer to Bank", each with a 40px icon + 18px medium label.
- Below: "Latest Transfer" list (reuses TransactionRow with 60px avatars).

#### Friends list (#79:2301)
- **Search box**: pill (radius 1000px), 1px `#999999` border, 16×20 padding, placeholder "Search Phone Number" + search icon; adjacent add-contact icon button (`#F9F5FE` pill).
- **"All Contact"** heading (20px bold) → contact rows: 50px circular avatar + name (18px) + phone (16px muted) + `chevron_right`.

#### Set Amount (#82:363) ⭐ the required transfer form
- **Contact header**: 60px avatar + name (18px) + phone (16px muted) + `icon-edit`.
- **"Your Balance"** shown top-right on the purple header (24px bold) + a "Top Up" pill.
- **Set Amount block**: label "Set Amount" (20px medium) + amount value `Rp 200.000` (32px bold) — this is the amount INPUT.
- **Notes (optional)**: label + textarea (390×100, `#F7F7F7` bg, 1px `#E6E6E6` border, 12px radius, 300-weight placeholder "Payment for Lunch").
- **"Proceed to Transfer"** primary button: full-width pill (`#662AB2`, white 20px bold, 16px vertical padding). ← matches manuscript's button name exactly.
- Sheet has a top drag-handle pill (100×6, `#E6E6E6`, radius 1000px).

> **States to ADD (not in Figma, documented as extension):** the manuscript requires the button **disabled by default**, enabled only on a valid amount, and a clear **error when amount < Rp10.000**. Figma only shows the filled/default state; we add disabled + error states in the same visual language (error text in `#F90B1B`).

#### Success (#105:445)
- White card (24px radius) overlapping a floating **success check icon** (72px) at the top.
- "Transfer Successful" (18px bold, `#03B961`) + subtitle (16px muted).
- Big amount `Rp 200.000` (40px bold).
- **Send to** section: 48px avatar + name + phone.
- **Transaction Details** rows (label muted 14px / value bold 14px): Payment, Date, Time, Reference Number, Fee.
- **Total Payment** row (both in `#662AB2`, 24px bold value).
- Two full-width pill buttons: **"Share"** (outline, white border on purple) + **"Back to Home"** (white bg, purple text).

---

## 5. Component inventory (for reusable UI)

| Component | Derived from | Notes |
| --- | --- | --- |
| `Button` | scan/add/`btn-big-primary` | Variants: `primary` (`#662AB2` bg, white), `outline` (border), `secondary` (white bg/purple text). Full-width pill for actions; loading + disabled states. |
| `Input` | search box / notes field | Text variant (pill, bordered) and textarea variant (`#F7F7F7`, 12px radius). Error slot in `#F90B1B`. |
| `AmountInput` | Set Amount block | Large `Rp` amount entry (32px), the core transfer field with validation. |
| `Card` | main-menu / transfer-type | white or tinted, 12px radius, `shadow-card` |
| `BalanceCard` | total balance | on-purple, 32px bold amount, hide toggle |
| `TransactionRow` | transaction-list | icon chip/avatar + name/time + signed amount (green/red) |
| `ContactRow` | friends list | avatar + name + phone + chevron |
| `Avatar` | ellipses | 48/50/60/65px, circular, image or placeholder |
| `IconChip` | transaction icon | `#F9F5FE` bg, pill, 28–32px icon |
| `NavBar` | navbar | 5 items, center FAB scan button |
| `ScreenHeader` | title row | back arrow · title · help icon; on purple |
| `PurpleScreen` | shared bg | purple bg + 2 ellipses + white sheet (40px top radius) |
| `DetailRow` | success details | label (muted) / value (bold), space-between |
| `Badge`/`Pill` | points | pill, icon + label |

---

## 6. Assumptions recorded (→ README)

1. **Product Sans → Geist** substitution (Product Sans is not freely licensed; Geist ships with the scaffold).
2. **Transfer is the full friends flow** (5 screens); the **bank flow is excluded** (card shown, out of scope).
3. **Disabled + error states are an extension** — Figma shows only the default Set Amount state; the manuscript's "button disabled by default / error when < Rp10.000" states are added in the same visual language.
4. Money is integer rupiah, formatted `Rp 24.321.900` (dot thousands separators, `Rp ` prefix).
5. Mobile canvas is 430px; on desktop the app is centered in a phone-width column (mobile-first per the source design).
6. Decorative iOS StatusBar is simplified/omitted on web (it's a native OS element, not app UI).
7. Contact selection passes recipient identity to the Set Amount screen; a seeded contact list backs the friends list (mock API).
