# docs

Docusaurus app for the `express-cargo` documentation site.

## Prerequisites

- Node.js `>=20` (repo baseline)
- `pnpm` (workspace package manager)

## Install dependencies

From repository root:

```bash
pnpm install
```

## Common commands

Run from repository root:

```bash
# start local docs dev server
pnpm --filter docs start

# build static docs output
pnpm --filter docs build

# serve the built output locally
pnpm --filter docs serve

# docs TypeScript check
pnpm --filter docs typecheck
```

You can also run equivalent commands inside `apps/docs` with `pnpm run <script>`.

## i18n workflow

This docs app supports multiple locales (`en`, `ko`, `de`, `fr`).

```bash
# extract translation files
pnpm --filter docs write-translations

# generate heading IDs for translation workflows
pnpm --filter docs write-heading-ids
```

## Deployment notes

The app includes a `deploy` script (`docusaurus deploy`). Use your CI/CD pipeline or deployment environment variables as appropriate for your target.

Base URL and site URL are environment-aware in `docusaurus.config.ts`:

- development : Vercel deployment with env setting (`VERCEL=1`) 
- production : GitHub Pages URL with `/express-cargo/` base path

## Environment variables

`docusaurus.config.ts` reads New Relic browser agent fields from environment variables:

- `NEW_RELIC_ACCOUNT_ID`
- `NEW_RELIC_TRUST_KEY`
- `NEW_RELIC_AGENT_ID`
- `NEW_RELIC_LICENSE_KEY`
- `NEW_RELIC_APP_ID`

Set these only in secure environment configuration for deployments.
