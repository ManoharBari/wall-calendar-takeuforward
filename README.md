# Wall Calendar — Interactive React Component

A polished, interactive wall calendar component built for the frontend engineering assessment. Faithfully translates the physical wall calendar aesthetic into a fully functional, responsive React component.

---

## Features

### Core (Required)

- **Wall Calendar Aesthetic** — spiral binding, hero photo, diagonal blue accent overlay with year/month display
- **Day Range Selector** — click start → click end; live hover preview; distinct visual states for start, end, in-range days
- **Integrated Notes** — per-range notepad with auto-save to `localStorage`; saved notes listed in sidebar; delete anytime
- **Fully Responsive** — desktop: side-by-side panels; mobile: stacks vertically with full touch support

### Extras

- **Month navigation** with slide animation (left/right direction-aware)
- **12 unique hero images** from Unsplash, one per month
- **Light / Dark theme** toggle
- **Holiday markers** (Indian public holidays) with dots on date cells + tooltips; toggleable
- **Note-range indicator dots** on calendar cells
- **Today highlight** with amber ring
- **Sat/Sun color coding** (blue/red)
- **localStorage persistence** — notes, theme, and range survive page refresh

---

## Tech Stack

- **React 18** with hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
- **Next.js 14** (App Router compatible — use as a Client Component)
- **Pure CSS-in-JS** — zero external CSS libraries, no Tailwind needed
- **No external dependencies** beyond React/Next

---

## Getting Started

```bash
# Create a new Next.js app
npx create-next-app@latest my-calendar --app --no-tailwind
cd my-calendar

# app/components/WallCalendar.tsx

# In app/page.tsx:
import WallCalendar from "./components/WallCalendar";
export default function Home() {
  return <WallCalendar />;
}

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## Component Architecture

```
WallCalendar (root)
├── Toolbar              — theme + holiday toggles
├── CalendarCard
│   ├── Binding          — decorative spiral coils (18 circles)
│   ├── HeroImage        — month photo + diagonal accent + year/month text + nav arrows
│   └── Lower (grid)
│       ├── NotesSidebar — range note editor + saved notes list + decorative lines
│       └── CalendarGrid
│           ├── StatusBar     — selected range display + clear button
│           ├── WeekdayHeader — Mon–Sun with sat/sun coloring
│           ├── DayCells      — interactive, with range states + dots
│           └── Legend
└── Footer hint
```

---

## Design Decisions

| Decision                                  | Rationale                                      |
| ----------------------------------------- | ---------------------------------------------- |
| CSS-in-JS (inline styles)                 | Zero setup, zero build config, easily portable |
| localStorage only                         | Assessment requires no backend                 |
| Range stored as flat key (`y-m-d__y-m-d`) | Simple string key, easy to serialize           |
| Hover preview before committing range end | Better UX for range selection                  |
| Diagonal CSS gradient overlay on hero     | Faithful to reference image's chevron design   |
| 12 Unsplash images (one per month)        | Seasonal feel without any asset bundling       |

---

## Responsive Breakpoints

| Viewport | Layout                                |
| -------- | ------------------------------------- |
| > 600px  | Side-by-side (notes left, grid right) |
| ≤ 600px  | Stacked (notes above, grid below)     |

---

## Known Limitations / Future Improvements

- Holiday data is static and India-centric; could be fetched from a public holidays API
- Notes are tied to exact date ranges; future: attach notes to individual days
- Could add a "flip" page-turn animation using CSS 3D transforms
- Color theme extraction from hero image (using Canvas `getImageData`) would be a cool enhancement
