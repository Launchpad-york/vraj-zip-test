# BSP-WEB Frontend

## Standalone Prototype Mode

This folder can run as a standalone clickable prototype with hardcoded in-memory data and no backend dependency.

### What is mocked
- Authentication/session (no Cognito dependency at runtime)
- API/network layer (all core modules return local hardcoded data)
- Chatbot responses (mock streaming + mock non-stream responses)
- Finance download/send actions (mock blob responses)

### Demo login behavior
- Email: any valid email format
- Password:
  - `verify123` -> opens verification flow
  - `newpass123` -> opens new-password challenge flow
  - any other non-empty password -> logs in directly

### Run standalone
```bash
# Node 20.19+ required (Vite 7 requirement)
cd prototype-frontend
npm install
npm run dev
```

A modern React frontend application built with Vite, TypeScript, and Tailwind CSS v4.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| State Management | Zustand |
| Forms | React Hook Form + Yup |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| Linting/Formatting | Biome |
| Documentation | Storybook 10 |
| Design Tokens | Style Dictionary + Tokens Studio |

## Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── api/                 # API client and services
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components (shadcn)
│   │   └── *.tsx            # Feature components
│   ├── const/               # Constants and enums
│   ├── hooks/               # Custom React hooks
│   ├── layout/              # Layout components
│   ├── lib/                 # Utility libraries
│   │   └── utils.ts         # Common utilities (cn, etc.)
│   ├── pages/               # Page components
│   ├── routes/              # Route definitions
│   ├── schemas/             # Yup validation schemas
│   ├── store/               # Zustand stores
│   ├── stories/             # Storybook stories
│   ├── style/               # Additional CSS files
│   ├── tables/              # Table configurations
│   ├── tokens/              # Design tokens (auto-generated)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── build-tokens.mjs         # Design token build script
├── biome.json               # Biome configuration
├── components.json          # shadcn/ui configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Build design tokens
pnpm build-tokens

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run Biome linter |
| `pnpm build-tokens` | Generate CSS from design tokens |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build Storybook for deployment |

## Design Tokens

Design tokens are managed using [Tokens Studio](https://tokens.studio/) and compiled with [Style Dictionary](https://amzn.github.io/style-dictionary/).

### Token Structure

```
src/tokens/
├── $metadata.json           # Token set order
├── $themes.json             # Theme definitions
├── global.json              # Global tokens (spacing, radius)
├── bsp brand colors/        # Brand color palette
│   └── Mode 1.json
├── bsp color modes/         # Theme-specific semantic colors
│   ├── bsp-light.json
│   └── bsp-dark.json
├── shadows/bsp.json         # Shadow definitions
├── typography/bsp.json      # Typography tokens
├── border radius/bsp.json   # Border radius tokens
├── spacing/bsp.json         # Spacing scale
└── tokens.css               # Generated CSS (do not edit)
```

### Building Tokens

After modifying any token JSON files, regenerate the CSS:

```bash
pnpm build-tokens
```

This generates `src/tokens/tokens.css` with CSS custom properties for each theme.

## Theming

The app supports light and dark themes using CSS custom properties.

### Theme Selectors

- **Light theme (default):** `:root` or `:root[data-theme="bsp-light"]`
- **Dark theme:** `:root[data-theme="bsp-dark"]`

### Switching Themes

```typescript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'bsp-dark');

// Switch to light theme
document.documentElement.setAttribute('data-theme', 'bsp-light');
```

### Using Theme Tokens

```css
/* Use semantic tokens that adapt to theme */
.card {
  background: var(--bspBgBgCard);
  color: var(--bspTextTextPrimary);
  border: 1px solid var(--bspBorderBorderPrimary);
}
```

## Component Library

UI components are built with [shadcn/ui](https://ui.shadcn.com/) (Radix Vega style) and Radix UI primitives.

### Adding Components

```bash
# Add a shadcn component
npx shadcn@latest add button

# Components are added to src/components/ui/
```

### Available Components

| Component | Path |
|-----------|------|
| Alert Dialog | `@/components/ui/alert-dialog` |
| Badge | `@/components/ui/badge` |
| Button | `@/components/ui/button` |
| Card | `@/components/ui/card` |
| Combobox | `@/components/ui/combobox` |
| Dropdown Menu | `@/components/ui/dropdown-menu` |
| Field | `@/components/ui/field` |
| Input | `@/components/ui/input` |
| Input Group | `@/components/ui/input-group` |
| Label | `@/components/ui/label` |
| Select | `@/components/ui/select` |
| Separator | `@/components/ui/separator` |
| Textarea | `@/components/ui/textarea` |

### Path Aliases

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
```

## Code Quality

### Biome

The project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Check for issues
pnpm lint

# Auto-fix issues
npx biome check --write .
```

### Pre-commit Hooks

Husky + lint-staged runs Biome on staged files before each commit.

## Testing

### Unit/Integration Tests
```
### Storybook

View and test components in isolation:

```bash
pnpm storybook
```

Stories are located in `src/stories/`.

## Fonts

The app uses [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts as the default font family.

```css
--font-sans: "Inter", sans-serif;
```

## Environment Variables

Create a `.env.local` file for local environment variables:

```env
VITE_API_URL=http://localhost:3000
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Build & Deployment

```bash
# Production build
pnpm build

# Output is in dist/
```

The build output is optimized and ready for static hosting.

