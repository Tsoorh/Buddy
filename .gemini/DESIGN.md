# Frontend Design Rules - Buddy

This document defines the visual and interaction standards for the Buddy application. Use these rules when generating new UI components or layouts via Google Stitch or manual implementation.

## 1. Visual Identity
- **App Name:** SpearFreshFish - The Ultimate Fishing Companion
- **Theme:** Default Dark Mode (Deep Sea focus)
- **Vibe:** Rugged, nature-inspired, professional-grade outdoor tool.

### Color Palette
| Purpose | Hex Code | Description |
| :--- | :--- | :--- |
| **Primary (BG)** | `#0B2D72` | Deep Navy - Main background and header. |
| **Secondary** | `#0992C2` | Ocean Blue - Secondary surfaces and elements. |
| **Accent** | `#0AC4E0` | Cyan - Main actions and interactive highlights. |
| **Neutral** | `#F6E7BC` | Sand - Text, icon highlights, and contrast elements. |
| **Surface** | `rgba(255, 255, 255, 0.05)` | Glassmorphism card backgrounds. |

### Typography
- **Headings:** Montserrat (Bold) - 1.5rem to 2.2rem.
- **Body:** Roboto (Regular) - 1rem (16px) for high legibility.
- **Data/Stats:** JetBrains Mono or similar monospace for precise readings (depth, temp).

---

## 2. Component Guidelines
- **Responsive:** Mobile-first approach. All designs must be touch-friendly (min 48px tap target).
- **Styling:** Vanilla CSS or Bootstrap. **Avoid TailwindCSS** unless specified.
- **Glassmorphism:** Use `backdrop-filter: blur(10px)` for cards on the Dashboard.
- **Buttons:** Large, rounded corners (8px-12px radius), with hover/active states.

---

## 3. Screen Layouts
### Homepage
- all latest public post- showing photos of catches by users with minor details.

### Dashboard
- Personal greeting + Weather/Tide widget.
- Horizontal scrolling cards for "Latest Catches."
- AI Insight banner (Sunset Orange background with white text).

### Catch Logger (Form)
- Multi-step wizard layout.
- Use iconography for fish species.
- Drag-and-drop media upload area.

### Analytics
- High-contrast line charts and heatmaps.
- "Optimal Conditions" status indicator.

---


## 5. Coding Style (JS/TS/React)
- **Navigation:** React Router.
- **Naming:** `onSomething` for event handlers.
- **Icons:** Lucide-react or FontAwesome (consistent style).
- **Single Quotes:** Use single quotes for JS/TS strings.
- **No Semicolons:** Do not use semicolons in JS/TS unless necessary.