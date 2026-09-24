# ng-hub-ui-panels — CSS Variables Reference

Complete reference of the CSS custom properties exposed by `ng-hub-ui-panels`.
Use these variables to customize the visual appearance without editing component source code.

---

## Table of Contents

- [How it Works](#how-it-works)
- [Layout & Content](#layout--content)
- [Tab Headers](#tab-headers)
- [Pills](#pills)
- [Tab Nav (`<hub-tab-nav>`)](#tab-nav-hub-tab-nav)
- [Side Panel (`<hub-side-panel>`)](#side-panel-hub-side-panel)
- [Accordion View](#accordion-view)
- [Card & Content Slots](#card--content-slots)
- [Customization Examples](#customization-examples)
- [Best Practices](#best-practices)

---

## How it Works

Every public token is declared once on `.hub-panels` with a fallback chain:

```text
component token -> sys token -> ref token -> literal fallback
```

The accordion view adds one extra link so existing accordion themes keep working:

```text
--hub-panels-accordion-* -> --hub-accordion-* -> sys/ref -> literal
```

Defaults are declared inside `:where(.hub-panels)` (zero specificity), so any rule
you write — e.g. `hub-panels { --hub-panels-tab-color-active: #198754; }` — wins.

---

## Layout & Content

| Variable | Default |
| --- | --- |
| `--hub-panels-flex-direction` | `row` |
| `--hub-panels-border-width` | `var(--hub-container-border-width, var(--hub-ref-border-width, 1px))` |
| `--hub-panels-border-color` | `var(--hub-container-border-color, var(--hub-sys-border-color-default, #dee2e6))` |
| `--hub-panels-border-radius` | `var(--hub-container-border-radius, var(--hub-ref-radius-md, 0.375rem))` |
| `--hub-panels-content-bg` | `var(--hub-container-bg, var(--hub-sys-surface-page, #fff))` |
| `--hub-panels-header-bg` | `var(--hub-panels-content-bg)` |
| `--hub-panels-content-box-shadow` | `none` |
| `--hub-panels-content-padding-x` | `var(--hub-container-padding-x, var(--hub-ref-space-3, 1rem))` |
| `--hub-panels-content-padding-y` | `var(--hub-container-padding-y, var(--hub-ref-space-3, 1rem))` |
| `--hub-panels-nav-gap` | `0` |
| `--hub-panels-nav-btn-width` | `1.5rem` |
| `--hub-panels-nav-btn-height` | `1.5rem` |

---

## Tab Headers

Used by the `tabs` and `pills` strip headers.

| Variable | Default |
| --- | --- |
| `--hub-panels-tab-font-family` | inherits container font |
| `--hub-panels-tab-font-size` | `var(--hub-container-font-size, var(--hub-ref-font-size-base, 1rem))` |
| `--hub-panels-tab-font-weight` | `var(--hub-ref-font-weight-medium, 500)` |
| `--hub-panels-tab-line-height` | `var(--hub-ref-line-height-base, 1.5)` |
| `--hub-panels-tab-padding-x` | `var(--hub-panels-nav-link-padding-x)` |
| `--hub-panels-tab-padding-y` | `var(--hub-panels-nav-link-padding-y)` |
| `--hub-panels-tab-gap` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-panels-tab-color` | `var(--hub-panels-nav-link-color)` |
| `--hub-panels-tab-bg` | `transparent` |
| `--hub-panels-tab-bg-hover` | `var(--hub-ref-surface-2, #f8f9fa)` |
| `--hub-panels-tab-color-hover` | `var(--hub-panels-nav-link-hover-color)` |
| `--hub-panels-tab-color-active` | `var(--hub-panels-nav-link-active-color)` |
| `--hub-panels-tab-bg-active` | `var(--hub-panels-nav-link-active-bg)` |
| `--hub-panels-tab-border-color-active` | `var(--hub-panels-accent)` |
| `--hub-panels-tab-active-shadow` | `0 -0.25rem 0.5rem rgba(0, 0, 0, 0.06)` |
| `--hub-panels-tab-active-shadow-vertical` | `-0.25rem 0 0.5rem rgba(0, 0, 0, 0.06)` |
| `--hub-panels-tab-color-disabled` | `var(--hub-panels-nav-link-disabled-color)` |
| `--hub-panels-tab-focus-ring-width` | `var(--hub-sys-focus-ring-width, 0.25rem)` |
| `--hub-panels-tab-focus-ring-color` | `var(--hub-sys-focus-ring-color, rgba(13, 110, 253, 0.25))` |
| `--hub-panels-tab-transition` | `var(--hub-sys-transition-base, all 0.2s ease-in-out)` |
| `--hub-panels-remove-btn-opacity` | `1` |
| `--hub-panels-remove-btn-opacity-hover` | `1` |

---

## Pills

| Variable | Default |
| --- | --- |
| `--hub-panels-pill-border-radius` | `var(--hub-ref-radius-pill, 50rem)` |
| `--hub-panels-pill-bg-active` | `var(--hub-panels-accent)` |
| `--hub-panels-pill-color-active` | `var(--hub-panels-accent-on)` |
| `--hub-panels-pill-gap` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-panels-pill-content-border-width` | `0` |
| `--hub-panels-nav-content-gap` | `var(--hub-ref-space-2, 0.5rem)` |

---

## Tab Nav (`<hub-tab-nav>`)

Strip-local tokens for the lightweight `<hub-tab-nav>` primitive. Every other
affordance reuses the `--hub-panels-*` tab tokens above (inherited when the strip
is nested in a themed panels subtree, literal fallbacks otherwise).

| Variable | Default |
| --- | --- |
| `--hub-tabs-indicator-color` | `var(--hub-panels-accent, var(--hub-sys-color-primary, #0d6efd))` |
| `--hub-tabs-gap` | `0` |

---

## Side Panel (`<hub-side-panel>`)

Unlike the `--hub-panels-*` tokens, these are **not declared** on the element: each one is read
where it is used, with its default as the `var()` fallback. A declaration on the panel would beat any
value inherited from above, so reading them this way is what lets you set them on the panel, on the
`<hub-side-panel-container>` or on any ancestor (`.app-shell { --hub-side-panel-width: 28rem; }`).

| Variable | Default |
| --- | --- |
| `--hub-side-panel-width` | `24rem` (capped at the container's inline size) |
| `--hub-side-panel-bg` | `var(--hub-sys-surface-page, #fff)` |
| `--hub-side-panel-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-side-panel-border-width` | `var(--hub-ref-border-width, 1px)` |
| `--hub-side-panel-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-side-panel-border-radius` | `0` (the corners facing the content; the pair against the container edge rounds with `--hub-side-panel-inset`) |
| `--hub-side-panel-inset` | `0` (gap the panel keeps from the container edges, on all four sides) |
| `--hub-side-panel-box-shadow` | `var(--hub-sys-shadow-lg, 0 1rem 3rem rgba(0, 0, 0, 0.175))` (`over` only) |
| `--hub-side-panel-zindex` | `1` (`over` only; local to the container, which isolates its stacking context) |
| `--hub-side-panel-padding-x` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-side-panel-padding-y` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-side-panel-body-padding` | `var(--hub-side-panel-padding-y) var(--hub-side-panel-padding-x)` (`0` for a flush chat) |
| `--hub-side-panel-transition-duration` | `var(--hub-sys-transition-duration-base, 260ms)` |
| `--hub-side-panel-transition-easing` | `var(--hub-sys-transition-timing-function-base, ease)` |

`--hub-side-panel-border-radius` is one token, not four: which corners it lands on follows
`position`, so an `end` panel rounds its inline-start corners and a `start` panel its inline-end
ones. The corners touching the container edge stay square while the panel is flush against it —
rounding them there would only show the container through the gap — and round with the rest as
soon as `--hub-side-panel-inset` moves the panel off the edge:

```css
/* A panel floating free of the edge, rounded on all four corners. */
.app-shell {
	--hub-side-panel-inset: 1rem;
	--hub-side-panel-border-radius: 0.75rem;
	/* The single edge border stops short of the rounded corners and reads as a stray line
	   once the panel touches nothing. A docked panel takes no shadow either
	   (--hub-side-panel-box-shadow is read in `over` mode only), so what separates a
	   floating one is the surface behind it. */
	--hub-side-panel-border-width: 0;
}
```

---

## Multiple Selection

Layout of the block-based multiple view when the `tabs` / `pills` views use `multiple`.

| Variable | Default |
| --- | --- |
| `--hub-panels-pane-min-width` | `16rem` |
| `--hub-panels-pane-min-height` | `8rem` |
| `--hub-panels-pane-gap` | `0` |

---

## Accordion View

Each token falls back to the matching `--hub-accordion-*` variable.

| Variable | Default |
| --- | --- |
| `--hub-panels-accordion-color` | `var(--hub-accordion-color, var(--hub-sys-text-primary, #212529))` |
| `--hub-panels-accordion-bg` | `var(--hub-accordion-bg, var(--hub-sys-surface-page, #fff))` |
| `--hub-panels-accordion-border-width` | `var(--hub-accordion-border-width, var(--hub-ref-border-width, 1px))` |
| `--hub-panels-accordion-border-color` | `var(--hub-accordion-border-color, var(--hub-sys-border-color-default, #dee2e6))` |
| `--hub-panels-accordion-border-radius` | `var(--hub-accordion-border-radius, var(--hub-ref-radius-sm, 0.25rem))` |
| `--hub-panels-accordion-btn-padding-x` | `var(--hub-accordion-btn-padding-x, 1.25rem)` |
| `--hub-panels-accordion-btn-padding-y` | `var(--hub-accordion-btn-padding-y, var(--hub-ref-space-3, 1rem))` |
| `--hub-panels-accordion-btn-color` | `var(--hub-accordion-btn-color, var(--hub-sys-text-primary, #212529))` |
| `--hub-panels-accordion-btn-bg` | `var(--hub-accordion-btn-bg, var(--hub-sys-surface-page, #fff))` |
| `--hub-panels-accordion-active-color` | `var(--hub-accordion-active-color, var(--hub-panels-accent-emphasis))` |
| `--hub-panels-accordion-active-bg` | `var(--hub-accordion-active-bg, var(--hub-panels-accent-subtle))` |
| `--hub-panels-accordion-icon-color` | inherits btn color |
| `--hub-panels-accordion-icon-active-color` | inherits active color |
| `--hub-panels-accordion-btn-icon-width` | `var(--hub-accordion-btn-icon-width, 1.25rem)` |
| `--hub-panels-accordion-btn-icon-transform` | `var(--hub-accordion-btn-icon-transform, rotate(-180deg))` |
| `--hub-panels-accordion-btn-icon-transition` | `var(--hub-accordion-btn-icon-transition, transform 0.2s ease-in-out)` |
| `--hub-panels-accordion-collapse-transition-duration` | `var(--hub-accordion-collapse-transition-duration, 0.25s)` |
| `--hub-panels-accordion-collapse-transition-easing` | `var(--hub-accordion-collapse-transition-easing, cubic-bezier(0.4, 0, 0.2, 1))` |
| `--hub-panels-accordion-body-padding-x` | `var(--hub-accordion-body-padding-x, 1.25rem)` |
| `--hub-panels-accordion-body-padding-y` | `var(--hub-accordion-body-padding-y, var(--hub-ref-space-3, 1rem))` |

---

## Card & Content Slots

Used by the `card` view (`type="card"`) and by the `hubPanelHeader` /
`hubPanelFooter` content bands (which render in every view). The card tokens are
declared on `:where(.hub-panels__panel--card)` so a **standalone** `<hub-panel>`
is themable too — target `hub-panel { … }` when there is no `.hub-panels` ancestor.

| Variable | Default |
| --- | --- |
| `--hub-panels-card-bg` | `var(--hub-sys-surface-page, #fff)` |
| `--hub-panels-card-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-panels-card-border-width` | `var(--hub-ref-border-width, 1px)` |
| `--hub-panels-card-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-panels-card-border-radius` | `var(--hub-ref-radius-md, 0.375rem)` |
| `--hub-panels-card-border-style` | `solid` (e.g. `dashed` for an empty-state card) |
| `--hub-panels-card-box-shadow` | `var(--hub-sys-shadow-sm, 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075))` |
| `--hub-panels-card-accent` | `var(--hub-sys-border-color-default, #dee2e6)` (semantic tint slot for `[variant]`) |
| `--hub-panels-card-padding-x` | `var(--hub-ref-space-4, 1.5rem)` |
| `--hub-panels-card-padding-y` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-panels-body-gap` | `0` (gap between stacked body children in `fill` mode) |
| `--hub-panels-card-gap` | `1rem` (between cards in the container) |
| `--hub-panels-panel-header-bg` | `var(--hub-sys-surface-elevated, #f8f9fa)` |
| `--hub-panels-panel-header-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-panels-panel-header-padding-x` | `var(--hub-ref-space-4, 1.5rem)` |
| `--hub-panels-panel-header-padding-y` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-panels-panel-header-font-weight` | `var(--hub-ref-font-weight-semibold, 600)` |
| `--hub-panels-panel-header-border-width` | `var(--hub-ref-border-width, 1px)` |
| `--hub-panels-panel-header-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |

---

## Customization Examples

Brand-coloured pills:

```css
hub-panels {
	--hub-panels-pill-bg-active: #198754;
	--hub-panels-pill-color-active: #fff;
}
```

Compact, square tabs:

```css
hub-panels {
	--hub-panels-tab-padding-x: 0.75rem;
	--hub-panels-tab-padding-y: 0.375rem;
	--hub-panels-border-radius: 0;
}
```

Re-theme the accordion view through the shared accordion tokens (also applies to
the deprecated `ng-hub-ui-accordion`):

```css
hub-panels {
	--hub-accordion-active-bg: #fff3cd;
	--hub-accordion-active-color: #664d03;
}
```

---

## Best Practices

- Scope overrides to a wrapper (`.my-panels { … }`) rather than the global `:root`
  when you need different themes on the same page.
- Prefer the `--hub-sys-*` / `--hub-ref-*` design tokens when integrating with the
  wider Hub UI token system — the component tokens already consume them.
- Reuse `--hub-accordion-*` variables to keep a single source of truth while you
  migrate from `ng-hub-ui-accordion` to `ng-hub-ui-panels`.
