---
"@osuki-dev/ui": minor
---

Let consumers override the fill of the three surfaces that owned it outright: `ToastProvider` takes `toastStyle` and `showToast` takes `style`, both merged onto the toast body after the variant fill; `Skeleton` sends a `style.backgroundColor` override to its lines instead of its wrapper when `lines` is above 1; and `KeyboardToolbar` takes `backgroundColor`, since its native props accept no `style`.
