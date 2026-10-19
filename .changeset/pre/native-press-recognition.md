---
"@osuki-dev/ui": minor
---

`PressableScale` and `PressableCard` now recognise presses natively through
`react-native-gesture-handler`'s `Pressable` instead of the JS responder
system. On Android, React Native's `ScrollView` can keep capturing every touch
after a fling is stopped by a tap, and a stale layout measurement can cancel a
press on the slightest finger movement; both left a scrolled list visibly
normal but impossible to press. Native recognition is not subject to either.

`react-native-gesture-handler` >= 3.4.0 is now a required peer dependency, and
the app must be wrapped in `GestureHandlerRootView`. `Modal`, `BottomSheet` and
`Popover` wrap their content in their own root, because Android draws a modal
in a separate window; an app rendering React Native's `Modal` directly must do
the same around kit press components. Press callbacks receive
gesture handler's `PressableEvent` instead of `GestureResponderEvent`.
