---
name: KonterKu Warm Directory
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fe'
  surface-container: '#ebedf9'
  surface-container-high: '#e5e8f3'
  surface-container-highest: '#dfe2ed'
  on-surface: '#181c23'
  on-surface-variant: '#4d4634'
  inverse-surface: '#2c3039'
  inverse-on-surface: '#eef0fc'
  outline: '#7e7662'
  outline-variant: '#d0c6ae'
  surface-tint: '#725c00'
  primary: '#725c00'
  on-primary: '#ffffff'
  primary-container: '#ffd84d'
  on-primary-container: '#735e00'
  inverse-primary: '#e9c339'
  secondary: '#006d30'
  on-secondary: '#ffffff'
  secondary-container: '#92f5a4'
  on-secondary-container: '#007233'
  tertiary: '#745b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffd763'
  on-tertiary-container: '#765d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe07e'
  primary-fixed-dim: '#e9c339'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#564500'
  secondary-fixed: '#95f8a7'
  secondary-fixed-dim: '#79db8d'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffe08c'
  tertiary-fixed-dim: '#efc12a'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#dfe2ed'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an approachable, trustworthy, and distinctly local visual atmosphere tailored for grassroots telecommunication kiosks, local pulsa retailers, and micro-entrepreneurs across Indonesia. Balancing neighborhood friendliness with modern digital clarity, the aesthetic pulls inspiration from tactile storefront warmth and clear utility.

### Visual Style
- **Warm Modern Softness:** Blends structural clarity with rounded, comforting forms. Crisp white content surfaces rest atop light neutral backdrops, anchored by an iconic warm-canary yellow vertical rail.
- **Friendly Professionalism:** Avoids sterile SaaS tropes in favor of soft silhouettes, friendly proportions, and clear legibility suited for both mobile users on street corners and desktop operators.
- **Atmospheric Warmth:** Surfaces feel approachable rather than clinical, using soft elevation layers, gentle light transitions, and high-visibility status indicators.

## Colors

The color palette centers around the vibrant energy of Indonesian retail life: vivid canary yellow representing accessibility and optimism, balanced by a deep charcoal neutral that ensures high contrast and clarity.

### Functional Palette Structure
- **Primary (`#FFD84D`):** The signature canopy yellow, used exclusively for high-level spatial anchors such as the rounded navigation rail, active states, key highlight pills, and featured badges.
- **Primary Hover (`#F4C62F`):** Deepened amber yellow providing immediate feedback for interactive elements.
- **Primary Surface Tint (`#FFF7D6`):** Soft butter cream used for subtle badge fills, selected table rows, and alert banners.
- **Secondary (`#15803D`):** Direct-action evergreen green, reserved for WhatsApp direct contact buttons, active status dots ("Buka/Tersedia"), and verified merchant checkmarks.
- **Secondary Hover (`#166534`):** Saturated deep forest green for button engagement states.
- **Neutral Dark (`#20242C`):** High-legibility charcoal for headlines, store names, and primary copy.
- **Neutral Subdued (`#596273`):** Slate gray for secondary metadata, operating hours, and location descriptions.
- **Canvas (`#F4F5F7`):** Calming, soft atmospheric background that makes white content modules stand forward.
- **Surface (`#FFFFFF`):** Pure white for cards, sheets, and elevated direct-action modules.
- **Border / Divider (`#E2E5EA`):** Subtle hairline delineation to maintain clean structure without heavy visual weight.

## Typography

The design system standardizes on **Plus Jakarta Sans** across all roles to achieve an open, contemporary Indonesian digital aesthetic. The font’s balanced aperture and generous x-height ensure effortless legibility of phone numbers, pricing per Gigabyte, and street-level addresses.

### Typographic Rules
- **Numerical Clarity:** When displaying provider balances, pulsa pricing, and mobile numbers, set tabular figures or use `label-lg` to guarantee vertical column alignment.
- **Headings:** Bold and semi-bold weights deliver immediate brand recognition without shouting. Negative tracking is applied exclusively to large headings.
- **Labels & Tags:** Uppercase usage is strictly reserved for `label-sm` (e.g., "TERVERIFIKASI", "BUKA", "PROMO"). All other tags preserve natural casing.

## Layout & Spacing

The spatial architecture mimics an organized desktop terminal framed by an ergonomic utility bar.

### Grid & Layout Archetype
- **Desktop Shell (≥1024px):** Fixed left navigation rail (`88px` wide) featuring pill-shaped interactive anchors, alongside a fluid content workspace with a max constraint of `1440px`. The main workspace divides into a primary 12-column directory grid and an optional 4-column contextual detail drawer.
- **Tablet (768px – 1023px):** Navigational rail collapses to an adaptive top bar or compact vertical spine, with an 8-column card grid.
- **Mobile (<768px):** Left rail transforms into a floating bottom tab bar (`64px` height) with rounded upper edges. Content flows in a single column with full-width cards and horizontal filter carousels.

### Rhythmic Discipline
- Outer margins scale from `1rem` on mobile to `2rem` on desktop.
- Component gutters inside directory cards maintain strict `space-sm` and `space-md` increments to keep metadata groupings compact and quickly scannable.

## Elevation & Depth

Visual hierarchy uses ultra-soft ambient diffusion combined with crisp boundary containment, mirroring the reference composition's clean floating surfaces.

### Tonal Hierarchy
- **Level 0 (Canvas Base):** Flat `#F4F5F7` backdrop.
- **Level 1 (Direct Cards & Rails):** Pure `#FFFFFF` surfaces with subtle border `1px solid #E2E5EA` and ambient shadow: `0 4px 20px -2px rgba(32, 36, 44, 0.04)`.
- **Level 2 (Elevated Directory Hubs & Active Focus):** Key browsing panels feature expanded lift: `0 12px 32px -4px rgba(32, 36, 44, 0.08)`, creating separation over surrounding neutral elements.
- **Level 3 (Modal Sheets & Interactive Flyouts):** `0 24px 48px -12px rgba(32, 36, 44, 0.16)`.

### Border Discipline
Shadows are never left uncontained; every elevated white card incorporates a `1px` perimeter border (`#E2E5EA`) to protect structure in bright light environments.

## Shapes

The geometric vocabulary prioritizes organic, friendly silhouettes with exaggerated radii on major panels, counterbalanced by structured medium radii on interior elements.

### Curvature Taxonomy
- **The Signature Rail:** Navigation bar elements and the left rail shell feature pill treatments and custom corner arcs up to `32px`, conveying warmth and touch accessibility.
- **Directory Panels & Feature Containers:** Outer containers adopt `24px` to `28px` corner radiuses (`rounded-xl` to custom smooth shells).
- **Cards & Micro Modules:** Counter listing cards adopt `16px` (`rounded-lg`).
- **Pills, Filters, and Primary Action Buttons:** Fully rounded pill capsules (`9999px`) or `12px` soften user inputs and evoke mobile-native gestures.

## Components

### Buttons
- **WhatsApp Action Button:** High-contrast conversion trigger. Background `#15803D`, text `#FFFFFF`, bold `label-lg`, with `12px` rounded corners or full pill format. Includes an integrated WhatsApp icon. Hover state transitions to `#166534`.
- **Primary Brand Button:** Background `#FFD84D`, text `#20242C`, font weight `600`. Hover `#F4C62F`.
- **Secondary / Ghost Button:** Background transparent, border `1px solid #E2E5EA`, text `#20242C`. Hover brings a `#F4F5F7` background fill.

### Directory Cards (Kartu Konter)
- **Container:** Pure `#FFFFFF` background, `16px` border radius, `1px solid #E2E5EA` border, subtle ambient drop shadow.
- **Header:** Merchant name in `headline-sm`, complemented by a verified checkmark badge (`#15803D`) and real-time open status indicator.
- **Metadata Body:** Visual thumbnail of the counter front or provider logos, accompanied by location text (`body-sm`), distance metrics, and top provider tags (Telkomsel, Indosat, XL, dsb.).
- **Footer Action:** Dual-split row featuring immediate "Hubungi WhatsApp" green action and "Detail Konter" secondary prompt.

### Chips & Filter Pills
- **Active State:** `#FFD84D` background with `#20242C` text and no border.
- **Inactive State:** `#FFFFFF` background with `#E2E5EA` border and `#596273` text.
- **Radius:** Full capsule pill (`9999px`), internal padding `0.5rem 1rem`.

### Input Fields & Search Bars
- **Directory Search:** Generous pill or `14px` rounded white container, `48px` height, featuring a prominent magnifying glass icon, placeholder text in `#596273`, and a clear button.
- **Focus State:** `2px solid #FFD84D` outline ring without harsh dark strokes.

### Checkboxes & Radio Buttons
- **Base:** `4px` rounded check box or circular radio with `#E2E5EA` resting border.
- **Checked State:** Filled with `#FFD84D` featuring a `#20242C` check icon, ensuring vibrant visibility.

### Navigation Rail (Sidebar Kiri)
- **Container:** Curved vertical pillar (`#FFD84D`), radius `28px` on mobile/tablet borders and embedded left dock on desktop.
- **Navigation Items:** Rounded square icons (`44px x 44px`) transitioning between neutral charcoal glyphs and semi-translucent darkened active pill states (`rgba(0,0,0,0.08)`).