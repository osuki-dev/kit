# @osuki-dev/ui 2.0.0 Architecture & Implementation Plan

The comprehensive architecture specification and execution plan is documented in:
[v2-composition-theming-architecture.md](../../docs/specs/v2-composition-theming-architecture.md)

### Key Summary

- **Version**: 2.0.0 (Full Rearchitecture)
- **Branch**: `feat/composition-theming-icons` in `/home/ryu/Work/kit`
- **Core Pillars**:
  1. Vercel Composition Patterns (`.Root`, `.Background`, `.Content`)
  2. `SurfaceDecoratorContext` dependency injection for theme artworks & opacity
  3. `react-native-nano-icons` font-based layered glyph engine + pluggable custom icon resolvers
  4. Missing UI primitives: `Slider`, `StatusDot`, `TwoStepAction`, `EdgeFade`, `GlassSurface`, `MarqueeText`, `TransientPill`
  5. shadcn 2026-10 AI Elements: `Trace`, `CodeBlock`, `Reasoning`, `ToolCall`, `PromptInput`
  6. Zero-runtime Native Styles (`StyleSheet` + Yoga `collapsable={true}`) & Dependency Pruning
