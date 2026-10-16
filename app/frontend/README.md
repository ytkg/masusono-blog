# Frontend Directory Guide

`app/frontend` is the Vite/Inertia React frontend root.

## Directory Roles

- `entrypoints/`: Vite entrypoints loaded from Rails views.
- `application/`: Application providers and shared browser/SSR Inertia setup and page resolution.
- `layouts/`: Page layout components that wrap Inertia pages.
- `pages/`: Inertia page components. Keep routing-level composition here.
- `features/`: Domain or feature-specific UI, hooks, and logic.
- `components/`: Application shell components used across the whole app, such as header and bottom navigation.
- `shared/`: Reusable UI and frontend utilities that are not tied to one feature or route.
- `assets/`: Site-wide assets. Feature-only assets should live under that feature directory.
- `styles/`: Global CSS.
- `test/`: Shared test setup.

## Placement Rules

- Put route-level screens in `pages/`.
- Put feature-specific components, hooks, state, and helpers in `features/<feature>/`.
- Put app shell components in `components/` only when they belong to the global frame of the app.
- Put reusable presentation components in `shared/components/`.
- Put reusable hooks in `shared/hooks/`, utilities in `shared/lib/`, and presentation styles in `shared/styles/`.
- Keep `shared/` itself free of files; tests stay beside their implementation.
- Put application initialization in `application/`, layout constants in `layouts/`, and shell navigation definitions in `components/`.
- Put feature-only assets in `features/<feature>/assets/`.
- Keep tests next to the file they cover.

When a file could fit in both `components/` and `shared/`, prefer `shared/` unless it is part of the global app shell.

## Article Search Text

Search queries, titles, author names, and tags are plain text. `normalizeArticleSearchText`
only collapses whitespace and lowercases them; strings such as `<Ruby>` and `&copy;`
keep their literal meaning. Only article bodies pass through `extractHtmlText` before
normalization, so searches match visible body text rather than HTML markup.
