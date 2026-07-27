# Vite HTML Frontend Template

This directory is the `project/frontend` Vite HTML application.

## Stack

- Use Vite + HTML + Tailwind CSS v4 + TypeScript.
- Do not introduce React or another component framework in this template.
- Use `pnpm`; do not switch to `npm`, `yarn`, or `bun`.
- Add runtime libraries through `package.json` and package imports, not CDN scripts.

## Entry Points

- `index.html` is the HTML entry.
- `src/main.ts` is the TypeScript entry.
- `src/index.css` owns the Tailwind v4 CSS-first entry and shared theme tokens.
- `src/lib/supabase.ts` is the shared Supabase client module when Supabase is needed.
- Page modules must import from `src/lib/supabase.ts` and must not create additional Supabase clients.

## Commands

- `pnpm dev`: run the local Vite development server.
- `pnpm run lint`: run the template's static error checks.
- `pnpm run lint:file -- src/main.ts`: quickly check one changed TypeScript file.
- `pnpm run typecheck`: check the app and Vite config TypeScript projects.
- `pnpm run build`: produce a production bundle when production validation is needed.

## Template File Map

The freshly scaffolded template already contains the following. Use this map to plan the whole app up front; open a file with `Read` only when you are about to modify it — do not re-explore the template to rediscover its contents.

```text
project/frontend/
├── index.html                 # HTML entry (Vite's default single entry)
├── package.json               # deps + scripts (pnpm)
├── vite.config.ts             # Vite config; register extra *.html pages under build.rollupOptions.input
├── eslint.config.js           # lint rules for src/**/*.ts
├── tsconfig*.json             # TS app/node/base project references
└── src/
    ├── main.ts                # app entry — imports index.css; app bootstrap goes here
    ├── index.css              # Tailwind import + @theme design tokens
    ├── vite-env.d.ts          # Vite environment typings
    └── lib/
        └── supabase.ts        # shared Supabase client (only wire up when Supabase is used)
```

No other directories exist yet — add more `src/` modules and additional `*.html` pages as the app needs. Tailwind v4 is configured through `@tailwindcss/vite` and CSS; do not recreate `tailwind.config.js` or `postcss.config.js` unless a dependency explicitly requires them.

## Styling Contract

- Keep `@import "tailwindcss"` and the `@theme` token block in `src/index.css`.
- Use Tailwind semantic utilities backed by its `:root` tokens (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-primary`, and `font-display`). Re-theme the app by editing those token values, not by scattering replacement colors through components.
