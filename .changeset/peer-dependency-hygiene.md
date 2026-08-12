---
"@osuki-dev/kit-community": minor
"@osuki-dev/ui": minor
---

Let the host app own every shared runtime library.

`@osuki-dev/kit-community` moved `@tanstack/react-form` from `dependencies` to
`peerDependencies`. It is only used by `TanstackForm`, and shipping it as a hard
dependency meant an app that already used TanStack Form could end up with two
copies and a broken form context. Apps using `TanstackForm` must now install
`@tanstack/react-form` themselves.

`@osuki-dev/ui` dropped `react-native-worklets` from `peerDependencies`. No
source file in the package imports it — Reanimated 4 declares it as its own
peer, so listing it here only forced a redundant install.
