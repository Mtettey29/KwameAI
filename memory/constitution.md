# Project Constitution

## Principles
- Keep backend and frontend contracts explicit through environment variables and documented defaults.
- Do not hardcode seeded identifiers in UI code unless the seed data is owned and versioned alongside the feature.
- Every user-visible change should leave behind a written spec, an implementation plan, and a task checklist.
- Prefer resilient fallbacks over silent failure, especially in demo and deployment environments.

## Workflow
1. Write or update the feature spec under `specs/<feature>/spec.md`.
2. Record implementation choices in `specs/<feature>/plan.md`.
3. Track execution in `specs/<feature>/tasks.md`.
4. Implement only after the spec and plan describe the intended behavior.
