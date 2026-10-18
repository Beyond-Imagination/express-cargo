# express-cargo benchmarks

Compares express-cargo with zod and class-validator + class-transformer on the same request schema.
All three routes live in one Express app (`src/app.ts`) and must return identical responses; the
HTTP benchmark checks that on 27 cases before it measures anything.

## Scripts

Run these from `apps/benchmarks`. Each one builds `express-cargo` and the app before it starts.

| Script                                                                                                              | What it measures                                                                                           |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm benchmark [calls=1000] [concurrency=1000]`                                                                    | HTTP throughput and latency per scenario and route                                                         |
| `pnpm benchmark:inprocess [calls=20000] [samples=7]`                                                                | express-cargo middleware called directly, without HTTP                                                     |
| `pnpm benchmark:order [rounds=2] [calls=20000] [concurrency=1000]`                                                  | the HTTP benchmark once per route order (all 6), to see how much the measurement position moves each route |
| `pnpm benchmark:compare <base ref> <target ref> [rounds=6] [calls=20000] [concurrency=1000] [--inprocess-rounds=3]` | express-cargo at two git refs, HTTP and in-process, against the same app                                   |

`benchmark` also accepts `--order=zod,express-cargo,class-validator` to change the order the routes
are measured in, and `--json=<file>` to save the summaries next to the HTML report.

`benchmark:compare` compiles `packages/express-cargo/src` at each ref into `dist/cjs` and rebuilds
the working tree when it finishes. The build that runs first alternates every round. The app itself
always comes from the working tree, so both refs must export what `src/app.ts` imports.

Results go to `benchmark-results-*` in the current directory (git-ignored).
