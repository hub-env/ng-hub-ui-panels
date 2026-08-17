# Changelog

All notable changes to the ng-hub-ui-panels library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.10.2] - 2026-08-17

### Fixed

- **The published package declared no licence.** An absent `license` field is not neutral — a registry reports it as unlicensed, which legally reads as all rights reserved, the most restrictive state possible rather than the most open. The intent was always MIT; it is now stated in `package.json` and carried in a `LICENSE` file that ships with the package.

## [22.10.1] - 2026-08-08

### Fixed

- Documentation links now point at the canonical localized URLs. The README linked to `https://hubui.dev/<path>` with no locale prefix and no trailing slash, and both forms are 301-redirected, so every reader arriving from npm or GitHub landed on a redirect instead of the canonical page.

## [22.10.0] - 2026-07-28

### Changed

- **Accent resolution now imports the canonical `resolveHubAccent` from `ng-hub-ui-utils`.** The private copy under `src/lib/utils/resolve-hub-accent.ts` (used by `<hub-panels>` and `<hub-panel>`) has been deleted in favour of the single, tested implementation shared family-wide. Behaviour is identical (the copy had not diverged): a bareword resolves to `var(--hub-sys-color-<name>, <name>)`, a literal colour passes through unchanged, an empty value yields `null`.

### Added

- **NEW peer dependency: `ng-hub-ui-utils` `>=22.7.0`.** Consumers must have `ng-hub-ui-utils` installed alongside this library (it is where `resolveHubAccent` lives) — unlike the optional `ng-hub-ui-ds` peer, this one is required. Users installing via `ng add ng-hub-ui-installer` get it automatically; manual installs need `npm i ng-hub-ui-utils`.

## [22.9.0] - 2026-07-28

### Added

- **`removeLabel` input on `<hub-panel>`** (default `'Remove panel'`) — the accessible name announced for the ✕ remove button, overridable per panel so consumers can localize it. The glyph itself stays decorative.

### Fixed

- **The ✕ remove control was invisible to assistive technologies and unreachable by keyboard.** It rendered as an `aria-hidden` `<span>` with a click handler, nested *inside* the tab / disclosure `<button>` — unfocusable, unannounced and inoperable without a mouse (only the undiscoverable Delete key removed a panel). It is now a real `<button type="button">` with an `aria-label`, rendered as a **sibling** of the header control through the same slot pattern `hubPanelHeadingActions` introduced: in the strip views it follows the tab button inside `.hub-panels__nav-item` and overlays the tab's reserved end padding, so it keeps its visual spot inside the tab chrome (the tab reserves `1em` + `--hub-panels-tab-gap` instead of the glyph's intrinsic width — removable tabs may measure a few pixels wider, and in `justified` / stretched-`vertical` strips the ✕ now pins to the tab's end edge rather than trailing the label); in the accordion view it renders inside `.hub-panels__accordion-actions` at the row's end, before the chevron gutter (it sat beside the heading text before — unavoidable, a sibling control cannot occupy the middle of the disclosure button). Clicking it still removes without toggling or selecting; it is disabled together with its panel. The `.hub-panels__remove-btn` class is unchanged, so the `--hub-panels-remove-btn-opacity(-hover)` overrides keep working, and the button now shows the shared focus ring (`--hub-panels-tab-focus-ring-width/-color`). Because the ✕ no longer sits inside the header control it stopped inheriting its text colour, so it now mirrors those states explicitly — tab base / hover / active (`--hub-panels-tab-color(-hover/-active)`), active pill (`--hub-panels-pill-color-active`), accordion collapsed / expanded (`--hub-panels-accordion-btn-color` / `--hub-panels-accordion-active-color`) and disabled (`--hub-panels-tab-color-disabled`). The tablist roving `tabindex` is untouched — the ✕ is a plain tab stop after its tab, never a `role="tab"`.
- **Removing a panel through the ✕ strands keyboard focus no more.** Removal through the button (all views) now returns focus to the closest remaining header, exactly like the Delete key always did, instead of letting it fall back to `<body>`. Exposed as the public `removePanelAndRefocus(panel)` method on `PanelsComponent`, which the Delete-key handlers now share.

## [22.8.3] - 2026-07-26

### Fixed

- Declared the real `ng-hub-ui-ds` peer range: `>=22.0.0`. The previous `>=1.0.0` floor allowed resolving a token package from before the `--hub-ref-*` / `--hub-sys-*` architecture this library themes against.

## [22.8.2] - 2026-07-09

### Fixed

- **The hairline closing an expanded row stopped short of the row's end.** It was an inset `box-shadow` on the disclosure button, which spanned the whole header until 22.8.0 made it `flex: 1 1 auto` to free space for `hubPanelHeadingActions`. With actions present the line ended where they began. It is now drawn on `.hub-panels__accordion-header--expanded`, which always spans the full row, with or without actions.
- **`togglePosition="end"` put the chevron at the end of the BUTTON, not of the row.** With `hubPanelHeadingActions` the chevron therefore landed *between* the heading and the affordances. The trailing chevron is now anchored to the header's inline end (`position: absolute; inset-inline-end`), so `'end'` means the end of the row, as documented. It remains a child of the disclosure button — clicking it still toggles, and no control is nested inside another. Whatever sits last in the row (the heading, or the actions when present) reserves the glyph's gutter through the new `--hub-panels-accordion-toggle-gutter` custom property. `togglePosition="start"` is unaffected: the chevron stays in flow, leading the heading. Centring uses `inset-block` + `margin-block` rather than `transform`, which is reserved for the open/closed rotation. Logical properties throughout, so both variants mirror under `dir="rtl"`.

### Changed

- **`.hub-panels__accordion-btn` no longer paints the row surface.** 22.8.0 moved it to `.hub-panels__accordion-header` but left the button's own `background-color` in place, calling it harmless. It was not: the button stretches to the header's full height, so its opaque fill covered the parent's inset bottom hairline across the button's width — the line survived only under the actions slot. The button is now `transparent` and the header's surface shows through. `--hub-panels-accordion-btn-bg` and `--hub-panels-accordion-active-bg` still drive the row's colour, read by the header; a consumer who set `background` directly on `.hub-panels__accordion-btn` must move it to the header.
- **`.hub-panels__accordion-btn` is no longer `position: relative`.** It never established a containing block for anything, and the `z-index` it raises on hover and focus applies to it as a flex item regardless. Dropping it lets the header be the chevron's containing block. A consumer who relied on the button positioning absolutely-positioned heading content must now position that content itself.

## [22.8.1] - 2026-07-09

### Fixed

- **`togglePosition` leaked into a nested accordion.** The chevron placement was a class on the `<hub-panels>` container and a **descendant** selector, so an accordion nested inside a panel body — a DOM descendant of the outer container — inherited the outer chevron side and could not choose its own. The flag now rides each `<hub-panel>` (`.hub-panels__panel--toggle-start`, resolved from its own container through the `host: true` injection) and the rule is scoped to that panel's own header, so a nested accordion keeps its own `togglePosition`.

## [22.8.0] - 2026-07-09

### Added

- **`hubPanelHeadingActions` directive** — a header-row slot for accordion affordances that must stay usable while the row is collapsed (edit, delete, a menu). Until now there was nowhere to put them: `hubPanelHeading` projects **inside** the disclosure `<button>`, so a nested `<button>` there is invalid HTML and unreachable by keyboard, and `hubPanelHeader` projects inside the collapse region, so it vanishes when the row closes. Consumers were pushed into `<span role="button" tabindex="0">` look-alikes. The new `<ng-template hubPanelHeadingActions>` renders as a **sibling of the disclosure button**, inside `.hub-panels__accordion-header`: its controls are real controls, a click never toggles the panel (no `stopPropagation` needed), and tab order follows the DOM. Renders nothing in the `tabs` / `pills` / `card` views. Exported as `PanelHeadingActionsDirective`.
- **`togglePosition` input on `<hub-panels>`** (`'start' | 'end'`, default `'end'`; also settable app-wide through `PanelsConfig.togglePosition`) — which side of the accordion header row the disclosure chevron sits on. Only the visual order changes: the DOM is untouched, and the placement is expressed with logical properties, so `'start'` is the left edge in LTR and the right edge in RTL. Replaces the `::ng-deep .hub-panels__accordion-btn::after { order: -1; margin-left: 0 }` override consumers had to write by hand. The `HubPanelsTogglePosition` type is exported.

### Changed

- **`.hub-panels__accordion-header` is now a flex row** that carries the row surface (`--hub-panels-accordion-btn-bg`, and `--hub-panels-accordion-active-bg` through the new `.hub-panels__accordion-header--expanded` modifier), with the disclosure button as its `flex: 1 1 auto` child. That is what lets the actions slot sit beside the button and share its background in both states. The button's own background rules are unchanged, so existing themes render identically.

### Fixed

- **RTL in the accordion header.** The disclosure button used the physical `text-align: left`, and its chevron `margin-left: auto`, so under `dir="rtl"` the label stayed left-aligned and the chevron pinned to the wrong edge. Both are logical now (`text-align: start`, `margin-inline-start: auto`).

## [22.7.0] - 2026-07-08

### Added

- **`--hub-panels-tab-border-end-radius` token** — controls the radius of a vertical tab's corners on the edge that meets the panel body (the inline-end corners). Previously those corners were hardcoded to `0`, so the active tab always "docked" flush into the panel and a consumer could not round them. The token **defaults to `0`** (fully backward-compatible — the docking look is unchanged for every existing consumer); raise it (e.g. to `--hub-panels-tab-border-radius`) to render fully-rounded, standalone rail items such as a routed settings/profile subnav. Only `border-start-end-radius` / `border-end-end-radius` on `.hub-panels__nav--vertical .hub-panels__nav-link` changed — from literal `0` to `var(--hub-panels-tab-border-end-radius, 0)`.

## [22.6.0] - 2026-07-07

### Added

- **`hub-panels-theme(...)` SCSS mixin** — one-call token theming for `<hub-panels>`. `$accent` feeds the single `--hub-panels-accent` slot (the component derives the `-emphasis` / `-subtle` / `-on` family from it), alongside the panel surface (`$border-color`, `$border-radius`, `$border-width`, `$content-bg`, `$content-padding-x/y`) and the tab appearance (`$tab-bg-active`, `$tab-color-active`, `$tab-font-size`, `$tab-padding-x/y`, `$nav-gap`). Every parameter is null-defaulted and additive; for any token not exposed, set the `--hub-panels-*` custom property directly.

### Changed

- **Packaging — the library now ships its SCSS at `/styles`.** `src/lib/styles` is emitted to `dist/panels/styles`, exposing `hub-panels-theme` as a first-class package entry: `@use 'ng-hub-ui-panels/styles' as *;`.

## [22.5.0] - 2026-07-07

### Changed

- **`<hub-panel>` / `<hub-panels>` `variant` accepts ANY colour.** On top of the built-in semantic accents, the input now also accepts a **registered custom accent** and a **literal colour** (`#ff0000`, `rgb(...)`, `oklch(...)`, a CSS named colour), resolved through the shared `resolveHubAccent` resolver (a local copy of the canonical `ng-hub-ui-utils` helper): a bareword becomes `var(--hub-sys-color-<name>, <name>)`; a literal is used as-is. The single `--hub-<comp>-accent` slot derives the rest of the family, so built-in colours are unchanged.
- **Internal — host bindings moved to the `host` metadata object.** `@HostBinding` / `@HostListener` decorators were replaced by the `host` object in the component/directive metadata (Angular style guide). No public API or behaviour change.

## [22.4.0] - 2026-07-05

### Added

- **`<hub-tab-nav>` — lightweight, value-bound tab strip.** New standalone `HubTabNavComponent` (selector `hub-tab-nav`, `exportAs="hubTabNav"`): a content-less, controlled tab strip that renders an accessible `role="tablist"` of `role="tab"` buttons from a plain `items` array (`HubTabNavItem[]`) and emits the selected value through the two-way `active` model (`activeChange` output). Unlike `<hub-panels type="tabs">` it owns no panes — the consumer renders the active view itself from `active()` / `(activeChange)` — so it fits segmented controls, filter switches and manual tabs-with-external-content. Inputs: `appearance` (`'tabs' | 'pills'`, default `'tabs'`), `justified`, `vertical`. Roving-`tabindex` keyboard navigation (arrows activate + move focus, `Home` / `End`, disabled tabs skipped) and `aria-selected` on the active tab. Reuses the `<hub-panels>` strip look through the shared `--hub-panels-*` tokens and adds two strip-local tokens, `--hub-tabs-indicator-color` (active underline / pill fill) and `--hub-tabs-gap` (inter-tab gap).
- **`<hub-panel>` — semantic card variant tint.** A plain (non-alert) card now honours `[variant]`: it reflects `data-variant` and derives its background / text / border — **and its `hubPanelHeader` / `hubPanelFooter` bands** (a slightly stronger tint of the same accent so they still read as bands) — from a single inline accent with the same open `color-mix` + built-in-ds-tint model the alert already uses (no colour values added). New `--hub-panels-card-accent` slot; new `--hub-panels-card-border-style` exposes the frame border style (e.g. `dashed` for an empty-state card).
- **`<hub-panel flush>` — zero body padding.** New `flush` input removes the card body padding (`--hub-panels-card-padding-x/-y` → 0) so a card can host a table / list / media block edge-to-edge, replacing per-site inline overrides. (Distinct from the existing `<hub-panels flush>` container input, which flattens the accordion frame.)
- **`<hub-panel fill>` — fill-height card with a scrolling body.** New `fill` input makes the host, both content wrappers and the body a flex column (`flex: 1; min-height: 0`); the body scrolls, so an inner `flex: 1` region (e.g. a tab strip + scroll pane) is finally bounded. New `--hub-panels-body-gap` spaces stacked body children. The two body wrappers now carry stable classes (`.hub-panels__panel-collapse`, `.hub-panels__panel-region`).
- **`<hub-panel standalone>` — explicit DI opt-out.** A static `standalone` attribute makes a loose `<hub-panel>` render as a plain card even when placed **directly** inside a tabs / pills / accordion `<hub-panels>` in the same template (the case `host: true` alone cannot cover) — it skips registration so it never becomes a hidden `role="tabpanel"`.

### Changed

- **`--hub-panels-card-box-shadow` and `--hub-panels-panel-header-bg` are now inheritable.** Their defaults moved from a declaration on the consuming element to the usage-site `var()` fallback, so an ancestor (a page shell) can set either token and have it inherit through to the card frame / header band. Identical default → no visual change.

## [22.3.0] - 2026-07-02

### Fixed

- **A standalone `<hub-panel>` nested (transitively) inside a tab pane no longer registers as a hidden tab of the outer `<hub-panels>`.** The panel discovered its group by injecting `PanelsComponent`, and Angular's hierarchical DI walks the whole ancestor injector tree — so a content-card `<hub-panel>` inside a component projected into a tab pane resolved the OUTER group, registered as one of its tabs and rendered as an inactive (invisible) `role="tabpanel"`. The injection is now bounded with `host: true`: a panel binds only to a group declared in the same template (its direct container) and renders as a standalone card/alert otherwise. Direct children — including panels under `@if` / `@for` blocks of the same template — keep registering exactly as before, and the consumer-side `providers: [{ provide: PanelsComponent, useValue: null }]` workaround is no longer needed. Behaviour note: a wrapper component whose own template renders the `<hub-panel>` no longer attaches it to a group outside that template — project the content into the group's pane instead.

### Changed

- **Canonical accent-slot derivation for the group accent.** The `<hub-panels>` role family is now derived LOCALLY from the single `--hub-panels-accent` slot with the canonical design-system formulas — `--hub-panels-accent-emphasis: color-mix(in oklch, accent 80%, --hub-sys-color-ink)`, `--hub-panels-accent-subtle: color-mix(in oklch, accent 12%, --hub-sys-surface-page)` and the `oklch(from …)` lightness flip for `--hub-panels-accent-on` — instead of pointing at the pre-computed `--hub-sys-color-primary-*` tints. The built-in `variant`s now re-base ONLY the accent slot (`--hub-panels-accent: var(--hub-sys-color-<variant>)`), never the derived roles, so **custom accents now re-derive the full role family at runtime** (e.g. `--hub-panels-accent: gold` recolours emphasis/subtle/on in one hook). Visual output with the predefined variants is equivalent — the canonical formulas produce the same tints the ds families ship. The now-redundant open-set `[data-variant]` re-derivation rule was removed (the base derivations already recompute on the same element).
- The alert open-set default (`appearance="alert"` with a custom variant) now uses the same canonical tints: background `12%` over `--hub-sys-surface-page` (was `14%`) and text `80%` over `--hub-sys-color-ink` (was `72%` over `--hub-sys-text-primary`), so a custom alert variant renders exactly like a built-in with the same accent. Built-in alert variants keep the exact ds tints — unchanged.
- Docs: `docs/css-variables-reference.md` default values resynchronized with the actual code declarations (now guarded by the repo-level `tokens-parity` check F).

## [22.2.0] - 2026-06-26

### Added

- **Open-set accent variants.** Both `<hub-panels variant="…">` (navigation strip) and `<hub-panel appearance="alert" variant="…">` now ship the full open accent set as built-ins — `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `neutral`, `light`, `dark` (previously only the first five chromatic ones picked up exact tints). Any other variant keeps working at runtime with no recompile: define a single `--hub-sys-color-<name>` and `variant="<name>"` derives its roles from the open-set `[data-variant]` default.
- New derived role `--hub-panels-accent-on` — the contrast colour for text sitting on the accent (a grayscale flip driven by the accent's lightness). The active pill text (`--hub-panels-pill-color-active`) now resolves through it instead of a hardcoded white, so a light custom accent stays legible.
- **Alert content flex tokens.** The `appearance="alert"` body is now a flex container whose layout is tokenised: `--hub-panels-alert-content-direction` (default `row`), `--hub-panels-alert-content-align` (default `flex-start` — top), `--hub-panels-alert-content-justify` (default `flex-start`) and `--hub-panels-alert-content-gap` (default `var(--hub-sys-gap-2)`). Override any to re-flow the alert content (e.g. icon + message) without touching the component.

### Changed

- The alert variant tints are now generated through a `hub-panels-alert-variant($variant)` Sass mixin (instead of an inline `@each` body), so adding or auditing a variant is a single `@include` with no duplicated colour values.

- All `<hub-panels>` and alert accent derivations (`-emphasis`, `-subtle`, and the alert bg/color/border) now interpolate in the **OKLCH** colour space (`color-mix(in oklch, …)`) instead of sRGB, for perceptually even tints across every accent. No token API change; tints shift very slightly.

## [22.1.1] - 2026-06-25

### Fixed

- Design-token consistency pass: aligned inline fallback defaults with the canonical `ng-hub-ui-ds` values and routed hardcoded literals (z-index, font-weight, line-height, radii and theme-aware colours) through their `--hub-sys-*` / `--hub-ref-*` tokens, so they follow the active theme. No visual change when the ds tokens are loaded.

## [22.1.0] - 2026-06-22

### Added

- New `variant` input on `<hub-panels>` selecting the **semantic accent of the navigation strip**: `<hub-panels variant="success">` recolours the active/hover tab, the active pill and the active accordion header. The built-in variants (`primary` / `success` / `danger` / `warning` / `info`) render with the exact design-system tints; **any other string is also accepted** — the strip reads `--hub-sys-color-<variant>` from the host application and derives the hover/active roles with `color-mix`, so a custom accent palette interconnects with no changes to the library. Defaults to `primary` when omitted. Mirrors the open-set accent system already used by `<hub-panel appearance="alert">`.
- New tokens for the group accent: `--hub-panels-accent`, `--hub-panels-accent-emphasis`, `--hub-panels-accent-subtle`. The strip's active/hover affordances (`--hub-panels-nav-link-active-color`, `--hub-panels-nav-link-hover-color`, `--hub-panels-tab-border-color-active`, `--hub-panels-pill-bg-active`, `--hub-panels-accordion-active-color`, `--hub-panels-accordion-active-bg`) now resolve through this single accent instead of being hard-wired to `--hub-sys-color-primary*`. No visual change with the default `primary` accent.

### Changed

- The outer container chrome now inherits from the `--hub-container-*` base layer (re-base hook): `--hub-panels-content-bg`, `--hub-panels-border-color`, `--hub-panels-border-width`, `--hub-panels-border-radius` and `--hub-panels-content-padding-x/y` default through `var(--hub-container-*, <previous default>)`. Overriding a container token on a subtree now re-bases the panels chrome. No visual change with default tokens.

## [22.0.0] - 2026-06-17

### Changed

- Aligned with Angular 22.
- README documentation standardized.


## [21.3.0] - 2026-06-16

### Added
- New `alert` appearance for a standalone `<hub-panel>`: `<hub-panel appearance="alert" [variant]="…">` renders the panel as a semantic callout (subtle background, subtle border, an accent stripe and emphasis text) with `role="alert"`. Works standalone or inside a `type="card"` container; ignored in the `tabs` / `pills` / `accordion` strip views.
- New `variant` input on `<hub-panel>` selecting the alert's semantic colour; omit it for a neutral alert. Exported types `HubPanelAppearance` and `HubPanelVariant`. The built-in variants (`primary` / `success` / `danger` / `warning` / `info`) render with the exact design-system tints; **any other string is also accepted** — the alert reads `--hub-sys-color-<variant>` from the host application and derives its look with `color-mix`, so a custom accent palette interconnects with no changes to the library.
- New tokens for the alert: `--hub-panels-alert-bg`, `--hub-panels-alert-color`, `--hub-panels-alert-border-color`, `--hub-panels-alert-accent`, `--hub-panels-alert-padding-x`, `--hub-panels-alert-padding-y`, `--hub-panels-alert-border-radius`, `--hub-panels-alert-accent-width`. The per-variant colours are not new token sets — each variant re-points the generic alert tokens at the design-system `--hub-sys-color-<variant>-{subtle,border-subtle,emphasis}` family, so the alert inherits every theme and dark mode automatically.
- `ng-hub-ui-ds` added as an **optional** peer dependency: install it once to give panels (and the rest of the family) the shared `--hub-*` token palette and dark mode. Panels keeps working without it via built-in fallbacks.

## [21.2.0] - 2026-06-14

### Added
- New `card` visualization (`type="card"`): a chromeless format with no navigation strip where every `<hub-panel>` is always visible and rendered as a card. Ideal for a single standalone panel or a stack of cards.
- A `<hub-panel>` can now be used **standalone**, outside any `<hub-panels>` container, in which case it renders as a card on its own (the container injection is optional and the card styles ship with the panel component).
- New content-slot directives `hubPanelHeader` and `hubPanelFooter`: mark an element inside a `<hub-panel>` as the panel's header/footer band. They render in **every** view (`tabs`, `pills`, `accordion`, `card`), distinct from `hubPanelHeading` (the navigational tab/accordion label).
- New tokens: `--hub-panels-card-bg`, `--hub-panels-card-color`, `--hub-panels-card-border-width`, `--hub-panels-card-border-color`, `--hub-panels-card-border-radius`, `--hub-panels-card-box-shadow`, `--hub-panels-card-padding-x`, `--hub-panels-card-padding-y`, `--hub-panels-card-gap`, and the `--hub-panels-panel-header-*` family for the header/footer bands.

## [21.1.1] - 2026-06-12

### Added
- New token: `--hub-panels-header-bg`, used by the tabs/pills strip background. It defaults to `--hub-panels-content-bg`, so the default theme remains unchanged while custom themes can give the header strip its own surface colour.
- New token: `--hub-panels-pill-content-border-width`, which controls the bordered card chrome in the `pills` content area.

### Changed
- The active header background now defaults to `--hub-panels-content-bg`, keeping the active tab/panel fusion aligned automatically when the content surface is rethemed.
- The `pills` content area is borderless by default (`--hub-panels-pill-content-border-width: 0`); themes can opt back into a bordered card by overriding that token.
- In `multiple` tabs/pills, every active header now starts its own visible block, each block keeps the same tabs/pills chrome as a regular panel set, and the layout scrolls horizontally when the blocks exceed the available width.
- In `multiple` tabs/pills, every visible block now stretches its content area to the full available height, matching the single-panel layouts.
- In `multiple` vertical tabs/pills, each visible block now uses the same side-by-side header/content orientation as the regular vertical layouts.
- In `multiple` vertical tabs/pills, the grouped blocks now stack top-to-bottom, and each panel area keeps at least the larger of its content-driven width and its associated header-stack height.
- In `multiple` vertical tabs/pills, each stacked row now stretches across the full available width again; the content-driven/header-driven minimum width applies only to the panel area.
- In regrouped `multiple` vertical tabs/pills, active panes are now re-placed in a second post-render pass so late-rendered blocks no longer end up with empty content areas.
- In `pills` + `multiple` + `vertical`, stacked blocks now draw a divider line between rows so panel boundaries remain visible even with borderless content areas.
- `--hub-panels-pane-gap` now defaults to `0`.

## [21.1.0] - 2026-06-11

### Added
- Multiple selection in the `tabs` / `pills` views: with `multiple`, several panels can be open at once. Each open pane becomes its own bordered box placed next to the others — side by side when the strip is horizontal, stacked when it is `vertical` — sharing the space with a per-pane minimum and scrolling on overflow. The form value is an array.
- New tokens: `--hub-panels-pane-min-width`, `--hub-panels-pane-min-height`, `--hub-panels-pane-gap`, `--hub-panels-nav-content-gap`, `--hub-panels-pill-gap`.

### Fixed
- **Accordion content was not rendered.** The panel template used two unselected `<ng-content>` slots (one per `@if`/`@else` branch); Angular bound projection to the strip-view slot, so the accordion body was always empty. Replaced with a single projection slot, fixing the missing accordion content.
- `tabs` and vertical `tabs` now render as a **single bordered box** around the strip and the content together (one outer border plus an internal divider), instead of two separate boxes. The active tab merges into the content across the divider.
- `pills` view gains spacing between the strip and a bordered content card (`--hub-panels-nav-content-gap`).

### Changed
- The header strip now scrolls smoothly (`scroll-behavior: smooth`).
- Disabled headers show the `not-allowed` cursor.
- `<hub-panels>` now always spans 100% of its parent's width and applies `box-sizing: border-box`.

## [21.0.0] - 2026-06-11

### Added
- Initial release of `ng-hub-ui-panels`.
- `<hub-panels>` container with three visualizations selected by the `type` input: `tabs` (default), `pills` and `accordion`.
- `<hub-panel>` content panes with `heading`, `value`, `active` (two-way), `disabled`, `removable`, `customClass`, `routerLink`, `queryParams` and `pathMatch` inputs.
- `ControlValueAccessor` integration for single and multiple selection, with `bindValue` (dot-notation value mapping) and `compareWith`.
- Routed panels: a panel with a `routerLink` switches the content area to a `<router-outlet>` and the active panel follows the URL.
- Keyboard navigation (Arrow keys, Home, End, Delete) with a roving tabindex for both the tablist and accordion patterns.
- Scrollable header strip (`scrollable`), vertical strip (`vertical`) and equal-width headers (`justified`).
- Accordion view with multiple simultaneous expansion (`multiple`), edge-to-edge layout (`flush`) and an animated grid-based collapse.
- Custom header templates through the `hubPanelHeading` directive.
- `PanelsConfig` injectable for application-wide defaults (default `type`, keyboard toggle, ARIA labels).
- Full `--hub-panels-*` CSS custom-property theming, with the accordion view falling back to the `--hub-accordion-*` token contract for compatibility.

### Notes
- `ng-hub-ui-panels` supersedes `ng-hub-ui-accordion`. The accordion view is a drop-in, more capable replacement for `<hub-accordion>`.
