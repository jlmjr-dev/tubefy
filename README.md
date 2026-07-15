# Tubefy

Turn a Spotify playlist into a YouTube music-video mix, then watch it in a clean
cinematic player. Tubefy connects your Spotify and YouTube accounts, matches each
track to its best music video, lets you review and remap the shaky matches, builds
the playlist on your YouTube, and plays it back.

The whole product is one continuous flow:

```
Login (connect both) -> Home -> Watch (browse -> player)
Login (connect both) -> Home -> Create (pick -> matching -> review -> success -> player)
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (the `base-sera` style)
- `react-router-dom` for the screen flow
- `lucide-react` icons, `Instrument Sans` + `Lora` fonts
- Pure frontend SPA: Spotify Authorization Code + PKCE and Google Identity
  Services token model, no backend and no client secrets

## Running locally

Tubefy talks to the real Spotify and YouTube APIs, so it needs your own OAuth
credentials. See [SETUP.md](SETUP.md) for the full walkthrough (creating the
Spotify + Google Cloud apps, scopes, redirect URIs, and quota notes).

```bash
pnpm install
cp .env.example .env.local   # then fill in your client ids
pnpm dev                     # http://127.0.0.1:5173
```

> The dev server runs on `http://127.0.0.1:5173` on purpose: Spotify no longer
> allows `localhost` as an OAuth redirect host.

## Scripts

```bash
pnpm dev        # start the dev server
pnpm build      # typecheck + production build
pnpm typecheck  # type-check only
pnpm lint       # eslint
```
