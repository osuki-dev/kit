---
"@osuki-dev/ui": patch
---

The `Button` root is a column again, as in 1.x. The 2.0 row root measured its content against the parent inside a wrapping column, so buttons there grew to twice their width with off-centre labels. `Button.Root` now keeps `Button.Background` as a layer and lays every other part out in one centred row, so compound buttons render as before.
