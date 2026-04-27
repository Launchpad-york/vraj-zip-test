# York IE Hub

A React + Vite dashboard application — a functional implementation of a Figma design for the York IE internal management hub.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4, Shadcn UI (Radix UI), MUI (Material UI)
- **Routing:** React Router v7
- **Charts:** Recharts
- **Animations:** Motion (Framer Motion)
- **Drag & Drop:** react-dnd
- **Forms:** react-hook-form

## Project Structure

```
src/
  app/
    components/
      ui/        # Shadcn/Radix UI components
      figma/     # Figma asset components
    data/        # Mock data (employees, projects, quotations)
    App.tsx      # Root component
    routes.tsx   # Route configuration
  imports/       # Static assets / images
  styles/        # CSS (Tailwind, theme, fonts)
  main.tsx       # Entry point
```

## Development

```bash
pnpm run dev    # Start dev server on port 5000
pnpm run build  # Production build
```

## Deployment

Configured as a **static site** deployment:
- Build command: `pnpm run build`
- Public directory: `dist`

## Key Features

- Dashboard / Home with announcements, meetings, bench watch
- Timesheet, Leave & WFH management
- Projects, MBO, Project Issues
- Employee & Organization views
- Kudos, Awards
- Tools: Link Vault, Whisper, Inventory, Meeting Tracker, Analytics, Interviews
- **Quotation (Modern View)**: Phase-based quoting with inline resource tagging, hiring requests, status flow (Draft → Locked → SOW Signed → Triggered), and auto hrs/mo from resource allocation. Classic view preserved via toggle.

## Shared Data Files

- `src/app/data/resources.ts` — Shared BENCH resources array + types (used by QuotationModernView)
- `src/app/data/quotationVersions.ts` — Quote version store with pub/sub
- `src/app/data/triggeredProjects.ts` — Triggered projects store with pub/sub
