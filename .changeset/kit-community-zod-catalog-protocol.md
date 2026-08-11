---
"@osuki-dev/kit-community": patch
---

Fix an unpublishable `zod` range, and move `zod` to a peer dependency.

`0.2.0` shipped with `"zod": "catalog:"` in `dependencies`. `catalog:` is a bun workspace protocol that `bun publish` resolves to a real range at pack time -- but this repo releases through `changeset publish`, which shells out to npm, and npm writes the literal string into the tarball. Every consumer, on every package manager, failed to install `0.2.0`: the range is not valid semver and does not resolve. The package has been broken since it was published.

`zod` is also the wrong kind of dependency here. It is part of the public surface, not an implementation detail -- `parseEntity` and `useForm` take a caller-supplied `z.ZodType<T>`, and `useForm` narrows it with `schema instanceof z.ZodObject`. A consumer resolving its own copy of zod alongside a bundled one makes that `instanceof` return `false` against a schema that is, by every other measure, a `ZodObject`; the field-level branch silently stops running and nothing reports an error. Declaring the peer keeps one copy in the tree and makes a version conflict a resolution-time complaint instead of a runtime mystery. It ships now because a package nobody can install has no upgrade path to break.

`smoke:public-packages` already refused `workspace:` in publishable ranges; it now refuses `catalog:` on the same grounds, so the next bun-only protocol to reach a runtime dependency fails the check rather than the install.
