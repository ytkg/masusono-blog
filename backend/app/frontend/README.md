# Frontend Directory Guide

`app/frontend` is the Vite/Inertia React frontend root.

## Directory Roles

- `entrypoints/`: Vite entrypoints loaded from Rails views.
- `layouts/`: Page layout components that wrap Inertia pages.
- `pages/`: Inertia page components. Keep routing-level composition here.
- `features/`: Domain or feature-specific UI, hooks, and logic.
- `components/`: Application shell components used across the whole app, such as header, footer, and install prompts.
- `shared/`: Reusable UI and frontend utilities that are not tied to one feature or route.
- `assets/`: Site-wide assets. Feature-only assets should live under that feature directory.
- `styles/`: Global CSS.
- `test/`: Shared test setup.
- `utils/`: Legacy app-wide utilities. Prefer `shared/lib` for new cross-cutting logic.

## Placement Rules

- Put route-level screens in `pages/`.
- Put feature-specific components, hooks, state, and helpers in `features/<feature>/`.
- Put app shell components in `components/` only when they belong to the global frame of the app.
- Put reusable presentation components in `shared/`.
- Put feature-only assets in `features/<feature>/assets/`.
- Keep tests next to the file they cover.

When a file could fit in both `components/` and `shared/`, prefer `shared/` unless it is part of the global app shell.
