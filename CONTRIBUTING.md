# Contributing

Thanks for wanting to help make Code Typer better. This is a small project, so every bug report, typo fix, and new feature makes a difference.

## Requirements

- **Bun 1.3.6**
- **GitHub API token** to run the snippet seeding scripts
- **Docker** (optional)

## Setup

1. Fork the repo and clone your fork.
2. Install dependencies: `bun install`.
3. Copy `.env.example` to `.env`

   ```bash
   cp .env.example .env
   ```

   Tweak the values to match your local setup. Don't forget to drop your GitHub token into `GITHUB_API_TOKEN`, which is needed to get the snippets.

4. Start Postgres:
   - **Docker:** `docker compose up db -d` spins up the same Postgres config referenced in `.env`.
   - **Local install:** make sure the credentials (either `DATABASE_URL` or `POSTGRES_*`) match your running server.
5. Sync Prisma with the database:
   ```bash
   bunx prisma db push   # creates tables
   bunx prisma db seed   # seeds languages, files and snippets
   ```
   Note that this process is expected to take a while (~10 minutes).
6. Run the dev server using `bun run dev`.

## Pull request checklist

- Create a branch off `main` with a descriptive name (`feature/auto-closing-tweak`, `fix/language-picker`, etc.).
- Keep changes scoped. Smaller PRs get reviewed faster.
- Update docs when behavior changes (README, this file, inline comments).
- Run `bun run lint`, `bun run prettier`, and `bun run build` locally.
- Include screenshots or screen recordings if you touch UI/UX. A quick Loom/GIF helps reviewers verify the behavior without pulling the branch immediately.
- Push your branch and open a PR against `main`. Describe the problem, your solution, and any follow-up work you’re leaving for later.

## Reporting issues

Not ready to code? Filing issues is just as helpful. When you open one, share:

- What you expected vs. what happened.
- Steps to reproduce (including browser/OS if UI-related).
- Screenshots or videos when visual glitches appear.
