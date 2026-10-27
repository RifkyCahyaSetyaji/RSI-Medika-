# `src/shared/components/` - Reusable Components

Komponen global yang tidak terikat ke satu feature.

## Rules

- `ui/` untuk primitive component.
- `layout/` untuk shell global seperti navbar/sidebar/footer.
- Reusable app-level components boleh langsung di `shared/components/`.
- Tidak boleh import dari `features/`.
- Tidak boleh berisi business logic domain.
- Props harus typed dan extend native attributes jika relevan.
