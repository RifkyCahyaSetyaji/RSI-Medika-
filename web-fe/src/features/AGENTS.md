# `src/features/` - Feature Modules

Setiap folder adalah satu domain bisnis dan private untuk domain itu.

## Structure

```txt
features/<name>/
├── api.ts
├── hooks.ts
├── types.ts
├── schema/
├── styles/
├── containers/
└── components/
```

## Rules

- Jangan import dari feature lain.
- Extract reusable code ke `shared/`.
- `api.ts` hanya plain async functions.
- `hooks.ts` untuk wrapper data fetching / state.
- `containers/` untuk assembly feature.
- Component file pakai PascalCase untuk kode baru.
