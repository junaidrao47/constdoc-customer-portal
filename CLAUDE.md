@AGENTS.md

## Project notes
- Checks: `npx tsc --noEmit && npm run lint && npm test && npm run build`. Lint does NOT catch statements above imports; tsc and build do.
- Currency is MXN. Never hardcode another currency.
- Document downloads: never use a plain `<a href={downloadUrl}>`. Local mode needs a Bearer header, so call `GET /documents/:id/download-url` (or `approved-download-url`). If `downloadMode === "s3"`, open the presigned URL; otherwise use `downloadRequest()` from `src/lib/api.ts`. See `(portal)/dashboard/documents/page.tsx`.
