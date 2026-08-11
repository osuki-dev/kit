---
"@osuki-dev/kit-community": patch
---

Widen the `@osuki-dev/ui` peer range to admit every `0.x` release.

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
