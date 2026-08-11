# @osuki-dev/ui — documentation

Read this file first. It is short on purpose: it says what the kit is, states
the four rules that are not negotiable, and points at the one other file you
need for whatever you are about to build.

These files ship inside the npm package (`node_modules/@osuki-dev/ui/docs`), so
an agent working in a project that depends on the kit can read them without
network access, and they can never drift from the version installed.

## What this is

A React Native and Expo component kit: 61 component modules exporting around 70
components, one theme, dark and light with equal care. It was built for products that are read as much as they
are tapped — dense screens, long lists, CJK text beside Latin text — and every
default in it comes from that.

It is not a styling library. There is no `className`, no utility props, no
escape hatch that lets a component be repainted at the call site. What a
component looks like is decided by the theme; what it does is decided by its
props.

## The four rules

**1. Colour comes from the theme, never from a literal.** Every component reads
`useThemeTokens()`. A hex value in application code is a bug that only shows up
in the other colour mode, which is the mode you are not looking at.

**2. Spacing and radius come from tokens too.** `theme.spacing.md`, not `12`.
The scale is what keeps a screen assembled from six components looking like one
screen.

**3. Anything tappable is at least 44pt.** Components enforce it; layouts wrap
them can defeat it. If you set a height on a pressable, set it to 44 or more.

**4. Text is `<Text>`, from this kit.** React Native's own `Text` does not carry
the line-height CJK needs, and the two are indistinguishable in an English
screenshot — which is how a Japanese screen ends up with clipped descenders
three releases later.

## Where to go next

| You are…                            | Read                                       |
| ----------------------------------- | ------------------------------------------ |
| starting a new app                  | [getting-started.md](./getting-started.md) |
| looking for the right component     | [components.md](./components.md)           |
| theming, dark mode, or brand colour | [theme.md](./theme.md)                     |
| assembling a screen                 | [patterns.md](./patterns.md)               |
| reviewing someone else's code       | [conventions.md](./conventions.md)         |

## Install

```sh
npm install @osuki-dev/ui
# or: bun add @osuki-dev/ui
```

There are twelve peer dependencies, not two or three:
`react-native-reanimated`, `react-native-safe-area-context`,
`react-native-svg`, `react-native-worklets`,
`react-native-keyboard-controller`, `lucide-react-native`, `expo-font`,
`expo-image`, `expo-router` and `@expo/ui`, beside React and React Native
themselves. [getting-started.md](./getting-started.md) has the version table
and says which components need which. In an Expo project install them with
`npx expo install` so the versions match the SDK.

Sheets and pressables are built on React Native's own `Pressable` and
Reanimated — `react-native-gesture-handler` is not required.
