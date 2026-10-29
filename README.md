> Desarrollo mobile con repos separados: ejecutar `npm run dev` en esta carpeta para Expo. Ejecutar `npm run dev` y `npm run worker` en `../aplicaciones-moviles-2026-back` en terminales separadas. `npm run backend` es un acceso al servidor externo.
>
> `EXPO_PUBLIC_API_URL` vacío usa el host de Expo y el puerto 3000; teléfono y servidor deben estar en la misma red. Para otro servidor, configurar su URL accesible desde el teléfono. La copia `backend/` se conserva temporalmente como referencia y ya no se inicia con estos scripts. Las instrucciones históricas de arranque combinado que siguen están reemplazadas por estas.
# WhatNext

Expo frontend for WhatNext. The complete API, Prisma database, movies, points, auth, scheduled jobs, push and Wallet live in the separate [appsmovilesBACK repository](https://github.com/Zand3r5/appsmovilesBACK).

## Run locally

Keep both checkouts beside each other:

```text
Documents/
  aplicaciones-moviles-2026/   frontend
  appsmovilesBACK/             API, worker, SQLite, uploads, private .env
```

On the configured development computer, run from this frontend:

```sh
npm run dev
```

This launches the standalone API on port 3000, its worker, and Expo with its interactive terminal/QR code. Ctrl+C stops all three. The launcher uses Node 22 for SDK 58 compatibility without changing the system Node installation. It does not create a second database or start a bundled backend.

For two terminals, use `npm run backend` here for the API/worker, then `npx expo start --go` for Expo (use Node 22 when launching Expo directly). `npm start` starts only Expo. Scan the QR code with the iPhone Camera or Expo Go on Android; real remote push requires a development/production build and platform credentials.

For a fresh machine, install frontend dependencies with `npm ci`, clone the backend beside it, and follow that repository’s setup guide to install dependencies and configure its private `.env`. For a different checkout location, set `WHATNEXT_BACKEND_DIR` to the backend directory before starting development. Secrets and real database contents are not distributed through Git.

Leave frontend `EXPO_PUBLIC_API_URL` empty for local development. The app follows Expo’s network hostname on API port 3000; keep the phone and computer on the same Wi-Fi. Set a public HTTPS API URL for production. The Expo tunnel does not expose the API.

Backend configuration and data are now in `../appsmovilesBACK/.env`, `../appsmovilesBACK/prisma/local.db` and `../appsmovilesBACK/uploads`. Existing accounts were preserved; log in again after transfer because the old sessions were retired. Backend deployment and Prisma Studio commands run in that separate repository.

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

Existing users can log in with their saved credentials. The standalone backend’s `db:seed` initializes missing reward/achievement/rank definitions without deleting accounts.

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

## Verification and backend documentation

Run `npm run typecheck` and `npm test` here for frontend checks. The backend has its own type checks, build, integration tests and deployment in its repository.

See the [backend README](https://github.com/Zand3r5/appsmovilesBACK) and [architecture guide](https://github.com/Zand3r5/appsmovilesBACK/blob/main/ARCHITECTURE.md) for API contracts, calculations and the files responsible for each function.

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

[deploy/README.md](deploy/README.md) describes the single-host Docker setup, HTTPS, initial administrator, backups and mobile push setup. Frontend CI checks frontend types and tests; backend CI checks server types, tests and build. Production rejects placeholder JWT secrets. Container startup, public hosting and physical-device notification delivery still require validation in the target environment.

## Points history and Wallet vouchers

Earned achievement points are now permanent, with a saved transaction history for earning, spending and refunds. The Logros screen displays the server's available balance and paginated history. Run `npm run points:migrate` inside the backend after applying migrations to backfill existing accounts once; it is safe to repeat. Current eligible achievements can be recovered, but previously deleted activity cannot.

Mis canjes offers Apple Wallet on iOS, Google Wallet on Android, and both on web. Each pass represents an existing reward voucher with its single-use code. Real issuer accounts and signing credentials must be configured first; see [Wallet setup](deploy/WALLET.md). Saving a pass does not book a cinema showing or seat. Saved passes do not yet update automatically after use/refund; staff must validate the code online.

Settings includes Probar notificaciones. Expo Go displays an explanation instead of attempting remote push registration; a physical-device development build and Expo credentials are still required for push testing.

Users can cancel their own unused canjes from Logros → Mis canjes → Anular canje y recuperar puntos. The backend invalidates the voucher and restores its original points atomically. Canceled vouchers leave the current list, while an inactive audit record and point history remain to prevent repeated refunds. Used vouchers cannot be canceled. Repeated requests never grant extra points.

## Backend-owned push notifications

Release reminders, incoming friend requests, review likes and reposts are queued and sent by the standalone backend worker. The app only requests permission, registers its push token, displays notifications and opens the relevant profile/movie when tapped. Social notifications are picked up on the next minute check; read/withdrawn/deleted events are skipped and repeated toggles are deduplicated. Android has separate Estrenos and Amistades y reseñas channels. Real push testing requires the installed development/production app, EAS/APNs/FCM credentials and a running API/worker.

For an installed development build with remote push support, use `npm run dev:client` instead of the Expo Go launcher. It starts the standalone API/worker and Expo in development-client mode with Node 22.
