# Issues

## Wave 1 T4 — Prior run timed out / out-of-scope changes (2026-07-10)

- The prior T4 attempt timed out and ran under **Node v20.19.5** instead of the required Node 22.
- That run made out-of-scope edits:
  - `federation.config.mjs`: added five non-rxjs entries to `skip` (`@app/shared/services`, `@app/core/feature-flags/feature-flags.model`, `@app/home/customer/account-statements/models/account-statement`, `@shared/modules/loader/model/size-props`, `@app/shared/models/searchable`) — none of these are T4 scope.
  - Created repo-root `patch-fed.mjs` (out-of-scope helper script).
  - Possibly touched `environment.ts` quote/import formatting (left unchanged as config values were unmodified).
- **This task (T4 re-run)** restored scope:
  - Reverted `federation.config.mjs` skip to rxjs-only entries.
  - Deleted `patch-fed.mjs`.
  - Confirmed `app.ts`, `app.html`, `app.css` were already correct from prior partial work.
  - Build ran cleanly under Node v22.23.1: exit 0, 0 hard errors, `Application bundle generation complete`.
