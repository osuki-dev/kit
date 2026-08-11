# Releasing

Releases are automated. A human writes a changeset; everything else runs in CI.

## Day to day

Any PR that changes published behavior needs a changeset:

```bash
bun run changeset
```

Pick the packages, pick the bump, and write one sentence aimed at a consumer —
it becomes the changelog entry. Commit the generated file in `.changeset/`.

Skip the changeset for changes that never reach npm: the showcase app, docs,
CI, and repository policy.

### Which bump

`@osuki-dev/ui` and `@osuki-dev/kit-community` are `fixed` — they always release
together on the same version, so the support matrix stays meaningful.

During `0.x`:

| Change                                    | Bump                         |
| ----------------------------------------- | ---------------------------- |
| Bug fix, no API change                    | patch                        |
| New component, prop, or variant           | minor                        |
| Removed or renamed export                 | minor (breaking, documented) |
| **Renamed a semantic or component token** | minor (breaking, documented) |

The token case is easy to get wrong. Consumers key their theme overrides on
token names, so renaming one breaks them exactly like removing an export. Say so
in the changeset.

## What CI does

On every push to `main`, `.github/workflows/release.yml` runs `check:ci` and
`smoke:public-packages` first — a release must never be the first place those
run.

Then, depending on whether unreleased changesets exist:

- **Changesets pending** → the workflow opens a `chore: version packages` PR
  containing the version bumps and generated changelogs. Review it like any
  other PR.
- **No changesets pending** (i.e. that PR was merged) → the workflow builds and
  publishes to npm.

So a release is: merge the version PR. Nothing else.

## Publishing credentials

There are none. Publishing uses
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers) over OIDC:
the workflow proves its identity to npm directly, so no `NPM_TOKEN` is stored in
repository secrets.

**This requires one-time setup on npmjs.com per package.** Until it is done, the
publish step fails with an authentication error:

1. Open the package settings on npmjs.com
2. Under **Trusted publishers**, add a GitHub Actions publisher
3. Repository `osuki-dev/kit`, workflow `release.yml`
4. Repeat for both `@osuki-dev/ui` and `@osuki-dev/kit-community`

Packages published this way carry npm provenance automatically.

## Build behavior worth knowing

`bun pm pack` does **not** run `prepack`, but `bun publish` does. That asymmetry
already produced one archive with no `lib/` during setup. The release script
therefore builds explicitly rather than relying on either behavior:

```json
"release:packages": "bun run build:packages && changeset publish"
```

`smoke:public-packages` builds first for the same reason, and asserts that
`lib/index.js` and `lib/index.d.ts` are present in the archive.

## Peer ranges

`@osuki-dev/kit-community` depends on `@osuki-dev/ui` with a caret range
(`^0.2.0`). This is deliberate: changesets rewrites internal dependency ranges
on every version bump, and it can only preserve an upper bound when the range
uses a form it understands. A `>=0.2.0 <1.0.0` range was silently rewritten to
`>=0.2.1`, which would have let a future major satisfy it.

If you edit that range, re-run `bunx changeset version` on a probe changeset and
confirm the result still has an upper bound.

## Supporting a new Expo SDK

One release line supports one Expo SDK. When a new SDK ships:

1. Upgrade `apps/native` and verify on both simulators
2. Widen or move the `peerDependencies` ranges in both packages
3. Update the support matrix in the [README](../README.md)
4. Write a `minor` changeset describing the SDK change

Old SDKs are not backported.
