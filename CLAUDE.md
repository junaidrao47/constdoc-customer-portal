@AGENTS.md

## Project notes
- Checks: `npx tsc --noEmit && npm run lint && npm test && npm run build`. Lint does NOT catch statements above imports; tsc and build do.
- Currency is MXN. Never hardcode another currency.
- Document downloads: never use a plain `<a href={downloadUrl}>`. Local mode needs a Bearer header, so call `GET /documents/:id/download-url` (or `approved-download-url`). If `downloadMode === "s3"`, open the presigned URL; otherwise use `downloadRequest()` from `src/lib/api.ts`. See `(portal)/dashboard/documents/page.tsx`.
- Format: `npm run format` / `npm run format:check` (Prettier 3.9.9). Run `format` twice if `format:check` still complains; Prettier sometimes needs a second pass on member chains.
- Metadata (Next 16): root `title`/`description` live in `src/app/layout.tsx` (`title` uses `{ default, template: "%s · ConstDoc" }`). Public server pages set their own `export const metadata = { title }`. `"use client"` pages (the `(portal)/dashboard/*` pages) cannot export metadata — leave them.
- This machine OOM/flakes if two Next or Vitest chains run at once. Run repo check chains one at a time, not concurrently.
