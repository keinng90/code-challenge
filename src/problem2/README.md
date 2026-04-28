# ask

Create a currency swap form based on the template provided in the folder. A user would use this form to swap assets from one currency to another.

*You may use any third party plugin, library, and/or framework for this problem.*

1. You may add input validation/error messages to make the form interactive.
2. Your submission will be rated on its usage intuitiveness and visual attractiveness.
3. Show us your frontend development and design skills, feel free to totally disregard the provided files for this problem.
4. You may use this [repo](https://github.com/Switcheo/token-icons/tree/main/tokens) for token images, e.g. [SVG image](https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg).
5. You may use this [URL](https://interview.switcheo.com/prices.json) for token price information and to compute exchange rates (not every token has a price, those that do not can be omitted).

# Problem 2 — Fancy Form

## Quick start

```bash
cd src/problem2
npm install
npm run dev          # Vite on http://localhost:5173
npm run test:run     # all tests once
npm run test         # tests in watch mode
npm run build        # type-check + production build
```

## Tech stack

- Vite 6 + React 19 + TypeScript
- TanStack Query 5 (price fetch with 30s refetch interval)
- shadcn/ui on Radix + Tailwind CSS 4
- sonner (toasts), lucide-react (icons), `@fontsource-variable/geist` (font)
- Vitest + React Testing Library + jsdom