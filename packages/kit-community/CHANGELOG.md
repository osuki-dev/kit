# @osuki-dev/kit-community Changelog

## 0.3.0

### Patch Changes

- [`d1b6048`](https://github.com/osuki-dev/kit/commit/d1b6048d6dadf8b7fede5883a314b18dd5c770d7) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Widen the `@osuki-dev/ui` peer range to admit every `0.x` release.

  The range was `^0.2.0`. Under semver a caret on a `0.x` version means
  `>=0.2.0 <0.3.0` — every `0.x` minor counts as breaking — so a consumer on
  `@osuki-dev/ui@0.3.0` got a peer conflict against a package built to be released
  alongside it. `>=0.2.0 <1.0.0` admits the whole `0.x` line and still excludes
  the eventual `1.0.0`. The two packages ship together on one version, which is
  what makes the wider range safe to state.

  This does not change how the release is versioned. Changesets bumps a package
  whose peer dependency is in the same release batch, regardless of whether the
  new version falls inside the declared range, and `onlyUpdatePeerDependentsWhenOutOfRange`
  does not suppress it — the version numbers for this release were set explicitly.

- [`867d3f7`](https://github.com/osuki-dev/kit/commit/867d3f7a84ed0ea7972ca37e1ac987800e884750) Thanks [@ryuhzk](https://github.com/ryuhzk)! - Fix an unpublishable `zod` range, and move `zod` to a peer dependency.

  `0.2.0` shipped with `"zod": "catalog:"` in `dependencies`. `catalog:` is a bun workspace protocol that `bun publish` resolves to a real range at pack time -- but this repo releases through `changeset publish`, which shells out to npm, and npm writes the literal string into the tarball. Every consumer, on every package manager, failed to install `0.2.0`: the range is not valid semver and does not resolve. The package has been broken since it was published.

  `zod` is also the wrong kind of dependency here. It is part of the public surface, not an implementation detail -- `parseEntity` and `useForm` take a caller-supplied `z.ZodType<T>`, and `useForm` narrows it with `schema instanceof z.ZodObject`. A consumer resolving its own copy of zod alongside a bundled one makes that `instanceof` return `false` against a schema that is, by every other measure, a `ZodObject`; the field-level branch silently stops running and nothing reports an error. Declaring the peer keeps one copy in the tree and makes a version conflict a resolution-time complaint instead of a runtime mystery. It ships now because a package nobody can install has no upgrade path to break.

  `smoke:public-packages` already refused `workspace:` in publishable ranges; it now refuses `catalog:` on the same grounds, so the next bun-only protocol to reach a runtime dependency fails the check rather than the install.

- Updated dependencies [[`ba6fa6a`](https://github.com/osuki-dev/kit/commit/ba6fa6ada2e4d1e446017816aad8ef8e865617c5), [`ba6fa6a`](https://github.com/osuki-dev/kit/commit/ba6fa6ada2e4d1e446017816aad8ef8e865617c5)]:
  - @osuki-dev/ui@0.3.0

## 0.0.1

- Establish the community package boundary for reusable Osuki screen templates.
- Keep production Shopify OAuth, billing, webhook, and entitlement logic out of the public package.
