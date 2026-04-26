# Equalyze — Design File
**Version:** 1.0  
**Status:** Final Draft  
**Platform:** Responsive Web (Desktop-first, Mobile-ready)  
**Audience:** Hackathon judges + Investor/client demos  
**Design Direction:** Clean Enterprise Trustworthy — _"the audit tool that feels like it belongs on a Fortune 500 compliance team's desktop"_

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Design Tokens](#3-design-tokens)
4. [Typography System](#4-typography-system)
5. [Color System](#5-color-system)
6. [Spacing & Layout Grid](#6-spacing--layout-grid)
7. [Component Library](#7-component-library)
8. [Icon & Illustration System](#8-icon--illustration-system)
9. [Motion & Animation Principles](#9-motion--animation-principles)
10. [Phase 1 — Core Screens (MVP Demo)](#10-phase-1--core-screens-mvp-demo)
11. [Phase 2 — Extended Screens (Post-Demo)](#11-phase-2--extended-screens-post-demo)
12. [Phase 3 — Mobile Responsive](#12-phase-3--mobile-responsive)
13. [Accessibility Standards](#13-accessibility-standards)
14. [Implementation Handoff Notes](#14-implementation-handoff-notes)

---

## 1. Design Philosophy

### The Core Tension

Equalyze sits at a rare intersection: it must simultaneously feel **technical enough** that a data scientist trusts it, **readable enough** that a CEO can understand it, and **serious enough** that a lawyer can file it with a regulator.

Most audit tools pick one of these audiences and design for them. Equalyze must work for all three in the same session — often in the same report.

### The Design Answer

**Refined Institutional.** Think of the visual language of Bloomberg Terminal meets Linear meets a Swiss legal document. Clean white space. Precise typography. Information-dense but never cluttered. Every element earns its place. No decorative flourish — but not sterile. Warm enough to feel human. Structured enough to feel authoritative.

> The product should feel like it was designed by a team that has read the EU AI Act and also has taste.

### Three Design Principles

**1. Evidence Over Assertion**  
Every claim the platform makes is shown, not told. The counterfactual twin is shown side-by-side. The legal citation links to the actual article. The severity score shows its math. Design reinforces this: data is primary, narrative is secondary.

**2. Progressive Disclosure**  
A CEO opens the Executive Summary. The data scientist drills into the metrics. The lawyer reads the regulation citations. The same report serves all three by layering detail — the surface is always clean, depth is always available.

**3. Calm Authority**  
No alarm-bell UI. No flashing RED warnings. When the system detects critical bias, it presents it with gravity and precision — like a surgeon delivering a diagnosis, not like a smoke alarm. The severity colors are muted, not garish. The language is declarative, not exclamatory.

---

## 2. Brand Identity

### Wordmark

```
Equalyze
```

- Font: **Instrument Serif** (italic weight) for the "E" mark; **Geist** for the full wordmark in regular weight
- The name is set in lowercase with a capital E — deliberate, to feel approachable yet precise
- No icon/logo mark for V1 — the wordmark alone is the identity
- Tagline (used in reports and landing): _"Make the invisible, visible."_

### Brand Voice

| Context | Tone | Example |
|---------|------|---------|
| UI labels | Precise, minimal | "Bias detected" not "We found a problem!" |
| Error states | Direct, no blame | "Schema incomplete — 2 columns need tagging" |
| Counterfactual narrative | Human, measured | "Same financials. Different gender. Different outcome." |
| Report executive summary | Authoritative, plain | "This model exhibits statistically significant gender bias in loan approvals." |
| Empty states | Calm, directive | "No audits yet. Upload a dataset to begin." |

### Brand Don'ts

- No purple gradients
- No rounded-everything bubbly UI
- No celebration animations on completing an audit (this is serious work)
- No generic stock illustration style
- No tooltips that apologize ("Sorry, we couldn't find...")

---

## 3. Design Tokens

All tokens defined as CSS custom properties. Single source of truth — all components reference tokens, never raw values.

### Token Reference

```css
:root {
  /* ─── PRIMITIVES ─── */

  /* Neutral Scale */
  --neutral-0:   #FFFFFF;
  --neutral-50:  #F8F8F7;   /* Page background */
  --neutral-100: #F1F0EE;   /* Card background, sidebar */
  --neutral-200: #E5E4E0;   /* Borders, dividers */
  --neutral-300: #C9C7C2;   /* Disabled borders */
  --neutral-400: #9B9893;   /* Placeholder text */
  --neutral-500: #6B6965;   /* Secondary text */
  --neutral-600: #4A4845;   /* Body text */
  --neutral-700: #2E2C2A;   /* Heading text */
  --neutral-800: #1C1B19;   /* Display text */
  --neutral-900: #0F0E0D;   /* Maximum contrast */

  /* Brand Scale — Slate Blue (primary) */
  --brand-50:   #F0F3F9;
  --brand-100:  #D8E0F0;
  --brand-200:  #B0C1E1;
  --brand-300:  #7FA0CF;
  --brand-400:  #4F7FBD;
  --brand-500:  #2F5FA3;   /* Primary action */
  --brand-600:  #244C87;   /* Hover state */
  --brand-700:  #1A3968;   /* Active / pressed */
  --brand-800:  #112549;
  --brand-900:  #091530;

  /* Severity Scale — Semantic */
  --severity-green-bg:     #F0F7F0;
  --severity-green-border: #AACDAA;
  --severity-green-text:   #2A5E2A;
  --severity-green-dot:    #3D8B3D;

  --severity-amber-bg:     #FDF8EE;
  --severity-amber-border: #E8D090;
  --severity-amber-text:   #7A5A00;
  --severity-amber-dot:    #C49B00;

  --severity-red-bg:       #FDF1F0;
  --severity-red-border:   #E8AAAA;
  --severity-red-text:     #7A1F1F;
  --severity-red-dot:      #C43030;

  /* Functional */
  --color-focus-ring:    #4F7FBD;
  --color-selection-bg:  #D8E0F0;
  --color-link:          #2F5FA3;
  --color-link-hover:    #244C87;

  /* ─── SEMANTIC ALIASES ─── */

  /* Surfaces */
  --surface-base:        var(--neutral-50);    /* App background */
  --surface-card:        var(--neutral-0);     /* Cards, panels */
  --surface-sunken:      var(--neutral-100);   /* Input backgrounds, code blocks */
  --surface-overlay:     var(--neutral-0);     /* Modals, popovers */
  --surface-sidebar:     var(--neutral-100);   /* Navigation sidebar */

  /* Text */
  --text-primary:        var(--neutral-800);
  --text-secondary:      var(--neutral-500);
  --text-tertiary:       var(--neutral-400);
  --text-on-brand:       var(--neutral-0);
  --text-link:           var(--brand-500);

  /* Borders */
  --border-default:      var(--neutral-200);
  --border-strong:       var(--neutral-300);
  --border-brand:        var(--brand-400);

  /* Actions */
  --action-primary:      var(--brand-500);
  --action-primary-hover:var(--brand-600);
  --action-primary-text: var(--neutral-0);

  /* ─── ELEVATION ─── */
  --shadow-xs:  0 1px 2px rgba(15,14,13,0.04);
  --shadow-sm:  0 1px 3px rgba(15,14,13,0.06), 0 1px 2px rgba(15,14,13,0.04);
  --shadow-md:  0 4px 6px rgba(15,14,13,0.05), 0 2px 4px rgba(15,14,13,0.04);
  --shadow-lg:  0 10px 15px rgba(15,14,13,0.06), 0 4px 6px rgba(15,14,13,0.04);
  --shadow-xl:  0 20px 25px rgba(15,14,13,0.07), 0 8px 10px rgba(15,14,13,0.04);

  /* ─── RADIUS ─── */
  --radius-xs:  2px;
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl:  12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* ─── TRANSITION ─── */
  --transition-fast:   100ms ease;
  --transition-base:   160ms ease;
  --transition-slow:   240ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 4. Typography System

### Font Selection

| Role | Font | Why |
|------|------|-----|
| **Display / Hero** | Instrument Serif | Adds humanity and gravitas to key moments — the counterfactual reveal, report headers. Serifs communicate authority and permanence. Unusual enough to be distinctive. |
| **UI / Body** | Geist | Precision. Excellent at small sizes. Tabular numbers for data. Clean but warmer than Inter. Not overused. |
| **Code / Hashes** | Geist Mono | Audit hashes, dataset IDs, API keys. Consistent with Geist family. |

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

/* Geist via Vercel CDN */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body:    'Geist', -apple-system, sans-serif;
  --font-mono:    'Geist Mono', 'Fira Code', monospace;
}
```

### Type Scale

```css
/* Display — Instrument Serif, hero moments only */
--text-display-2xl: 3.5rem / 1.1 / letter-spacing: -0.02em;   /* 56px — Landing hero */
--text-display-xl:  2.75rem / 1.15 / letter-spacing: -0.02em; /* 44px — Page hero */
--text-display-lg:  2.25rem / 1.2 / letter-spacing: -0.015em; /* 36px — Section hero */

/* Heading — Geist, 600-700 weight */
--text-h1:  1.875rem / 1.25 / letter-spacing: -0.01em;  /* 30px */
--text-h2:  1.5rem / 1.3 / letter-spacing: -0.01em;     /* 24px */
--text-h3:  1.25rem / 1.35 / letter-spacing: -0.005em;  /* 20px */
--text-h4:  1.125rem / 1.4;                              /* 18px */
--text-h5:  1rem / 1.4;                                  /* 16px */

/* Body — Geist, 400 weight */
--text-body-lg: 1.0625rem / 1.65;   /* 17px — Report narrative, readable prose */
--text-body:    0.9375rem / 1.6;    /* 15px — Default body */
--text-body-sm: 0.875rem / 1.55;    /* 14px — Secondary info, labels */
--text-body-xs: 0.8125rem / 1.5;    /* 13px — Metadata, timestamps */

/* Mono */
--text-mono:    0.875rem / 1.6;     /* 14px — Code, hashes */
--text-mono-sm: 0.8125rem / 1.5;    /* 13px — Compact code */

/* Label — Uppercase tracking, used for section labels */
--text-label:    0.75rem / 1.4 / letter-spacing: 0.06em / uppercase;  /* 12px */
--text-label-sm: 0.6875rem / 1.4 / letter-spacing: 0.08em / uppercase; /* 11px */
```

### Typography Hierarchy in Practice

```
Page Title (h1, Geist 700, 30px)
  Section Label (label, 12px uppercase, --text-secondary)
    Card Title (h3, Geist 600, 20px)
      Body text (body, Geist 400, 15px, --text-primary)
        Secondary info (body-sm, Geist 400, 14px, --text-secondary)
          Metadata (body-xs, Geist 400, 13px, --text-tertiary)

Counterfactual reveal moment:
  Quote / Impact statement (Instrument Serif italic, 36px, --text-primary)
```

---

## 5. Color System

### Usage Rules

**Never use raw hex values in components.** Always reference semantic tokens.

```
Primary actions    → --action-primary (#2F5FA3)
Text               → --text-primary / --text-secondary / --text-tertiary  
Backgrounds        → --surface-base / --surface-card / --surface-sunken
Borders            → --border-default / --border-strong
Severity — GREEN   → --severity-green-* tokens
Severity — AMBER   → --severity-amber-* tokens
Severity — RED     → --severity-red-* tokens
```

### Severity Color Philosophy

The severity palette is **intentionally desaturated and muted.** This is a deliberate departure from typical "red = danger" alarm-bell UX.

The rationale: Equalyze is used by compliance officers and lawyers who need to think clearly under pressure. Garish red backgrounds create panic, not clarity. Our RED means "action required" — but it communicates it with the gravity of a legal document, not the urgency of a smoke alarm.

| Level | Background | Border | Text | Dot | Use |
|-------|-----------|--------|------|-----|-----|
| GREEN | #F0F7F0 | #AACDAA | #2A5E2A | #3D8B3D | Compliant — no action needed |
| AMBER | #FDF8EE | #E8D090 | #7A5A00 | #C49B00 | Monitor — investigate |
| RED | #FDF1F0 | #E8AAAA | #7A1F1F | #C43030 | Immediate action required |

### Accent Use

Brand blue (`--brand-500: #2F5FA3`) is used sparingly:
- Primary buttons
- Active navigation states
- Link text
- Focus rings
- Data point highlights in charts

It should never overwhelm a page. On any given screen, brand blue should touch < 10% of the visible area.

---

## 6. Spacing & Layout Grid

### Base Unit

All spacing is based on a **4px base unit.** Every spacing value is a multiple of 4.

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

### Layout Grid — Desktop

```
Total width:     1440px canvas
Content area:    1280px max-width, centered
Sidebar:         240px fixed width
Main content:    1040px (1280 - 240)
Columns:         12-column grid within main content area
Column gutter:   24px
Page padding:    48px horizontal on small desktop

Breakpoints:
  --bp-sm:   640px   (mobile landscape)
  --bp-md:   768px   (tablet)
  --bp-lg:   1024px  (small desktop — sidebar collapses to icon rail)
  --bp-xl:   1280px  (desktop)
  --bp-2xl:  1440px  (large desktop — content width caps)
```

### Layout Zones

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR — 56px height, full width, border-bottom        │
│  [Logo]  [Breadcrumb]              [Org]  [Avatar]      │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  SIDEBAR   │   MAIN CONTENT AREA                        │
│  240px     │   Flexible width                           │
│            │                                            │
│  [Nav]     │   [Page Header]                            │
│            │   [Content]                                │
│  fixed     │   padding: 32px                            │
│            │                                            │
│            │                                            │
└────────────┴────────────────────────────────────────────┘
```

### Card Anatomy

```
Card container:
  background:    --surface-card
  border:        1px solid --border-default
  border-radius: --radius-lg (8px)
  box-shadow:    --shadow-sm
  padding:       --space-6 (24px)

Card header:
  padding-bottom: --space-4 (16px)
  border-bottom:  1px solid --border-default
  margin-bottom:  --space-6 (24px)
  
  Title: --text-h4, --text-primary, Geist 600
  Subtitle: --text-body-sm, --text-secondary

Card body:
  gap between sections: --space-4 (16px)
```

---

## 7. Component Library

### 7.1 Buttons

```
PRIMARY BUTTON
  height:           36px
  padding:          0 16px
  background:       --action-primary
  color:            --text-on-brand
  font:             Geist 500, 14px
  border-radius:    --radius-md (6px)
  border:           none
  
  hover:   background → --action-primary-hover; transition: --transition-fast
  active:  scale(0.98)
  focus:   2px solid --color-focus-ring, 2px offset
  loading: spinner icon left, opacity 0.8, cursor not-allowed

SECONDARY BUTTON
  Same dimensions as primary
  background:  transparent
  border:      1px solid --border-strong
  color:       --text-primary
  hover:       background → --neutral-100

GHOST BUTTON
  background:  transparent
  border:      none
  color:       --text-secondary
  hover:       color → --text-primary; background → --neutral-100

DESTRUCTIVE BUTTON
  background:  #B91C1C (red-700)
  color:       white
  Use only for: delete audit, revoke access

ICON BUTTON (square)
  size:        32px × 32px
  Same hover as ghost
  icon size:   16px
```

### 7.2 Severity Badge

The most-used component in the product. Must be immediately readable at a glance.

```
SEVERITY BADGE ANATOMY
┌─────────────────────┐
│  ● GREEN / Compliant │  
└─────────────────────┘

  Dot:        6px circle, filled with --severity-*-dot color
  Text:       "GREEN", "AMBER", or "RED" + "/" + plain label
  Font:       Geist 500, 13px
  Colors:     background, border, text from --severity-* tokens
  Padding:    4px 10px
  Radius:     --radius-full (pill shape)
  
SEVERITY BADGE — LARGE (used in report headers)
  Same token mapping
  Padding:    8px 16px
  Font:       Geist 600, 14px
  Dot:        8px circle
  
SEVERITY PILL — TEXT ONLY (used in tables)
  No background — just colored text + dot
  Used when space is constrained
```

### 7.3 Counterfactual Twin Card

The hero component. This is what makes Equalyze unique visually. It must feel like a moment.

```
TWIN CARD LAYOUT
┌─────────────────────────────────────────────────────────────────┐
│  FINDING: Gender Bias in Loan Approval          🔴 RED — CRITICAL│
├────────────────────────────┬────────────────────────────────────┤
│  ORIGINAL APPLICANT        │  COUNTERFACTUAL TWIN               │
│  ─────────────────────     │  ─────────────────────             │
│  Name: Priya Sharma        │  Name: Rahul Sharma                │
│  Revenue: ₹28L/year        │  Revenue: ₹28L/year ✓              │
│  Credit: 714               │  Credit: 714 ✓                     │
│  Experience: 4 years       │  Experience: 4 years ✓             │
│  Region: Mumbai            │  Region: Mumbai ✓                  │
│  Gender: Female            │  Gender: Male  ← CHANGED           │
│                            │                                    │
│  ┌─────────────────────┐   │  ┌─────────────────────┐          │
│  │  ✗  REJECTED        │   │  │  ✓  APPROVED        │         │
│  │  12.5% interest     │   │  │  12.5% interest     │         │
│  └─────────────────────┘   │  └─────────────────────┘          │
├────────────────────────────┴────────────────────────────────────┤
│  "The only meaningful difference between these two applicants   │
│   is gender. The algorithm approved one and rejected the other."│
├─────────────────────────────────────────────────────────────────┤
│  Twin Quality Score: 0.94 ████████████████████░  Excellent      │
│  Attributes preserved: 11/12   Changed: gender (1)              │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed styling:**

```css
.twin-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.twin-card__header {
  padding: 16px 24px;
  background: var(--surface-sunken);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.twin-card__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* dividing line: */
  border-right: 1px solid var(--border-default); /* on left column */
}

.twin-card__profile {
  padding: 24px;
}

/* Profile rows */
.profile-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--neutral-100);
  font-size: 14px;
}

.profile-row--changed {
  background: var(--severity-amber-bg);
  padding: 6px 8px;
  margin: 0 -8px;
  border-radius: 4px;
}

.profile-row__preserved-icon {
  color: var(--severity-green-dot);
  font-size: 12px;
}

/* Outcome box */
.outcome-box {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 15px;
}

.outcome-box--rejected {
  background: var(--severity-red-bg);
  border: 1px solid var(--severity-red-border);
  color: var(--severity-red-text);
}

.outcome-box--approved {
  background: var(--severity-green-bg);
  border: 1px solid var(--severity-green-border);
  color: var(--severity-green-text);
}

/* Discrimination statement */
.twin-card__statement {
  padding: 16px 24px;
  border-top: 1px solid var(--border-default);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--surface-card);
}

/* Quality score bar */
.twin-card__quality {
  padding: 12px 24px;
  background: var(--surface-sunken);
  border-top: 1px solid var(--border-default);
  font-size: 13px;
  color: var(--text-secondary);
}
```

### 7.4 Metric Card

Used in the bias detection results grid.

```
METRIC CARD
┌──────────────────────────────────┐
│  Disparate Impact Ratio          │
│                                  │
│      0.61                        │  ← Large mono number, --text-primary
│                                  │
│  ████████████░░░░░░░░            │  ← Progress bar, colored by severity
│  Threshold: 0.80                 │
│                                  │
│  🔴 RED — 4/5ths Rule Violation  │
│                                  │
│  Female applicants approved at   │
│  61% the rate of male applicants │
│  in the same credit band.        │
└──────────────────────────────────┘

  Width: spans 4 columns (of 12) on desktop
  Padding: 24px
  Number: Geist Mono, 700, 36px, --text-primary
  Progress bar: 6px height, border-radius: full
    fill color: severity dot color
    track color: --neutral-200
```

### 7.5 Navigation Sidebar

```
SIDEBAR ANATOMY (240px wide)

┌──────────────────────────┐
│  Equalyze          [org] │  ← Logo + org switcher
├──────────────────────────┤
│                          │
│  Dashboard               │  ← Nav item (active)
│  Audits                  │
│  Reports                 │
│  Monitoring              │
│  Regulations             │
│                          │
├──────────────────────────┤
│  Settings                │
│  Help                    │
│                          │
│  [Avatar] Om Patil   ⌄   │  ← User menu
└──────────────────────────┘

NAV ITEM styling:
  padding:       8px 12px
  border-radius: --radius-md
  font:          Geist 500, 14px
  color:         --text-secondary
  
  active:
    background:  --brand-50
    color:       --brand-600
    font-weight: 600
  
  hover (inactive):
    background:  --neutral-100
    color:       --text-primary

SIDEBAR SECTION LABEL:
  font:          Geist 500, 11px uppercase, letter-spacing 0.08em
  color:         --text-tertiary
  padding:       16px 12px 6px
```

### 7.6 Data Table

Used for audit history, findings list.

```
TABLE STYLING

  Header row:
    background:   --surface-sunken
    border-bottom: 2px solid --border-default
    font:          Geist 600, 13px uppercase, letter-spacing 0.04em
    color:         --text-secondary
    padding:       10px 16px
  
  Body row:
    border-bottom: 1px solid --border-default
    padding:       14px 16px
    font:          Geist 400, 14px
    color:         --text-primary
    
    hover:
      background: --neutral-50
  
  Row — clickable (navigates to audit detail):
    cursor: pointer
    hover: background --brand-50

  Table wrapper:
    border: 1px solid --border-default
    border-radius: --radius-lg
    overflow: hidden
    box-shadow: --shadow-xs
```

### 7.7 Upload Drop Zone

```
UPLOAD ZONE (idle state)
┌─────────────────────────────────────────────────┐
│                                                 │
│           ↑  Upload Dataset                     │
│                                                 │
│     Drag & drop your CSV, XLSX, or JSON         │
│     or click to browse                          │
│                                                 │
│     Supported: CSV, XLSX, JSON · Max 500MB      │
│                                                 │
└─────────────────────────────────────────────────┘

  border:        2px dashed --border-strong
  border-radius: --radius-xl
  background:    --surface-sunken
  padding:       48px 32px
  text-align:    center
  
  Icon: 32px upload arrow, --text-tertiary
  Title: Geist 600, 15px, --text-primary
  Subtitle: Geist 400, 14px, --text-secondary
  
  drag-over state:
    border-color:  --brand-400
    background:    --brand-50
    icon color:    --brand-500
    transition:    all 160ms ease

  uploading state:
    border-style:  solid
    Shows: filename, file size, progress bar, cancel button
    Progress bar: 4px height, --brand-500 fill
```

### 7.8 Schema Mapper

```
SCHEMA MAPPER ROW
┌────────────────────────────────────────────────────────────────────┐
│ gender          │ female, male, other  │  [Protected Attribute ▾]  │
│ annual_revenue  │ 280000, 450000       │  [Valid Factor        ▾]  │
│ loan_approved   │ 0, 1                 │  [Outcome             ▾]  │
│ applicant_id    │ APP-001, APP-002     │  [Identifier          ▾]  │
└────────────────────────────────────────────────────────────────────┘

  Column 1: Column name — Geist Mono, 14px
  Column 2: Sample values — Geist 400, 13px, --text-secondary, max 2 values shown
  Column 3: Dropdown tag selector
  
  AI-suggested tag:
    shown with a subtle blue dot on the left
    tooltip: "Suggested by Equalyze AI — click to confirm or change"
  
  Proxy warning indicator:
    ⚠ icon in amber, right of tag dropdown
    hover tooltip: "This column correlates 0.78 with 'race' — potential proxy"
  
  Confirmed row:
    left border: 3px solid --severity-green-dot
    
  Error row (untagged):
    left border: 3px solid --severity-red-dot
```

### 7.9 Audit Progress Tracker

Shown while agents are running. Must make the wait feel meaningful.

```
AGENT PROGRESS PANEL
┌─────────────────────────────────────────────────────────────────┐
│  Running Audit — Estimated 4 min remaining                      │
├─────────────────────────────────────────────────────────────────┤
│  ✓  Ingestion & Schema Validation         Completed · 0:23     │
│  ✓  Bias Detection (5 metrics)            Completed · 1:12     │
│  ⟳  Counterfactual Twin Generation        Running...           │
│  ○  Legal Exposure Analysis               Queued              │
│  ○  Remediation Strategies               Queued              │
│  ○  Report Generation                    Queued              │
└─────────────────────────────────────────────────────────────────┘

  ✓ completed:  green check, --severity-green-dot
  ⟳ running:   animated spinner, --brand-500; row background --brand-50
  ○ queued:    empty circle, --neutral-300

  Running row animation:
    subtle shimmer on the row background (left to right, 2s loop)
    spinner: 16px, rotates 360deg in 800ms, linear
```

### 7.10 Toast / Notification

```
TOAST (bottom-right, stacked)
┌────────────────────────────────────────┐
│  ✓  Audit report ready                 │
│     View Report →                      │
└────────────────────────────────────────┘

  width:        360px
  background:   --neutral-800 (dark toast on light UI)
  color:        --neutral-0
  border-radius: --radius-lg
  padding:      14px 16px
  box-shadow:   --shadow-xl
  
  Variants:
    success:  left border 3px --severity-green-dot
    warning:  left border 3px --severity-amber-dot
    error:    left border 3px --severity-red-dot
    info:     left border 3px --brand-400
  
  Entry animation: slide up 12px + fade in, 200ms ease-out
  Exit animation:  slide down + fade out, 160ms ease-in
  Auto-dismiss:    6 seconds (with progress bar on bottom of toast)
```

---

## 8. Icon & Illustration System

### Icon Library

Use **Lucide Icons** (open source, clean, stroke-based, consistent weight).

Key icons used in Equalyze:

```
Navigation:
  LayoutDashboard  → Dashboard
  ClipboardList    → Audits
  FileText         → Reports
  Activity         → Monitoring
  Scale            → Regulations
  Settings         → Settings

Actions:
  Upload           → Upload dataset
  Play             → Run audit
  Download         → Download report
  Share2           → Share report
  RefreshCw        → Re-run audit

Status:
  CheckCircle2     → Completed / Compliant
  AlertTriangle    → Warning / Amber
  XCircle          → Failed / Red
  Clock            → Running / Queued
  Loader2          → Spinner (animated)

Data:
  BarChart3        → Metrics
  TrendingUp       → Bias drift trend
  GitCompare       → Counterfactual twin (key icon — use consistently)
  Fingerprint      → Audit trail / Chain of custody
  Scale            → Legal exposure
  Lightbulb        → Remediation suggestion
  Database         → Dataset
  Hash             → Audit ID / Hash
```

**Icon size standards:**
- Navigation: 18px
- Button icons: 16px
- Inline icons (in text): 14px
- Empty state: 40px, --text-tertiary
- Hero icons: 48px

### Empty State Illustrations

Use simple SVG line illustrations — not stock art, not Lottie animations. Each major empty state has a distinct minimal illustration.

```
Empty: No audits yet
  Illustration: Simple outline of a document with a magnifying glass
  Title: "No audits yet"
  Body: "Upload a dataset to run your first bias audit."
  CTA: Primary button "Upload Dataset"

Empty: No findings (clean audit)
  Illustration: Simple checkmark shield outline
  Title: "No bias detected"
  Body: "This model passed all fairness checks across all protected attributes."
  Note: Small text — "Results reflect the dataset provided. Schedule re-audits as your model evolves."

Empty: Audit running
  → Use Audit Progress Tracker component (section 7.9), not an empty state
```

---

## 9. Motion & Animation Principles

### Philosophy

Motion should **inform, not entertain.** In an audit tool used by compliance officers, animations that feel playful undermine trust. Every animation serves one of three purposes:
1. Show that something changed
2. Guide attention to what matters
3. Provide feedback that an action worked

### Animation Tokens

```css
/* Duration */
--duration-instant:  0ms     /* No animation — immediate feedback */
--duration-fast:     100ms   /* Micro-interactions: hover states, button press */
--duration-base:     160ms   /* Default transitions: color, border, shadow */
--duration-moderate: 240ms   /* Panel open/close, dropdown */
--duration-slow:     400ms   /* Page transitions, modals */
--duration-crawl:    600ms   /* Onboarding, first-load reveals */

/* Easing */
--ease-standard: cubic-bezier(0.2, 0, 0, 1)     /* Most UI transitions */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1)   /* Elements entering (slide in) */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1)   /* Elements leaving (slide out) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) /* Badge pop, severity reveal */
```

### Key Moments

**1. Severity Badge Reveal (most important)**  
When bias detection completes and the severity badge appears for the first time:
- Badge scales from 0.7 → 1.0 with `--ease-spring` over 300ms
- Preceded by a 80ms delay after its parent card renders
- Never flash or pulse — just the one pop

**2. Counterfactual Twin Card Entrance**  
- Card slides up 16px + fades in over 400ms `--ease-decelerate`
- Left column renders first (0ms delay)
- Right column renders with 120ms delay — creating a left-to-right reveal that draws the eye to the contrast

**3. Agent Progress Step Completion**  
- Spinner → Checkmark: cross-fade, 160ms
- Row background: transitions from --brand-50 to transparent, 400ms
- Next queued row: gains spinner, 100ms after prior step completes

**4. Metric Progress Bar**  
- On first render: fill animates from 0% → actual value over 600ms `--ease-decelerate`
- Stagger: each metric bar starts 80ms after the previous

**5. Number Count-Up (metric values)**  
- When metric cards first appear, numbers count up from 0 to the final value
- Duration: 800ms, easing: ease-out
- Applies to: DImpact ratio (0.00 → 0.61), score percentages

**6. Page Transitions**  
- Route change: content area fades out (100ms) → new content fades in (200ms)
- Sidebar navigation item: instant (no transition) — avoids feeling sluggish

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Phase 1 — Core Screens (MVP Demo)

These 8 screens are the minimum required to demonstrate the full audit flow. Build these first.

---

### Screen 1.1 — Login / Onboarding

**Purpose:** Entry point. Sets the tone immediately.

**Layout:**
```
Full-page split:
  Left (55%):  Form area
  Right (45%): Brand panel (static, no image)
```

**Left panel:**
```
Centered vertically and horizontally

  Equalyze                          ← Wordmark, 24px Geist 700
  
  Sign in to your workspace
  ← h2, Instrument Serif, 32px, --text-primary

  [Email address                ]
  [Password                     ] [Show]
  
  [Sign in →]                      ← Primary button, full width
  
  ─── or ───
  
  [G] Continue with Google
  
  Don't have an account? Request access →
```

**Right panel (brand):**
```
Background: --brand-700 (#1A3968)
Content (centered):

  "Make the invisible, visible."
  ← Instrument Serif italic, 28px, --neutral-0, opacity 0.9

  A thin horizontal rule (40px wide, --neutral-0, opacity 0.3)

  Three stacked stat callouts (white text):
  
  ┌─────────────────────────────────┐
  │  63M                            │
  │  MSMEs in India affected        │
  │  by algorithmic lending bias    │
  └─────────────────────────────────┘
  
  Same format for:
  "1 in 8 — Healthcare AI models flagged for demographic disparity"
  "€30M — Maximum EU AI Act fine for non-compliance"
  
  These are the stakes. Static text. No animation.
```

---

### Screen 1.2 — Organization Dashboard

**Purpose:** First screen after login. Shows all audits, bias trend, quick actions.

**Layout:** Standard sidebar + main content.

**Main content zones:**

```
Zone A — Page header (padding-bottom: 32px)
  Title:    "Dashboard"  ← h1, 30px
  Subtitle: "Meridian Capital NBFC · 3 models audited"  ← body-sm, --text-secondary
  CTA:      [+ New Audit]  ← primary button, top-right

Zone B — Summary stats row (4 cards, 25% each, 16px gap)
  
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │  3           │ │  2           │ │  1           │ │  11          │
  │  Audits run  │ │  🔴 RED      │ │  🟡 AMBER    │ │  Total       │
  │  this month  │ │  findings    │ │  finding     │ │  findings    │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
  
  Number: Geist 700, 28px
  Label:  Geist 400, 13px, --text-secondary

Zone C — Bias Drift Chart (full width, 240px height)

  Card with title: "Bias Score Trend — Last 6 Months"
  Line chart (Recharts or custom SVG):
    Y-axis: Bias Severity Score (0–1)
    X-axis: Months
    Lines: one per model, each a distinct brand-scale color
    Reference line at 0.33 (GREEN threshold) — dashed, --neutral-300
    Reference line at 0.66 (AMBER threshold) — dashed, --severity-amber-border
    Hover tooltip: shows score per model for that month
  
  Right of chart title: [View all models ↗]

Zone D — Recent Audits Table
  Card with title: "Recent Audits"  [View all →]
  
  Columns: Model Name | Domain | Date | Protected Attributes | Severity | Action
  
  Row example:
    MSME Credit Scorer v2 | Lending | Apr 18, 2026 | Gender, Region | 🔴 RED | View Report →
    Patient Risk Model     | Healthcare | Apr 12, 2026 | Age, Zip Code | 🟡 AMBER | View Report →
```

---

### Screen 1.3 — New Audit: Step 1 — Upload

**Purpose:** Dataset upload. Clean, distraction-free wizard.

**Layout:** Centered single-column wizard (max-width 720px), no sidebar content needed — sidebar stays visible but content is focused.

```
Step indicator (top of content):
  ① Upload  →  ② Schema  →  ③ Review  →  ④ Run
  
  Active step: --brand-500 dot + label
  Completed: --severity-green-dot + label
  Upcoming: --neutral-300 dot + --text-tertiary label

Card — Model Information
  Model name:        [text input]
  Domain:            [dropdown: Healthcare / Lending / Insurance / Hiring / Other]
  Jurisdiction:      [multi-select: India / EU / USA / Global]
  Deployment date:   [date picker]

Card — Dataset Upload
  [Drop Zone — see 7.7]
  
  After upload success:
  ┌──────────────────────────────────────────────┐
  │  ✓  lending_applications_q1_2026.csv         │
  │     12,847 rows · 18 columns · 3.2 MB       │
  │                                [Remove]      │
  └──────────────────────────────────────────────┘
  
  Background hash computation shown:
  "Computing dataset fingerprint...  SHA-256: a3f9bc..."
  (This communicates the audit trail / integrity feature naturally)

[Continue →]  ← primary button, bottom-right
```

---

### Screen 1.4 — New Audit: Step 2 — Schema Mapping

**Purpose:** The user confirms which columns are protected attributes, valid factors, and the outcome. AI suggestions are pre-filled.

```
Top notice banner (blue):
  ℹ  "Equalyze has analyzed your dataset and suggested column tags below.
     Review and confirm before running the audit."

AI Suggested:
  [Schema Mapper table — see component 7.8]
  
  Full table of all 18 columns.
  12 auto-tagged with high confidence (shown with blue dot).
  2 proxy warnings shown (gender-adjacent columns).
  
  Below table:
  ┌──────────────────────────────────────────────────────────┐
  │  ⚠  Proxy Warning — 2 columns flagged                   │
  │                                                          │
  │  "zip_code" correlates with demographic group at 0.74   │
  │  confidence. If retained as a valid factor, it may      │
  │  act as a proxy for race/socioeconomic status.          │
  │                                                          │
  │  [Mark as Protected]   [Keep as Valid Factor]           │
  └──────────────────────────────────────────────────────────┘

Bottom:
  [← Back]   [Run Audit →]  ← disabled until all columns tagged
```

---

### Screen 1.5 — Audit Running

**Purpose:** Shows real-time agent progress. Makes the wait feel transparent.

```
Centered content (max-width 600px)

  Running bias audit on
  "MSME Credit Scorer v2"
  ← Instrument Serif, 28px

  Started 1:43 PM · Est. 4 min remaining

  [Agent Progress Tracker — component 7.9]

  Currently active agent callout:
  ┌────────────────────────────────────────────────────────┐
  │  ⟳ Counterfactual Twin Generation                      │
  │                                                        │
  │  Analyzing gender bias in loan approvals. Generating   │
  │  adversarial examples to demonstrate discrimination.   │
  │                                                        │
  │  This is the most computationally intensive step.      │
  └────────────────────────────────────────────────────────┘
  
  This copy changes per active agent. It educates the user 
  about what each agent does while they wait.

  [Cancel Audit]  ← ghost button, small, --text-tertiary
```

---

### Screen 1.6 — Audit Results Overview

**Purpose:** The main results screen. Most important screen in the product.

```
Page header:
  MSME Credit Scorer v2    🔴 RED — Immediate Action Required
  Audit · Apr 19, 2026 · 12,847 records · 18 columns
  [Download Report ↓]  [Share ↗]  [Re-run Audit]

Tab bar:
  [Overview]  [Findings]  [Bias Genealogy]  [Legal Exposure]  [Remediation]  [Report]

── OVERVIEW TAB ──

Zone A: Severity summary strip (full width)
  5 metric cards in a row (see component 7.4):
  Demographic Parity | Disparate Impact | Equalized Odds | FPR Parity | Individual Fairness

Zone B: Findings summary (left 60% / right 40% split)
  
  LEFT: "3 Findings Detected"
    Stacked finding cards:
    ┌────────────────────────────────────────────────────────┐
    │  Gender Bias in Loan Approval    🔴 RED — Critical    │
    │  Disparate Impact Ratio: 0.61 (threshold: 0.80)       │
    │  Legal Risk: HIGH — RBI Fair Practices Code           │
    │                               [View Finding →]        │
    └────────────────────────────────────────────────────────┘
    [+ 2 more findings]
  
  RIGHT: "Protected Attributes Audited"
    Horizontal bar chart:
    Gender      ████████████████ 0.72 🔴
    Region      ████████░░░░░░░░ 0.45 🟡
    Age         ██░░░░░░░░░░░░░░ 0.18 🟢
    
    Y: attribute name
    X: severity score 0–1
    Bar color: severity color

Zone C: The twin preview (teaser for the findings tab)
  Card with label "EVIDENCE OF DISCRIMINATION"
  Shows one counterfactual twin card (component 7.3)
  CTA below: "View all counterfactual twins →"
```

---

### Screen 1.7 — Finding Detail + Counterfactual Twin

**Purpose:** The "gut punch" moment. The judge / client sees undeniable proof.

```
Breadcrumb: Audits / MSME Credit Scorer v2 / Gender Bias in Loan Approval

Finding header:
  Gender Bias in Loan Approval
  ← Instrument Serif, 32px, --text-primary
  🔴 RED — Immediate Action Required

Two-column layout (left 65% / right 35%):

LEFT — Finding detail:

  Section: "What was detected"
  ─────────────────────────────────
  Body text (--text-body-lg, Geist 400):
  "Female applicants are being approved at 61% the rate of male 
   applicants with identical financial profiles. This violates the 
   4/5ths rule — the legal threshold for disparate impact."
  
  Metric table:
  ┌─────────────────────┬──────────┬───────────┬────────┐
  │ Metric              │ Value    │ Threshold │ Status │
  ├─────────────────────┼──────────┼───────────┼────────┤
  │ Disparate Impact    │ 0.61     │ ≥ 0.80    │ 🔴 RED │
  │ Demographic Parity  │ 0.24     │ < 0.10    │ 🔴 RED │
  │ Equalized Odds      │ 0.18     │ < 0.10    │ 🟡 AMB │
  └─────────────────────┴──────────┴───────────┴────────┘

  Section: "Counterfactual Evidence"
  ─────────────────────────────────
  [Full Twin Card — component 7.3]
  [Second twin card if available]

RIGHT — sidebar context:

  Card: Legal Exposure
  ┌─────────────────────────────┐
  │  Legal Exposure: HIGH       │
  │                             │
  │  RBI Fair Practices Code    │
  │  Para 3 — Non-discrimination│
  │  in credit                  │
  │                             │
  │  DPDPA 2023                 │
  │  Section 8 — Accountability │
  │  for automated decisions    │
  │                             │
  │  [View full legal analysis] │
  └─────────────────────────────┘
  
  Card: Recommended Action
  ┌─────────────────────────────┐
  │  Priority: Immediate        │
  │                             │
  │  1. Remove gender proxy     │
  │     variables from training │
  │  2. Apply threshold         │
  │     calibration per group   │
  │  3. Re-audit within 30 days │
  │                             │
  │  [View remediation plan →]  │
  └─────────────────────────────┘
```

---

### Screen 1.8 — Bias Receipt (Report View)

**Purpose:** The compliance officer downloads this. The lawyer files it. It must look like a document, not an app screen.

**Layout:** Full-width centered document reader (max-width 860px). No sidebar. Thin topbar with [← Back] and [Download PDF].

```
DOCUMENT HEADER
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Equalyze                          BIAS RECEIPT               │
│                                                                │
│  Meridian Capital NBFC                                         │
│  MSME Credit Scorer v2 · Lending · India                      │
│                                                                │
│  Audit ID:   EQ-2026-04-19-A7F3                               │
│  Date:       April 19, 2026                                    │
│  Dataset:    lending_applications_q1_2026.csv                  │
│  Hash:       a3f9bc2d...8e4f (SHA-256)                        │
│                                                                │
│  Overall Result:    🔴  IMMEDIATE ACTION REQUIRED             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

DOCUMENT SECTIONS (reading flow):

1. EXECUTIVE SUMMARY (collapsible — defaults open)
   Plain prose, Geist 400, 17px line-height 1.7
   Max 3 paragraphs.

2. FINDINGS (one section per finding)
   Finding header: H2, Instrument Serif, 26px
   Severity badge — large variant
   Metric table
   Counterfactual twin card (slightly compact version for print)
   Discrimination statement: Instrument Serif italic, 19px, indented

3. LEGAL EXPOSURE
   Per finding: regulation name → article → risk level → remediation required
   Formatted like a legal document — clear hierarchy, no decorative elements

4. REMEDIATION PLAN
   Numbered list of recommended actions, grouped by effort

5. AUDIT CHAIN OF CUSTODY
   Monospaced block:
   Audit initiated by: om@meridian.in
   Dataset hash: a3f9bc2d...
   Report hash:  f7e2ac1b...
   Equalyze version: 1.0.0
   Generated: 2026-04-19T13:47:22Z

Footer (every page in PDF export):
  "Generated by Equalyze · Confidential · Page N of M"
```

---

## 11. Phase 2 — Extended Screens (Post-Demo)

Build these after the Phase 1 demo screens are polished.

---

### Screen 2.1 — Bias Genealogy Tree

**Purpose:** Shows where in the pipeline the bias entered.

```
Full-width canvas (no max-width constraint — it's a diagram)

  Top: "Bias Genealogy — Gender Bias in MSME Credit Scorer v2"
  
  Vertical tree, top to bottom:
  
  [Raw Data Collection]
    → "Historical loan applications 2018–2025"
    → "Female applicants: 23% of dataset (population: 48%)"
    → Contribution: 41% of total bias score
    → 🔴 Underrepresentation at source
  
  ↓ arrow
  
  [Feature Engineering]
    → "'Residential area' column correlates 0.74 with gender"
    → "'Business category' skewed by historical female exclusion"
    → Contribution: 35% of total bias score
    → 🔴 Proxy variable introduced
  
  ↓ arrow
  
  [Model Training]
    → "XGBoost model amplified proxy variable weight"
    → "Gender-correlated features: 3 of top 5 importance features"
    → Contribution: 24% of total bias score
    → 🟡 Amplification in training
  
  ↓ arrow
  
  [Deployment Feedback Loop]
    → "Cannot assess from static dataset"
    → "Schedule live monitoring to detect feedback reinforcement"
    → 🔵 Monitor

Each node: card with colored left border (severity color), icon, text, contribution bar.
```

### Screen 2.2 — Legal Exposure Full View

Map of all regulations × all findings in a matrix.

### Screen 2.3 — Remediation Center

Full remediation plans with code snippets (syntax highlighted), implementation checklists, effort estimates.

### Screen 2.4 — Monitoring Dashboard

Bias drift trend lines per model. Alert configuration. Scheduled re-audit calendar.

### Screen 2.5 — Organization Settings

Members, roles, audit retention policy, notification preferences, API key management.

### Screen 2.6 — Shared Report View (Public Link)

Read-only version of Screen 1.8. Accessible via share token. Watermarked. No sidebar.

---

## 12. Phase 3 — Mobile Responsive

Apply these overrides after all desktop screens are complete.

### Breakpoint Strategy

```
< 640px  (mobile):  Single column. Sidebar becomes bottom navigation.
640–1024px (tablet): Sidebar collapses to 56px icon rail.
> 1024px (desktop): Full layout as designed.
```

### Mobile Navigation

```
BOTTOM NAV BAR (mobile, fixed, 56px height)
┌──────────────────────────────────────────────┐
│  [🏠]     [📋]     [📄]     [📊]     [⚙️]    │
│  Home   Audits  Reports Monitor Settings     │
└──────────────────────────────────────────────┘

Active icon: --brand-500 fill
Inactive: --neutral-400 stroke
Label: 10px below icon, --text-tertiary
```

### Mobile Layout Adjustments

```
Twin Card:
  Stack columns vertically (original on top, twin below)
  Add "vs." divider between them
  Full width

Metric Cards:
  2-column grid instead of 5-column row
  Reduce number size: 28px → 22px

Schema Mapper:
  Horizontal scroll on table
  Minimum column widths enforced
  Tag dropdown → bottom sheet on mobile

Navigation:
  Topbar: Logo + Avatar only (breadcrumb hidden on mobile)
  Page title moves under topbar as mobile page header
```

---

## 13. Accessibility Standards

### Requirements

- **WCAG 2.1 AA** minimum on all screens
- All interactive elements keyboard navigable
- Focus indicators: 2px solid --color-focus-ring, 2px offset (never hidden)
- Color is never the **only** indicator of state — always paired with icon or text

### Contrast Ratios

```
--text-primary on --surface-base:   15.2:1  ✓ AAA
--text-secondary on --surface-base:  7.1:1  ✓ AA
--text-tertiary on --surface-base:   4.8:1  ✓ AA (minimum met)
--text-on-brand on --action-primary: 5.2:1  ✓ AA

Severity text on severity background:
  GREEN: #2A5E2A on #F0F7F0  → 7.4:1 ✓ AA
  AMBER: #7A5A00 on #FDF8EE  → 6.9:1 ✓ AA
  RED:   #7A1F1F on #FDF1F0  → 7.1:1 ✓ AA
```

### ARIA Landmarks

```html
<header role="banner">     <!-- Topbar -->
<nav role="navigation">    <!-- Sidebar, bottom nav -->
<main role="main">         <!-- Page content -->
<aside role="complementary"> <!-- Right sidebar / context panel -->
<footer role="contentinfo">  <!-- Report footer -->
```

### Severity Badge Accessibility

```html
<!-- Never rely on color alone -->
<span class="severity-badge severity-badge--red" role="status" aria-label="Severity: Red - Immediate action required">
  <span aria-hidden="true">●</span>
  RED — Immediate Action Required
</span>
```

---

## 14. Implementation Handoff Notes

### Build Order (Phase 1)

```
Week 1:
  Day 1–2:  Design tokens (CSS vars) + Typography setup + Geist/Instrument Serif fonts
  Day 2–3:  Core components: Button, Badge, Card, Input, Dropdown
  Day 3–4:  Sidebar + Topbar + Layout shell
  Day 4–5:  Screen 1.2 (Dashboard) — proves the layout works end to end

Week 2:
  Day 6–7:  Upload flow (Screens 1.3 + 1.4)
  Day 7–8:  Running screen (Screen 1.5) + WebSocket progress integration
  Day 8–9:  Results overview (Screen 1.6)
  Day 9–10: Finding detail + Twin card (Screen 1.7) — this is the hero moment
  Day 10:   Report view (Screen 1.8) + PDF export

Week 3:
  Polish pass: Motion, transitions, empty states, responsive, accessibility audit
```

### CSS Architecture

Use CSS custom properties + Tailwind CSS with a custom config that maps all tokens.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F3F9',
          500: '#2F5FA3',
          600: '#244C87',
          700: '#1A3968',
        },
        severity: {
          'green-bg': '#F0F7F0',
          'green-text': '#2A5E2A',
          'amber-bg': '#FDF8EE',
          'amber-text': '#7A5A00',
          'red-bg': '#FDF1F0',
          'red-text': '#7A1F1F',
        }
      },
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Geist', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      }
    }
  }
}
```

### Component File Naming

```
components/
  ui/
    Button.tsx          → All button variants
    Badge.tsx           → SeverityBadge + variants
    Card.tsx            → Base card + header/body/footer
    Input.tsx
    Select.tsx
    Table.tsx
    Toast.tsx
    Progress.tsx        → Progress bar + metric bar
  audit/
    TwinCard.tsx        → Counterfactual twin card
    MetricCard.tsx
    AgentProgress.tsx
    FindingCard.tsx
    SchemaMapper.tsx
    DropZone.tsx
  report/
    BiasReceipt.tsx
    AuditHeader.tsx
    LegalExposure.tsx
    ChainOfCustody.tsx
  charts/
    BiasDriftChart.tsx
    AttributeBarChart.tsx
    MetricGauge.tsx
```

### Key Design Decisions to Lock In Early

1. **Instrument Serif is non-negotiable** for the counterfactual statement quote. This is the one moment of humanity in the product — the serif creates a pause, a gravitas that sans-serif cannot achieve.

2. **The severity palette must stay desaturated.** Do not let anyone "make the red redder." The current palette is calibrated to communicate urgency without panic.

3. **The twin card columns must be equal width.** Any visual imbalance between the two profiles suggests one is "more real" than the other. They must feel identical except for the outcome — that's the whole point.

4. **No skeleton loaders on the audit results page.** Use the Agent Progress Tracker (Screen 1.5) as the loading state. When the user reaches Screen 1.6, everything is already loaded. Progressive skeletons in a bias audit feel trivial — the wait should be front-loaded and transparent.

5. **Report view (Screen 1.8) must print well.** Test in browser print mode before shipping. The PDF is the product for compliance teams.

---

*Equalyze Design File v1.0 — Team Trident — April 2026*  
*All measurements in px unless noted. All colors defined as CSS custom properties.*
