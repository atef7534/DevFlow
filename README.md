# DevFlow

DevFlow is a personal developer growth workspace for project work, focus sessions, coding notes, and language learning. It is built with Next.js App Router, React, JavaScript, and Tailwind CSS. The workspace works locally first and saves its data in the current browser.

## What you can do

- Plan projects and tasks, with project progress derived from task completion.
- Keep searchable, tagged, project-aware notes.
- Run and record focus sessions connected to a project, task, or learning category.
- Review a public GitHub profile, repositories, languages, and recent activity.
- Study English, German, French, and Spanish with self-set CEFR levels, stable daily word sets, pronunciation, notes, saved words, review queues, and streaks.
- See focus, task, project, and vocabulary analytics calculated from saved workspace data.
- Search across projects, tasks, notes, languages, and vocabulary.
- Export and validate workspace JSON; change profile, reminders, and theme.

The first visit starts with an editable sample workspace. Language levels in the sample are marked as self-set; DevFlow does not claim to assess proficiency.

## Run locally

Use Node.js and pnpm:

```bash
pnpm install
pnpm dev
```

Create and serve a production build:

```bash
pnpm build
pnpm start
```

The development server runs at `http://localhost:3000` by default. The project pins Webpack for development and production builds so it also works in environments where Next.js's native Turbopack binary is unavailable.

## Optional Supabase sync and sign-in

Without environment variables, DevFlow stays local and no account is needed. To enable Supabase Auth and cloud snapshots, create a Supabase project, run [`supabase/migrations/001_workspace.sql`](supabase/migrations/001_workspace.sql), and add the public project URL and anon key to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart the development server after adding variables. The migration creates a per-user `workspace_snapshots` table with row-level security and a `delete_own_account()` RPC. Only the anon key belongs in the browser; never put a service-role key in a `NEXT_PUBLIC_` variable. Each signed-in user can read or update only their own snapshot.

## Structure

```text
src/
  app/                 App Router pages and global styles
  components/          Shared shell, UI primitives, and workspace pages
  data/                Sample workspace and CEFR vocabulary fallback data
  services/            Supabase and public GitHub API clients
  store/               Local-first workspace state, actions, and cloud sync
  utils/               Date, streak, progress, and display helpers
supabase/migrations/   Optional Auth-backed snapshot schema and RLS policies
```

## Data behavior and limitations

- In local mode, projects, tasks, notes, word progress, focus records, preferences, and timer state are stored under one versioned key in this browser's `localStorage`. Browser data does not sync across devices.
- When Supabase is configured, sign-in is required for workspace routes and a single JSON snapshot is synced to the authenticated user's RLS-protected row. The landing page and sign-in flow stay public.
- Daily vocabulary falls back to bundled, level-tagged word lists and is selected deterministically by local date and language. The fallback library is finite and does not use AI.
- GitHub data comes from public unauthenticated API endpoints, so GitHub's rate limit applies.
- Browser speech is used when the device provides a compatible speech-synthesis voice.
- Account deletion requires the supplied Supabase RPC; this cannot be used in local-only mode.
