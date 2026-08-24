<!--
  TEMPLATE — copy this to the ROOT of your new project as `CLAUDE.md`.

  Claude Code loads it automatically every session, so these rules persist
  without you re-explaining them. Fill in the [BRACKETS] and delete this
  comment block.

  Also works as `.cursorrules` / `.github/copilot-instructions.md` with minor
  edits.
-->

# [PROJECT NAME]

[One sentence: what this is and who it's for.]

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS **v4** · **p441z style kit**
- [Add: database, auth, deploy target, etc.]

---

## Design rules — follow these strictly

This project uses a specific visual system. The rules below are deliberate;
they are not oversights to fix.

### Monochrome surfaces

All surfaces are **pure greyscale**. No brand-colored backgrounds, no gradient
heroes, no tinted page sections.

Color appears in exactly two places:
1. **Status indicators** — `bg-{color}-500/10 text-{color}-500 border-{color}-500/20`
2. **One** tinted hero tile per dashboard, at most

If a page feels plain, that is the intended result.

### Use the kit's components

Never hand-roll something the kit already provides.

| Need | Use |
|---|---|
| Button / link-as-button | `<Button>` (`asChild` for links) |
| Page title | `<PageHeader>` |
| Headings, paragraphs | `Typography.*` |
| Surface | `<Card>` or the elevated-card recipe |
| Filter, view switcher | `<PillTabs>` |
| Loading | `<Skeleton>`, mirroring the real layout |
| Tag | `<Badge>` · Status → the status-pill recipe |

### Entrance animation

Wrap every page body in `<BlurFade>`. Use `inView` for below-the-fold
sections. Stagger lists with `delay={i * 0.05}`.

### Spacing

```
mb-6   page header → content
mt-10  between major sections
p-6    card padding (p-5 dense rows)
gap-5  card grids
h-9    control height
```

### Loading states

Skeletons mirror the real layout — same block count, same grid. Never a bare
centered spinner.

### Tailwind v4 syntax

`outline-hidden` (not `outline-none`) · `shadow-xs`/`shadow-sm` (scale shifted
from v3) · `bg-linear-to-r` (not `bg-gradient-to-r`) · `shrink-0`

CSS tokens are bare HSL triplets (`0 0% 9%`), never `hsl(0 0% 9%)` — the full
function breaks opacity modifiers.

There is **no `tailwind.config.ts`** in v4. Theme config lives in
`src/app/globals.css`.

---

## Project conventions

<!-- Add your own as the project grows. Examples: -->

- Data access goes through `src/services/*` — pages don't query directly
- Path alias `@/*` → `./src/*`
- [Your conventions here]

---

## Commands

```bash
npm run dev      # dev server
npm run build    # production build — must pass before "done"
npm run lint
```

---

## Before reporting a task complete

- [ ] `npm run build` passes
- [ ] No hardcoded hex or colored surfaces
- [ ] Page bodies wrapped in `<BlurFade>`, pages open with `<PageHeader>`
- [ ] No hand-rolled components where a kit one exists
- [ ] Dark mode checked
