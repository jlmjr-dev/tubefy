# Setup

Tubefy is a pure frontend SPA that talks directly to the real Spotify and
YouTube APIs, so it needs your own OAuth **client ids** (there are no client
secrets). This walks through creating both apps and running locally.

Everything runs at **`http://127.0.0.1:5173`**. Use that exact origin, not
`localhost` — Spotify no longer accepts `localhost` as an OAuth redirect host,
and the two are different origins to Google as well.

## 1. Spotify app

1. Open the [Spotify developer dashboard](https://developer.spotify.com/dashboard)
   and **Create app**.
2. Under the app settings, add this exact **Redirect URI**:

   ```
   http://127.0.0.1:5173/callback
   ```

3. The app only needs the **Web API**. Tubefy requests these scopes:
   `playlist-read-private`, `playlist-read-collaborative`, `user-read-email`.
4. Copy the **Client ID**.
5. A new app starts in development mode. Add each person who will sign in (by
   email) under **Settings -> User Management** — a dev-mode app only lets
   allow-listed users authenticate.

## 2. Google / YouTube app

1. In the [Google Cloud console](https://console.cloud.google.com/), create (or
   pick) a project.
2. **APIs & Services -> Library ->** enable **YouTube Data API v3**.
3. **APIs & Services -> OAuth consent screen**:
   - User type **External**, publishing status **Testing**.
   - Add your Google account under **Test users**. (Testing mode lets you use the
     sensitive YouTube scopes without Google verification. Note: test-user
     consent expires after 7 days, so you may need to reconnect roughly weekly.)
4. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID**:
   - Application type **Web application**.
   - Under **Authorized JavaScript origins**, add `http://127.0.0.1:5173`
     (add `http://localhost:5173` too if you ever serve from there).
   - No redirect URI is needed — Tubefy uses the Google Identity Services token
     model, which only needs the JS origin.
5. Copy the **Client ID**. Tubefy requests the `youtube` scope, which covers
   both browsing playlists and creating them.

## 3. Configure and run

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Then:

```bash
pnpm dev
```

Open `http://127.0.0.1:5173`, connect both platforms, and Enter Tubefy.

## Quota notes

YouTube's June 2026 quota change put `search.list` on its own bucket of about
**100 search calls per day**. Tubefy runs one search per track, so a single
conversion of a 50-track playlist uses ~50 of those — roughly **two full
conversions per day** on the default quota. Reads (browsing, playing) are cheap.

To stay safely under the ceiling, a conversion is capped at
`VITE_MAX_TRACKS` (default 50). Lower it while experimenting:

```
VITE_MAX_TRACKS=20
```

Created playlists are made **private** on your channel. Building a 50-track
playlist also spends ~2,550 units of the shared 10,000/day pool (playlist +
inserts), which is comfortably within budget.

## Troubleshooting

- **Spotify redirect error / INVALID_CLIENT: Invalid redirect URI** — the
  dashboard Redirect URI must be byte-identical to `http://127.0.0.1:5173/callback`.
- **Spotify 403 on API calls** — the signing-in account is not on the dev-mode
  user allow-list (Settings -> User Management).
- **Google "app isn't verified"** — expected in Testing mode; continue via
  Advanced. If a test user can't consent, confirm they're listed under Test users.
- **YouTube 403 quota exceeded** — you hit the ~100 search/day limit; wait for the
  daily reset or lower `VITE_MAX_TRACKS`.
- **YouTube session expired after a week** — Testing-mode consent expires after
  7 days; just reconnect.
