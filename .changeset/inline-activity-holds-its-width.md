---
"@osuki-dev/ui": patch
---

`InlineActivity` now keeps its width when `active` flips, not just its height.

The row is a flex row with a gap, so unmounting the spinner also took the gap that followed it, and the caption slid left by a spinner plus a gap the moment the work ended -- 24px at `size="sm"`, 40px at `size="lg"`. The docstring had promised for as long as the component existed that a row reporting both states does not jump. It now holds an inert, same-sized box in the spinner's slot while idle, hidden from assistive technology and from touches, so the caption starts at the same x in both states. The box is empty rather than a faded spinner, so nothing keeps animating off screen.

`Spinner` and `InlineActivity` read those dimensions from one shared map instead of each carrying its own copy, so the reserved box cannot drift from the spinner it stands in for.
