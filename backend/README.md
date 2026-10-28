# Movie backend

All movie records live in SQLite. The app reads them through the API. Request handlers never call TMDB; the daily worker updates the saved catalog separately.

```text
Expo screens
  → src/services/movies.ts or src/services/releases.ts (app)
  → backend/src/routes/ (HTTP requests and session/role checks)
  → backend/src/services/movies.ts (movie rules and database queries)
  → Prisma → SQLite

Daily worker
  → backend/src/services/tmdb.ts → TMDB
  → Prisma → saved movies + catalog-list membership
```

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| `src/routes/movies.ts` | Catalog, home sections, search, movie detail and recommendations endpoints. |
| `src/routes/admin.ts` | Create, partially update and hide movies; requires superadmin. |
| `src/routes/releases.ts` | Read Próximas and Cartelera from saved catalog entries. |
| `src/services/movies.ts` | Shared movie responses, ratings/counts, friends' ratings, home selection, recommendations, catalog searches, writes and release-list rules. |
| `src/validation/movies.ts` | Valid IDs, search input, movie fields and partial-edit validation. |
| `src/services/social.ts` | Accepted-friend lookup and friends' rating averages. |
| `src/services/reviews.ts` / `src/routes/reviews.ts` | Saved reviews, reactions and feeds. These update the data movie statistics read. |
| `src/services/tmdb.ts` | TMDB requests, metadata imports and atomic replacement of saved list membership. Used by the sync job, not request handlers. |
| `src/worker.ts` | Daily cron schedule, 04:00 Buenos Aires time by default. |
| `src/jobs/sync-catalog.ts` | Run one sync manually or through an external scheduler. |
| `prisma/schema.prisma` / `prisma/migrations/` | Database models and versioned schema changes. |
| `tests/integration.test.ts` | API tests using a temporary database and local TMDB fixture. |

Paths in this table are relative to `backend/`.

## Movie endpoints

| Method and URL | Response or behavior |
| --- | --- |
| `GET /api/movies` | Visible movies, sorted by community rating. |
| `GET /api/movies/home` | `{ list, featured, hero, trending }`, already selected and ordered by the server. |
| `GET /api/movies/search?q=Dune` | Saved visible movies with matching titles, including statistics and the viewer's friends' rating. |
| `GET /api/movies/:id` | Saved movie, metadata, aggregate ratings/counts and up to five friends who reviewed it. |
| `GET /api/movies/:id/recommendations` | Up to six visible movies sharing a genre, ranked across the complete candidate set. |
| `POST /api/movies` | Validate and save a complete manual movie. Superadmin only. |
| `PATCH /api/movies/:id` | Change only submitted fields, preserving other metadata and genres. Superadmin only. |
| `DELETE /api/movies/:id` | Hide the movie. Reviews are preserved and sync cannot make it visible again. Superadmin only. |
| `GET /api/releases/upcoming` | Saved upcoming movies after today's Buenos Aires date, ordered by release date. |
| `GET /api/releases/now-playing` | Saved now-playing snapshot, preserving TMDB list order. |

Read endpoints support guests. A valid session adds viewer-specific friend data. Movie IDs in app URLs are local database IDs; `tmdbId` is a separate external-source identifier.

## Rules owned by the server

- Community rating is the average of saved non-null review ratings, rounded to one decimal. A movie with no ratings returns `null`.
- `commentsCount` counts reviews, while `ratingsCount` counts reviews with a rating. The detail screen displays the server's `ratingsCount` beside its average.
- Trending counts reviews from the last 30 days through the current time, ranks by that count, then community rating and a stable title/ID tie-breaker.
- The hero uses editorially featured movies. Without them, it uses up to four rated movies, or saved catalog movies when none have ratings.
- Search uses the saved catalog, accepts 1–80 trimmed characters, and excludes hidden movies.
- Recommendations sort all same-genre candidates before taking six; the result is not restricted to the first arbitrary database batch.
- After a create/edit/delete, the app refetches the server's home/catalog response instead of recalculating rankings locally.

The app retains presentation concerns: rendering, navigation, formatting, form feedback and debounce timing. The database and backend remain authoritative for validation, permissions, saved values and movie selection/ranking. Demo seed data is explicit and optional; no app request reads mock arrays.

## Checks

From the repository root, run `npm run typecheck`. From `backend/`, run `npm run typecheck`, `npm run build` and `npm test`. Movie-specific tests cover server-selected home sections, personalized search, recommendations beyond 30 candidates, unrated/future reviews, partial edits and hidden movies, in addition to authentication, permissions and sync behavior.

## Reminders, push, cinemas and fulfillment

| Layer | Files / storage |
| --- | --- |
| Saved subscriptions | `src/routes/reminders.ts` → `src/services/reminders.ts` → `ReleaseReminder` |
| Device registration | `src/routes/push.ts` → `src/services/push.ts` → session-bound `PushDevice` |
| Scheduled delivery | `src/worker.ts` → `runPushDelivery` → leased queue, `PushDelivery`, Expo tickets/receipts |
| Cinemas | `src/routes/cinemas.ts` → `src/services/cinemas.ts` → Overpass, persistent `CinemaLookup` cache |
| Reward validation/use/refund | `src/routes/rewards.ts` → `src/services/fulfillment.ts` → `Redemption` audit fields |
| Image upload/serving | `src/routes/uploads.ts` → `src/services/uploads.ts` → `Upload` + WebP files |
| Operations | `scripts/backup-db.ts`, `scripts/migrate-images.ts`, `scripts/bootstrap-admin.ts` |

App `src/context/RemindersContext.tsx` loads account subscriptions; `src/services/push.ts` registers the native device and handles taps. `src/utils/releaseReminderPlan.ts` identifies old local alerts for removal. Release scheduling and retries run on the server. No direct Overpass request or ten-second notification test remains in the app.

Staff endpoints: `POST /api/admin/redemptions/validate` and `/use` accept `{ code }`. `POST /api/admin/redemptions/:id/refund` requires superadmin. `POST /api/uploads` accepts `{ image: "data:image/jpeg;base64,..." }` and returns `{ url }`.

Tests use temporary databases and local TMDB/Overpass/Expo fixtures. They cover queue timing, retries, receipt processing, revoked sessions, device ownership, concurrent reward use, refunds, image validation/ownership and consistent database backups. They do not prove delivery on a physical phone or availability of public providers.

See the root README and `../deploy/README.md` for configuration, operational setup and remaining device checks.
