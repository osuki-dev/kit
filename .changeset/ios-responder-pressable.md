---
"@osuki-dev/ui": patch
---

`PressableScale` and `PressableCard` use React Native's own `Pressable` on iOS
again and keep gesture handler's native press recognition on Android only.
`react-native-gesture-handler` 3.4's iOS button marks both its host view and
the inner button as accessibility elements with the same label, so VoiceOver
and UI test tooling saw every press surface twice. The Android press problem
the native recognition fixed never occurred on iOS.
