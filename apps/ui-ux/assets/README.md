# EzyKwelez UI/UX Assets Repository

**Owner:** Aile Sharma (`Lead UI/UX Designer & Design System Owner`)  
**Status:** Phase 0 Baseline  
**Scope:** Canonical visual and design assets for EzyKwelez.

---

## 1. Directory Purpose

This directory serves as the centralized repository for static design assets, vector graphics, campus map layers, icon sets, and wireframe exports.

---

## 2. Directory Structure

```text
apps/ui-ux/assets/
├── icons/             # Custom SVG icons (if not provided by standard Lucide set)
├── campus-maps/       # SVG floorplans, zone schematics, and synthetic campus topology layers
├── diagrams/          # Decision-loop diagrams, blast-radius illustrations, and UX flow charts
├── brand/             # EzyKwelez logomarks, badges, and wordmark SVGs
└── exports/           # Exported UI mockups, interaction specs, and Figma wireframes
```

---

## 3. Asset Submission Guidelines

1. **Vector First:** All iconography, schematic campus maps, and logos must be stored as clean, optimized SVGs (using SVGO where applicable).
2. **No Raster Placeholders:** Do not commit temporary PNG/JPG placeholders.
3. **Naming Convention:** Use kebab-case for all asset files (e.g., `building-b-schematic.svg`, `ezy-logo-dark.svg`).
4. **Theme Neutrality:** Vector assets must use CSS variables or `currentColor` for fill/stroke where possible to support theme inheritance without duplicate files.
