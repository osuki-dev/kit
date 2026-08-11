# Component Template

Use this structure for each component page.

## Purpose

Describe when to use this component and when not to use it.

## Import

```tsx
import { ComponentName } from "@osuki-dev/ui";
```

## Props

| Prop      | Type   | Default   | Notes         |
| --------- | ------ | --------- | ------------- |
| `variant` | string | `default` | Visual style. |

## Examples

### Basic

```tsx
<ComponentName />
```

### Long Content

```tsx
<ComponentName title="A long localized title that should wrap cleanly" />
```

## Accessibility

- Required role or label.
- Keyboard and screen reader behavior.
- Disabled or modal semantics.

## Design Notes

- Token usage.
- Layout constraints.
- Motion behavior.

## Test Checklist

- Light and dark mode.
- Mobile width.
- Long English and CJK text.
- TypeScript check.
