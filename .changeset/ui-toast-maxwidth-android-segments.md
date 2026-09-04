---
"@osuki-dev/ui": patch
---

Two fixes carried by muqun as a patch file, now upstream so the patch can go.

`ToastProvider` takes a `maxWidth`. Toasts were `width: "100%"` with the theme's
horizontal margin, which is right on a phone and wrong on a tablet or in
landscape, where a three-word notice became a banner the width of the screen.
The viewport aligns cards to the trailing edge so a capped card sits where a
notification is expected rather than centred in empty space.

`SegmentedControl` renders the design system's own segments on Android. The
native `@expo/ui` control is `UISegmentedControl` on iOS, compact enough to sit
inside the decorative track this component draws; on Android it is Material's
`SegmentedButtonRow`, which brings a full outlined track of its own, wants more
height than the padding leaves it, and so drew the selected segment taller
than the control and pushed the last option past the track's corner. The JS
segments were already what the documented design rules describe and were
reachable only when an option was disabled; Android takes them now, iOS keeps
the native widget.
