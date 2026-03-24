# AGENTS.md

This file guides Codex and other coding agents working in `sajucube-chasam-importer/`.

## Scope

- This `AGENTS.md` applies to the entire repository.
- Treat the files under `.github/instructions/` and `.github/prompts/` as the project's source-of-truth working notes.
- If this file and a more specific nested `AGENTS.md` ever conflict, the more specific file wins.

## Start Here

Before making changes, review these files:

1. `.github/instructions/rules.instructions.md`
2. `.github/instructions/architecture.instructions.md`
3. `.github/instructions/memory.instructions.md`
4. `.github/prompts/plan.prompt.md`

Use them as the main reference for project conventions, architecture, edge cases, and roadmap context.

## Working Agreement

- Keep `.github/instructions/*` and `.github/prompts/*` as the long-form reference docs used across tools, including Copilot.
- Use this `AGENTS.md` as the short entrypoint for Codex, not as a duplicate of every rule.
- When project rules evolve, prefer updating the `.github` documents first, then adjust `AGENTS.md` if the entrypoint guidance needs to change.

## Non-Negotiable Project Rules

- Update `.github/prompts/plan.prompt.md` before code changes when the task should be reflected in the repo roadmap or todo list.
- After code changes, run `npm run build` as the default validation step.
- Use `npm` for package management.
- Follow the existing TypeScript strict-mode discipline. Avoid `any` and `as unknown as X`.
- For routing, import from `react-router`, not `react-router-dom`.
- For Tailwind, keep the v4 setup as-is. Do not add `tailwind.config.js` or v3-style directives.
- Use the `@/` alias for `src/` imports instead of deep relative paths when practical.
- Keep API base URL and auth handling centralized in `src/utils/sajuCubeAuth.ts`.
- Treat `createdBy` as a phone-number string, not a UUID.

## Encoding And File Safety

- Be careful with Korean text and emoji in this repo.
- Prefer patch-based edits that preserve file encoding.
- Do not rewrite files with PowerShell `Set-Content` or similar full-file output commands.
- If emoji are needed in source strings, use Unicode escape sequences.

## Project Context

- This project imports Chasam DB JSON/text data, converts it into the `saju-cube` `MinimalPersonData` shape, lets the user review/edit the results, and then exports JSON or saves to the saju-cube backend.
- Some calculation modules are copied from `saju-cube` and adapted mainly through import-path changes. Be cautious when changing those files.
- Known edge cases and prior bug history are documented in `.github/instructions/memory.instructions.md`.

## Validation

- Default validation: `npm run build`
- If a change touches conversion, date, or save logic, also review the relevant notes in `.github/instructions/memory.instructions.md` and `.github/prompts/plan.prompt.md` before finishing.

## Notes For Future Maintainers

- Copilot-specific instruction files are intentionally kept in `.github/`.
- This `AGENTS.md` exists so Codex can enter the project with the same context quickly, while the `.github` folder remains the durable documentation hub.
