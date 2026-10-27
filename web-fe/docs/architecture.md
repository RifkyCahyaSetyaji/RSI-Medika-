# Architecture & Folder Structure

```txt
src/
├── app/                 # Next.js App Router (routing only)
├── assets/              # Static assets (fonts, images, icons)
├── features/            # Business domains
└── shared/              # Reusable primitives/utilities
```

## Placement

| Area                    | Path                        |
| ----------------------- | --------------------------- |
| Routes/layouts          | `src/app/`                  |
| Business feature        | `src/features/<feature>/`   |
| UI primitives           | `src/shared/components/ui/` |
| Reusable app components | `src/shared/components/`    |
| Shared utils            | `src/shared/lib/`           |
| Shared styles           | `src/shared/styles/`        |
| Global types            | `src/shared/types/`         |
| Services/API client     | `src/shared/services/`      |
| Shared hooks            | `src/shared/hooks/`         |
| Shared store            | `src/shared/store/`         |
| Providers               | `src/shared/providers/`     |

## Hard Rules

- `app/` is routing and composition only.
- Features cannot import other features.
- Shared code cannot import from features.
- Components used by multiple areas live in `src/shared/components/`.
