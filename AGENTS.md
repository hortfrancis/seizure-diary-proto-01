# Project conventions

- Use Conventional Commits, for example `feat: add manual event diary` or `fix: preserve event timestamp`.
- The project owner decides when to commit. Do not commit automatically.
- Follow the incremental delivery plan in SPEC.md. Stop for review after each step.
- This is a fictional-data prototype. Keep the required prototype banner visible on every screen.
- Use explicit semicolons in JavaScript and TypeScript; run the configured Prettier formatter.
- Keep port 5173 for the project owner and use port 5174 for agent browser checks. Both serve the same source, so code edits still hot-reload both previews.
- Export UI screenshots with `npm run screenshots`; keep numbered exports in the gitignored `screenshots/` directory.
