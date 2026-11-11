# WhatNext

Expo frontend for WhatNext. The complete API, Prisma database, movies, points, auth and scheduled catalog job live in the separate [appsmovilesBACK repository](https://github.com/Zand3r5/appsmovilesBACK).

## Run locally

Keep both checkouts beside each other:

```text
apps/
  aplicaciones-moviles-2026/   frontend
  appsmovilesBACK/ API, worker, SQLite, uploads, private .env
```

On the configured development computer, run from this frontend:

```sh
npm run dev
```

This launches the standalone API on port 3000, its worker, and Expo with its interactive terminal/QR code. Ctrl+C stops all three. The launcher uses Node 22 for SDK 58 compatibility without changing the system Node installation. It does not create a second database or start a bundled backend.

For two terminals, use `npm run backend` here for the API/worker, then `npx expo start --go` for Expo (use Node 22 when launching Expo directly). `npm start` starts only Expo. Scan the QR code with the iPhone Camera or Expo Go on Android.

For a fresh machine, install frontend dependencies with `npm ci`, clone the backend beside it as `appsmovilesBACK`, and follow that repository’s setup guide to install dependencies and configure its private `.env`. For a different checkout location, set `WHATNEXT_BACKEND_DIR` to the backend directory before starting development. Secrets and real database contents are not distributed through Git.

Leave frontend `EXPO_PUBLIC_API_URL` empty for local development. The app follows Expo’s network hostname on API port 3000; keep the phone and computer on the same Wi-Fi. Set a public HTTPS API URL for production. The Expo tunnel does not expose the API.

Backend configuration and uploaded files are in `../appsmovilesBACK/.env` and `../appsmovilesBACK/uploads`. `DATABASE_URL` in that private `.env` selects the SQLite file. Backend deployment and Prisma Studio commands run in that separate repository.

## Daily catalog sync

The API only reads saved movies. It never fetches TMDB during requests, including movie details, search, Próximas and Cartelera. Search covers the saved catalog.

The separate worker runs every day at 04:00 in `America/Argentina/Buenos_Aires`. Keep the worker running under a process supervisor. API, worker and scheduled command must use the same persistent SQLite database.

The “Avisame” button is independent from that worker. It schedules a local notification on the phone for 10:00 Argentina time on the movie's release date. It does not register a push token, call a reminder API, or require APNs/FCM credentials. Because the reminder lives only on that device, it is not synchronized to another phone.

Each job:

- Fetches popular and now-playing movies for Argentina, plus upcoming theatrical releases over the next 120 days.
- Fetches up to `TMDB_SYNC_MAX_PAGES` per list (default 5, 100 items per list).
- Imports full metadata, Argentina theatrical dates and streaming providers, and refreshes previously saved TMDB movies.
- Preserves movie IDs, reviews, featured flags and moderation/hidden flags.
- Replaces list membership in one transaction after every fetch/import succeeds. A failed run keeps the previous lists and records the failure in `SyncRun`.
- Uses a database lease with renewal to prevent multiple workers from overlapping, bounded request timeouts, and retries for temporary TMDB failures.

`GET /api/health` checks the database and exposes the last successful catalog synchronization time. The API remains available while a sync runs or TMDB is unavailable. Before the first successful sync the release lists are empty.

TMDB provides regional release data, not verified local cinema showtimes. See its [region support](https://developer.themoviedb.org/docs/region-support). The worker uses [node-cron scheduling](https://www.nodecron.com/api-reference.html).

## Signup, credentials and sessions

Signup validates name, email format and password strength, hashes the password and immediately signs the user in. Email-code verification and mail delivery are not required. Login verifies the password against the saved hash; authentication endpoints are rate limited and duplicate email addresses are rejected. Roles always come from the database.

The app stores tokens in Expo SecureStore on native devices and local browser storage on web. Startup checks the saved session with `/api/auth/me`. Private operations verify the token signature, expiration and active database session. Logout revokes that session, making its token unusable. Changing email updates it immediately and revokes other sessions.

Existing users can log in with their saved credentials. The standalone backend’s `db:seed` initializes missing reward/achievement/rank definitions without deleting accounts.

## API coverage

| Feature | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/logout`, `/change-password`; `GET /api/auth/me` |
| Catalog | `GET /api/movies`, `/movies/home`, `/movies/search?q=...`, `/movies/:id`, `/movies/:id/recommendations` |
| Saved release lists | `GET /api/releases/upcoming`, `/api/releases/now-playing` |
| Reviews | `GET/POST /api/movies/:id/reviews`; `PATCH/DELETE /api/reviews/:id` |
| Reactions | `POST /api/reviews/:id/like`, `/api/reviews/:id/repost` |
| Feeds | `GET /api/feed/popular`, `/api/feed/friends` |
| Profiles | `GET /api/users/:id`, `/users/:id/reviews`, `/users/:id/reposts`; `PATCH /api/users/me` |
| Friends | `GET/POST /api/friendships`; `GET /api/friendships/pending`, `/friendships/status/:userId`; `PATCH/DELETE /api/friendships/:id` |
| Notifications | `GET /api/notifications`; `PATCH /api/notifications/read-all`, `/api/notifications/:id/read` |
| Achievements and rewards | `GET /api/achievements`, `/api/rewards`; `POST /api/rewards/redeem` |
| Administration | `GET /api/users`; `PATCH /api/users/:id/role`; `POST /api/movies`; `PATCH/DELETE /api/movies/:id` |

Private operations derive the actor from the session, never from a caller-provided user ID. Review edits require ownership; moderators can delete reviews; movie and role administration requires superadmin. Movie deletion hides the movie so the daily sync cannot reintroduce it. Reward prices, eligibility, balances and codes are computed server-side; spending is transactional.

## Verification and backend documentation

Run `npm run typecheck` here for frontend checks. The backend has its own type checks and build in its repository.

See the [backend README](https://github.com/Zand3r5/appsmovilesBACK) for its setup.

## Nearby cinemas

Nearby cinemas are requested with authenticated `POST /api/cinemas/nearby` and JSON `{ lat, lng, radiusM? }`. Coordinates must be numeric and in range; radius defaults to 15 km and is limited to 1–50 km. The backend alone queries [OpenStreetMap Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API), validates/deduplicates results, computes distances, filters by the requested radius and returns the nearest 20. The phone only requests location permission, obtains its coordinates, formats distances and opens directions.

The response is `{ cinemas, source, updatedAt }`. `source` is `live`, `cache` or `stale`. A persistent six-hour cache groups queries by rounded 0.01-degree area centers and radius; the upstream query adds a 1 km margin, then exact distances are recalculated for each request. Precise request coordinates and user IDs are not stored in this cache. Concurrent queries for the same area share one upstream request. The cache is bounded to 1,000 areas. Provider failures can use results up to 24 hours old, explicitly labeled in the app; without usable cached data the API returns 503. Requests have bounded timeouts, a fallback public instance, and per-client rate limits. Set backend `OVERPASS_URL` to use a custom provider.

Tests use a local Overpass fixture for success, malformed-input, caching, coalescing and outage cases; they do not use a person's GPS location. Live public-provider availability is independent of these tests.

## Reward fulfillment, images and deployment

Staff can validate and use reward codes from Settings → Validar canjes. Superadmins can refund unused redemptions. The backend enforces ownership, roles, expiration and single-use behavior; concurrent redemption attempts cannot spend the same code twice. Refunds restore available points through the saved ledger.

`POST /api/uploads` accepts authenticated JPEG/PNG images, validates decoded pixels, removes metadata and stores resized WebP files. Reviews save image URLs; uploaded review images require ownership. `/media/:filename` serves these public images. Keep the upload directory on persistent storage. `npm run media:migrate` in the backend backs up the database and converts legacy embedded images. `npm run db:backup` snapshots SQLite and copies uploads into the same backup folder.

Frontend CI checks frontend types; backend CI checks server types and build. Production rejects placeholder JWT secrets. Public hosting still requires validation in the target environment.

## Points history and reward vouchers

Earned achievement points are now permanent, with a saved transaction history for earning, spending and refunds. The Logros screen displays the server's available balance and paginated history. Run `npm run points:migrate` inside the backend after applying migrations to backfill existing accounts once; it is safe to repeat. Current eligible achievements can be recovered, but previously deleted activity cannot.

Users can cancel their own unused canjes from Logros → Mis canjes → Anular canje y recuperar puntos. The backend invalidates the voucher and restores its original points atomically. Canceled vouchers leave the current list, while an inactive audit record and point history remain to prevent repeated refunds. Used vouchers cannot be canceled. Repeated requests never grant extra points.
