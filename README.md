# WhatNext

Expo app with an Express/Prisma API and a separate daily TMDB worker. User data, reviews, social activity, achievements, points and redemptions live in the backend. The app does not contact TMDB directly.

## Local setup

Uses Expo SDK 58. Use Node.js 22 LTS (22.13 or newer in the 22.x line) and npm; `.nvmrc` selects Node 22. Install the app and backend dependencies:

```sh
npm ci
cd backend
npm ci
cp .env.example .env
```

Set a long random `JWT_SECRET` and a valid `TMDB_KEY` in `backend/.env`. Keep these credentials off the Expo/public environment. Then initialize the database and load the catalog once:

```sh
npm run db:setup
npm run catalog:sync
```

`db:setup` applies versioned migrations without seeding or erasing user data. Prefer the ignored `prisma/local.db`; the repository's `prisma/dev.db` is a legacy snapshot.

At the repository root, copy `.env.example` to `.env`. For everyday development, run:

```sh
npm run dev
```

This starts Expo, the backend API and the scheduled worker together. Docker is optional and is only provided as a server deployment option. Press Ctrl+C to stop all three processes. For Expo’s full interactive terminal menu, run Expo separately.

`npx expo start` and `npm start` still start Expo alone; use them when running the API and worker separately (`npm run dev` and `npm run worker` inside `backend/`). Stop separately running development servers before using the combined command to avoid port conflicts.

For Expo Go's interactive QR code, stop the combined command and use two terminals at the repository root:

```sh
# Terminal 1: API and scheduled jobs
npm run backend
```

```sh
# Terminal 2: Expo Go and its QR code
npx expo start --go
```

Scan the QR code with the iPhone Camera or Expo Go on Android. Remote push notifications require a development build; Expo Go can be used for the other app flows.

For local development, leave `EXPO_PUBLIC_API_URL` empty: the app uses Expo’s current network host on API port 3000 (or the browser hostname on web). Keep the phone and computer on the same Wi-Fi. Restart Expo and rescan its QR code after changing networks. Set an explicit API URL for production, a custom backend port or a separate backend host. Expo tunnels only tunnel Metro; the backend still needs its own reachable URL. For web, allow the Expo origin in backend `CORS_ORIGINS`.

## Daily catalog sync

The API only reads saved movies. It never fetches TMDB during requests, including movie details, search, Próximas and Cartelera. Search covers the saved catalog.

The separate worker runs the cron expression `TMDB_CRON` (default `0 4 * * *`) in `America/Argentina/Buenos_Aires`. Keep the worker running under a process supervisor. API, worker and scheduled command must use the same persistent SQLite database.

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

Existing users can log in with their saved credentials. `npm run db:seed` is an explicit, destructive demo-data command and is not part of setup.

## API coverage

| Feature | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me` |
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

## Verification and production

```sh
npm run typecheck
cd backend
npm run typecheck
npm test
npm run build
```

Integration tests create an isolated temporary SQLite database and use a local TMDB fixture. They cover registration, credential checks, expired/revoked sessions, ownership, friendship permissions, server ratings, transactional redemptions, saved snapshots and failed synchronization. They do not change the development database or send mail.

Production needs HTTPS, a persistent database volume shared by one API/worker installation, and a supervised worker or external scheduler. After `npm run build`, use `npm start` for the API and `npm run worker:start` for the worker. SQLite is suitable for a single-host deployment; multiple API hosts require a shared database service and an adapted database provider. Back up the database before deploying migrations. No production deployment is performed by these changes.

## Movie backend structure

See [backend/README.md](backend/README.md) for the movie flow, endpoint contracts and the files responsible for each rule. The app renders the API's hero/trending sections and search results; it no longer selects or ranks those lists itself.

## Account reminders and nearby cinemas

Release subscriptions are saved per user in `ReleaseReminder`. `GET /api/reminders` returns the signed-in user's subscriptions; `PUT /api/reminders/:movieId` subscribes idempotently, and `DELETE /api/reminders/:movieId` removes only that user's subscription. The backend calculates `remindAt` from the movie's current saved release date at **10:00 Buenos Aires time**. Missing, invalid, hidden or past releases cannot create a new reminder. Existing subscriptions with elapsed dates return `remindAt: null` and are not scheduled again.

`RemindersProvider` restores account subscriptions on login/resume. Native development builds register an Expo push token through authenticated `PUT /api/push/devices`. An installation secret protects device ownership; registration binds the device to the current account and session. Logout removes that session's devices. The app clears old local release alerts during migration.

The server worker checks due reminders every minute, starting at **10:00 Buenos Aires time on the release date**. `PushDelivery` stores attempts, Expo tickets and receipts. Temporary failures retry with backoff; invalid tokens are disabled. Subscriptions and session validity are checked before sending. Deliveries are idempotently queued per account/device/movie/date, but a crash after Expo accepts a send can still produce a duplicate. A successful receipt confirms provider handoff, not that a person saw the alert.

Browser users can save subscriptions; push delivery requires the mobile app, permission, a real EAS project ID, Android/iOS credentials and a physical-device development build. Expo Go is not supported for remote push. Set `EXPO_PUBLIC_EAS_PROJECT_ID`, `EXPO_PUBLIC_ANDROID_PACKAGE` and/or `EXPO_PUBLIC_IOS_BUNDLE_ID`, then follow the [Expo push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/). `eas.json` provides development, preview and production profiles. See [deploy/README.md](deploy/README.md) for deployment and device validation. Physical-device delivery has not yet been verified.

Nearby cinemas are requested with authenticated `POST /api/cinemas/nearby` and JSON `{ lat, lng, radiusM? }`. Coordinates must be numeric and in range; radius defaults to 15 km and is limited to 1–50 km. The backend alone queries [OpenStreetMap Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API), validates/deduplicates results, computes distances, filters by the requested radius and returns the nearest 20. The phone only requests location permission, obtains its coordinates, formats distances and opens directions.

The response is `{ cinemas, source, updatedAt }`. `source` is `live`, `cache` or `stale`. A persistent six-hour cache groups queries by rounded 0.01-degree area centers and radius; the upstream query adds a 1 km margin, then exact distances are recalculated for each request. Precise request coordinates and user IDs are not stored in this cache. Concurrent queries for the same area share one upstream request. The cache is bounded to 1,000 areas. Provider failures can use results up to 24 hours old, explicitly labeled in the app; without usable cached data the API returns 503. Requests have bounded timeouts, a fallback public instance, and per-client rate limits. Set backend `OVERPASS_URL` to use a custom provider.

Tests use a local Overpass fixture for success, malformed-input, caching, coalescing and outage cases; they do not use a person's GPS location. Live public-provider availability is independent of these tests.

## Reward fulfillment, images and deployment

Staff can validate and use reward codes from Settings → Validar canjes. Superadmins can refund unused redemptions. The backend enforces ownership, roles, expiration and single-use behavior; concurrent redemption attempts cannot spend the same code twice. Refunds restore available points through the saved ledger.

`POST /api/uploads` accepts authenticated JPEG/PNG images, validates decoded pixels, removes metadata and stores resized WebP files. Reviews save image URLs; uploaded review images require ownership. `/media/:filename` serves these public images. Keep the upload directory on persistent storage. `npm run media:migrate` in the backend backs up the database and converts legacy embedded images. `npm run db:backup` snapshots SQLite and copies uploads into the same backup folder.

[deploy/README.md](deploy/README.md) describes the single-host Docker setup, HTTPS, initial administrator, backups and mobile push setup. CI checks app types and backend types, tests and build. Production rejects demo seeding and placeholder JWT secrets. Container startup, public hosting and physical-device notification delivery still require validation in the target environment.

## Points history and Wallet vouchers

Earned achievement points are now permanent, with a saved transaction history for earning, spending and refunds. The Logros screen displays the server's available balance and paginated history. Run `npm run points:migrate` inside the backend after applying migrations to backfill existing accounts once; it is safe to repeat. Current eligible achievements can be recovered, but previously deleted activity cannot.

Mis canjes offers Apple Wallet on iOS, Google Wallet on Android, and both on web. Each pass represents an existing reward voucher with its single-use code. Real issuer accounts and signing credentials must be configured first; see [Wallet setup](deploy/WALLET.md). Saving a pass does not book a cinema showing or seat. Saved passes do not yet update automatically after use/refund; staff must validate the code online.

Settings includes Probar notificaciones. Expo Go displays an explanation instead of attempting remote push registration; a physical-device development build and Expo credentials are still required for push testing.

Users can cancel their own unused canjes from Logros → Mis canjes → Anular canje y recuperar puntos. The backend invalidates the voucher and restores its original points atomically. Canceled vouchers leave the current list, while an inactive audit record and point history remain to prevent repeated refunds. Used vouchers cannot be canceled. Repeated requests never grant extra points.
