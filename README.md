<p align="center">
  <img src="public/android-chrome-512x512.png" alt="TrackGames game artwork background" width="20%" />
</p>

# TrackGames

TrackGames is a game library and profile platform for tracking what you play, rating games, building playlists, logging playtime, and sharing public profiles with friends.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square)
![React](https://img.shields.io/badge/React-19.2-149eca?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2d3748?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)
[![wakatime](https://wakatime.com/badge/user/c1689fc3-1f39-4c70-8cd9-d2ed3ed4dce8/project/ef2aba7f-788c-4fe2-aadd-b8e02954cdeb.svg?style=flat-square)](https://wakatime.com/badge/user/c1689fc3-1f39-4c70-8cd9-d2ed3ed4dce8/project/ef2aba7f-788c-4fe2-aadd-b8e02954cdeb)

## Features

- Personal game libraries with statuses, ratings, favorites, tags, notes, and play logs.
- Public user profiles with custom colors, backgrounds, widgets, social links, badges, and privacy controls.
- Playlists with grid, ranked, and tier-list style presentation.
- Game discovery pages for trending games, yearly highlights, recent releases, coming soon, anticipated games, and hidden gems.
- Game detail pages with cover art, screenshots, video embeds, metadata, related games, community stats, and comments.
- Social features including follows, likes, comments, notifications, and profile activity.
- Steam library import plus TrackGames `.tg` backup import/export.
- IGDB-backed game data import and webhook refresh support.

## Tech Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript.
- **Database:** PostgreSQL with Prisma 7 and generated client output in `src/lib/generated/prisma`.
- **Auth:** Auth.js / NextAuth with credentials, GitHub, Discord, Twitch, and Google providers.
- **Styling:** Tailwind CSS 4, project CSS variables, Prettier Tailwind sorting.
- **External data:** IGDB via Twitch credentials and Steam Web API.

## Requirements

- Node.js `22.13.x`
- npm
- PostgreSQL 16
- Twitch developer credentials for IGDB imports
- Steam Web API key for Steam library imports

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
DATABASE_URL="postgresql://trackgames:trackgames@localhost:5432/trackgames"
AUTH_SECRET="replace-with-a-long-random-secret"
PASSWORD_VERSION="1"

TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
STEAM_API_KEY=""

IGDB_WEBHOOK_BASE_URL=""
IGDB_WEBHOOK_SECRET=""

AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_DISCORD_ID=""
AUTH_DISCORD_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_TWITCH_ID=""
AUTH_TWITCH_SECRET=""
```

Start PostgreSQL. The included compose file starts a local Postgres 16 service:

```bash
docker compose up -d
```

Apply migrations and generate Prisma output:

```bash
npx prisma migrate dev
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Import

TrackGames needs game metadata before discovery and game pages become useful.

```bash
npm run import:api
```

Useful related commands:

```bash
npm run import:clear-data
npm run webhooks:register
```

`import:api` pulls configured IGDB datasets into PostgreSQL. `webhooks:register` registers IGDB webhook callbacks and requires `IGDB_WEBHOOK_BASE_URL`, `IGDB_WEBHOOK_SECRET`, `TWITCH_CLIENT_ID`, and `TWITCH_CLIENT_SECRET`.

## Developer Workflow

Run the main checks before opening a pull request:

```bash
npm run check
```

Common scripts:

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the Next.js dev server.                    |
| `npm run dev:webpack`  | Start the dev server with webpack.               |
| `npm run build`        | Generate Prisma client output and build the app. |
| `npm run start`        | Run the production build.                        |
| `npm run lint`         | Run ESLint.                                      |
| `npm run lint:fix`     | Fix ESLint issues where possible.                |
| `npm run format`       | Format files with Prettier.                      |
| `npm run format:check` | Check Prettier formatting.                       |
| `npm run tc`           | Run TypeScript without emitting files.           |
| `npm run check`        | Run typecheck, lint, and format check.           |
| `npm run check:all`    | Run all checks even if one fails.                |

## Project Layout

```text
src/app                 Next.js routes, layouts, API routes, and Open Graph images
src/components          Shared UI, game, library, playlist, social, and user components
src/lib/actions         Server actions for auth, library, settings, imports, playlists, and social flows
src/lib/account         User profile, preferences, roles, badges, and widget logic
src/lib/cache           Cached IGDB/API resources and rate limiting
src/lib/data            Database read helpers for games, libraries, playlists, comments, and stats
src/lib/external        IGDB and Steam integrations
src/lib/generated       Prisma generated client output
src/scripts             Import, data clearing, and webhook registration scripts
prisma                  Schema and migrations
public/assets           Static visual assets used by the app and this README
```

## Notes

- This project uses Next.js 16. Before changing framework-specific code, read the relevant guide in `node_modules/next/dist/docs/`.
- Do not hand-edit generated Prisma files in `src/lib/generated/prisma`; update `prisma/schema.prisma` and regenerate instead.
- `docker-compose.yml` currently contains a Windows-style bind mount for the Postgres data directory. Adjust the volume path if you are running Docker from another environment.
- Keep `.env.local` private. It contains database credentials, auth secrets, and API keys.
