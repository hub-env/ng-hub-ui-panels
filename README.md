# ng-hub-ui-panels

[Español](./README.es.md) | **English**

A versatile, accessible **content-panels** container for Angular that renders as
**tabs**, **pills**, an **accordion** or plain **cards** from a single API — with
routing, reactive forms, keyboard navigation and CSS-variable theming. Built as
standalone Angular components on top of Signals.

> `ng-hub-ui-panels` supersedes [`ng-hub-ui-accordion`](https://www.npmjs.com/package/ng-hub-ui-accordion). Its accordion view is a drop-in, more capable replacement.

## Documentation and Live Examples

This package is part of [Hub UI](https://hubui.dev/en/), a collection of Angular component libraries for standalone apps.

- Docs: https://hubui.dev/en/panels/overview/
- Live examples: https://hubui.dev/en/panels/examples/
- Hub UI: https://hubui.dev/en/

## 🧩 Library Family `ng-hub-ui`

This library is part of the **ng-hub-ui** ecosystem:

- [**ng-hub-ui-accordion**](https://www.npmjs.com/package/ng-hub-ui-accordion) _(deprecated → use panels)_
- [**ng-hub-ui-action-sheet**](https://www.npmjs.com/package/ng-hub-ui-action-sheet)
- [**ng-hub-ui-avatar**](https://www.npmjs.com/package/ng-hub-ui-avatar)
- [**ng-hub-ui-board**](https://www.npmjs.com/package/ng-hub-ui-board)
- [**ng-hub-ui-breadcrumbs**](https://www.npmjs.com/package/ng-hub-ui-breadcrumbs)
- [**ng-hub-ui-calendar**](https://www.npmjs.com/package/ng-hub-ui-calendar)
- [**ng-hub-ui-dropdown**](https://www.npmjs.com/package/ng-hub-ui-dropdown)
- [**ng-hub-ui-ds**](https://www.npmjs.com/package/ng-hub-ui-ds)
- [**ng-hub-ui-forms**](https://www.npmjs.com/package/ng-hub-ui-forms)
- [**ng-hub-ui-history**](https://www.npmjs.com/package/ng-hub-ui-history)
- [**ng-hub-ui-milestones**](https://www.npmjs.com/package/ng-hub-ui-milestones)
- [**ng-hub-ui-modal**](https://www.npmjs.com/package/ng-hub-ui-modal)
- [**ng-hub-ui-nav**](https://www.npmjs.com/package/ng-hub-ui-nav)
- [**ng-hub-ui-paginable**](https://www.npmjs.com/package/ng-hub-ui-paginable)
- [**ng-hub-ui-panels**](https://www.npmjs.com/package/ng-hub-ui-panels) ← You are here
- [**ng-hub-ui-portal**](https://www.npmjs.com/package/ng-hub-ui-portal)
- [**ng-hub-ui-skeleton**](https://www.npmjs.com/package/ng-hub-ui-skeleton)
- [**ng-hub-ui-sortable**](https://www.npmjs.com/package/ng-hub-ui-sortable)
- [**ng-hub-ui-stepper**](https://www.npmjs.com/package/ng-hub-ui-stepper)
- [**ng-hub-ui-utils**](https://www.npmjs.com/package/ng-hub-ui-utils)

---

## 🚀 Quick Start

### 1. Install

```bash
npm install ng-hub-ui-panels
```

> **Theming (recommended):** install the shared design tokens once so panels —
> and every other ng-hub-ui library — reads the same palette and dark mode:
>
> ```bash
> npm install ng-hub-ui-ds
> ```
> ```css
> @import 'ng-hub-ui-ds/styles/tokens/hub-tokens.css';
> ```
>
> It is an **optional** peer dependency: panels ships sensible fallbacks and
> works without it, but the tokens give consistent, themeable colours across the
> whole family (and power the alert variants).

### 2. Import

The components are standalone — import them directly where you use them:

```ts
import {
	HubPanelsComponent,
	HubPanelComponent,
	HubTabNavComponent,
	HubPanelHeadingDirective,
	HubPanelHeadingActionsDirective,
	HubPanelHeaderDirective,
	HubPanelFooterDirective
} from 'ng-hub-ui-panels';
```

### 3. Use

```html
<hub-panels>
	<hub-panel heading="Overview">First panel content</hub-panel>
	<hub-panel heading="Details">Second panel content</hub-panel>
	<hub-panel heading="Settings">Third panel content</hub-panel>
</hub-panels>
```

---

## 📦 Description

`ng-hub-ui-panels` unifies the most common content-switching patterns — **tabs**,
**pills** and **accordion** — plus a chromeless **card** layout, behind one
declarative component. Drop `<hub-panel>` panes inside `<hub-panels>` and pick a
`type`; everything else (keyboard navigation, ARIA wiring, animated collapse,
routed panels and form binding) works the same across views. A `<hub-panel>` can
also be used **standalone**, outside any container, where it renders as a card on
its own.

## 🎯 Features

- **Four visualizations** — `tabs`, `pills`, `accordion` and `card`, switched with a single `type` input.
- **Lightweight value-bound strip** — `<hub-tab-nav>` is a content-less, controlled tab strip: it emits the selected `value` from a plain `items` array and lets you render the view yourself (segmented controls, filter switches, tabs with external content).
- **Card layout & standalone** — `type="card"` renders every panel as an always-visible card; a single `<hub-panel>` also works on its own, outside any container.
- **Content header/footer slots** — `hubPanelHeader` and `hubPanelFooter` mark header/footer bands that render in every view (distinct from the `hubPanelHeading` nav label).
- **Semantic alerts** — `appearance="alert"` with a `variant` turns a panel into a themed callout (`role="alert"`) driven by the design-system semantic tokens, no per-colour CSS.
- **Strip accent** — `<hub-panels variant>` recolours the navigation strip (active/hover tab, active pill, active accordion header) from a single semantic accent; built-in variants use the exact design-system tints and any custom accent is picked up automatically.
- **Forms** — implements `ControlValueAccessor`; bind the active panel(s) to a `FormControl` or `ngModel` (single or `multiple`), with `bindValue` and `compareWith`.
- **Routing** — a panel with a `routerLink` turns the content area into a `<router-outlet>` that follows the URL.
- **Keyboard & a11y** — roving tabindex, Arrow/Home/End/Delete keys, and correct `role="tablist"`/`tab`/`tabpanel` and accordion `aria-expanded`/`aria-controls` semantics.
- **Strip layout** — `vertical`, `justified` and `scrollable` header strips.
- **Accordion options** — `multiple` expansion, edge-to-edge `flush` layout and a `togglePosition` chevron side (`end` by default, RTL-aware), with an animated grid-based collapse.
- **Accordion row actions** — `hubPanelHeadingActions` projects real controls beside the disclosure button (never inside it), so an edit/delete affordance stays valid, keyboard-reachable and visible while the row is collapsed.
- **Custom headers** — project any markup with the `hubPanelHeading` directive.
- **Removable panels** — opt-in `removable` panels close with a ✕ button or the Delete key.
- **Theming** — every token is a `--hub-panels-*` CSS custom property; the accordion view also honours the `--hub-accordion-*` contract.

---

## 📦 Installation

```bash
npm install ng-hub-ui-panels
```

### Peer Dependencies

```json
{
	"@angular/common": ">=21.0.0",
	"@angular/core": ">=21.0.0",
	"@angular/forms": ">=21.0.0",
	"@angular/router": ">=21.0.0",
	"ng-hub-ui-ds": ">=22.0.0",
	"ng-hub-ui-utils": ">=22.7.0"
}
```

`ng-hub-ui-utils` is **required**: both components resolve their accent through its
`resolveHubAccent`, so a project without it fails to build. `ng-hub-ui-ds` is
**optional** (see the theming note above) — panels ships fallbacks and works without it.

```bash
npm install ng-hub-ui-utils
```

---

## ⚙️ Usage

### Tabs (default)

```html
<hub-panels>
	<hub-panel heading="One">First</hub-panel>
	<hub-panel heading="Two">Second</hub-panel>
</hub-panels>
```

### Pills

```html
<hub-panels type="pills"> … </hub-panels>
```

### Accordion

```html
<hub-panels type="accordion" multiple flush>
	<hub-panel heading="Shipping">…</hub-panel>
	<hub-panel heading="Returns">…</hub-panel>
</hub-panels>
```

#### Row actions — `hubPanelHeadingActions`

`hubPanelHeading` projects **inside** the disclosure `<button>`, so it cannot host
controls: a `<button>` nested in another button is invalid HTML and unreachable by
keyboard. `hubPanelHeader` is no help either — it lives inside the collapse region
and disappears when the row closes.

`hubPanelHeadingActions` is the slot for row affordances that must stay usable while
the row is collapsed. It renders in the header row, **beside** the button, so its
controls are real controls and a click never toggles the panel.

```html
<hub-panels type="accordion" multiple>
	<hub-panel>
		<ng-template hubPanelHeading>Shipping address</ng-template>
		<ng-template hubPanelHeadingActions>
			<button type="button" (click)="edit()">Edit</button>
			<button type="button" (click)="remove()">Delete</button>
		</ng-template>
		…
	</hub-panel>
</hub-panels>
```

#### Chevron side — `togglePosition`

`'end'` (default) trails the heading with the chevron; `'start'` leads it. Only the
visual order changes — the DOM is untouched — and the offsets are logical, so the
chevron lands on the right edge under `dir="rtl"` without any extra rule.

```html
<hub-panels type="accordion" togglePosition="start">…</hub-panels>
```

Set the default for the whole app through `HubPanelsConfig`:

```ts
providers: [{ provide: HubPanelsConfig, useValue: { ...new HubPanelsConfig(), togglePosition: 'start' } }];
```

### Cards

`type="card"` drops the navigation strip entirely: every panel is always visible
and rendered as a card. Use the `hubPanelHeader` / `hubPanelFooter` slots for the
card's header and footer bands.

```html
<hub-panels type="card">
	<hub-panel>
		<div hubPanelHeader>Project summary</div>
		Every panel is always visible and styled as a card.
		<div hubPanelFooter>Updated 2 hours ago</div>
	</hub-panel>
	<hub-panel>
		<div hubPanelHeader>Team</div>
		The same header/footer slots work in tabs, pills and accordion too.
	</hub-panel>
</hub-panels>
```

A single `<hub-panel>` can be used on its own, with no container — it renders as a
card by itself:

```html
<hub-panel>
	<div hubPanelHeader>Standalone card</div>
	Dropped on its own, a hub-panel renders as a card.
	<div hubPanelFooter>
		<button class="btn btn-sm btn-primary">Action</button>
	</div>
</hub-panel>
```

> `hubPanelHeader` / `hubPanelFooter` are content bands inside the panel body and
> render in **every** view. They are different from `hubPanelHeading`, which is the
> navigational tab label / accordion disclosure button.

#### Card slots — `variant`, `flush`, `fill`

A plain card exposes three inputs:

- **`variant`** — tints the whole card — background / text / border **and the `hubPanelHeader` / `hubPanelFooter` bands** (a slightly stronger tint of the same accent) — from a single semantic accent (`primary` … `neutral`, or any custom colour), with the same `color-mix` model the alert uses (no colour values added). `--hub-panels-card-border-style` sets the frame style, e.g. `dashed` for an empty-state card.
- **`flush`** — removes the card body padding so it can host a table / list / media block edge-to-edge.
- **`fill`** — makes the card fill its parent's height and its body scroll, so an inner `flex: 1` region is finally bounded. `--hub-panels-body-gap` spaces stacked body children.

> **Two different `flush` inputs.** `<hub-panel flush>` (this one) zeroes the **card body padding** so projected content touches the card's inner edges. `<hub-panels flush>` is a separate input on the **container** that, in the accordion view, strips the accordion's **outer chrome** (side borders + radius). Different element, different view, different effect — they never collide.

```html
<hub-panel variant="success"><div hubPanelHeader>Success</div> Tinted card.</hub-panel>

<hub-panel flush>
	<div hubPanelHeader>Flush</div>
	<div>Runs edge-to-edge to the card sides.</div>
</hub-panel>

<div style="height: 240px; display: flex;">
	<hub-panel fill style="flex: 1;"> …long, scrolling content… </hub-panel>
</div>
```

### Alerts

A standalone `<hub-panel>` becomes a semantic **alert** with
`appearance="alert"` and a `variant`. Each variant maps to the design-system
`--hub-sys-color-<variant>-*` token family — there is no per-colour token set —
so the alert inherits every theme and dark mode automatically.

```html
<hub-panel appearance="alert" variant="success">Your changes were saved.</hub-panel>
<hub-panel appearance="alert" variant="danger">Something went wrong.</hub-panel>
<hub-panel appearance="alert" variant="warning">Your trial ends in 3 days.</hub-panel>
<hub-panel appearance="alert" variant="info">A new version is available.</hub-panel>

<!-- Omit the variant for a neutral alert -->
<hub-panel appearance="alert">A neutral notice.</hub-panel>

<!-- Alerts support the same header/footer slots as cards -->
<hub-panel appearance="alert" variant="danger">
	<div hubPanelHeader>Payment failed</div>
	Update your billing details to keep your subscription active.
	<div hubPanelFooter><button class="btn btn-sm btn-danger">Update billing</button></div>
</hub-panel>
```

> `variant` accepts the built-in `primary | success | danger | warning | info`
> (rendered with the exact design-system tints) **or any custom string**: the
> alert reads `--hub-sys-color-<variant>` from your app and derives its look with
> `color-mix`, so your own accent palette works with no changes here.
>
> ```html
> <!-- with `:root { --hub-sys-color-brand: #9333ea; }` defined in your app -->
> <hub-panel appearance="alert" variant="brand">On-brand callout</hub-panel>
> ```
>
> The alert appearance is ignored in the `tabs` / `pills` / `accordion` strip views.

### Strip accent (`variant`)

Give `<hub-panels>` a `variant` to set the **semantic accent of the navigation
strip** — the active/hover tab, the active pill and the active accordion header
all follow it. It re-bases a single `--hub-panels-accent` (with derived
`-emphasis` / `-subtle` roles), so changing one accent recolours the whole strip.

```html
<hub-panels variant="success"> … </hub-panels>
<hub-panels type="pills" variant="danger"> … </hub-panels>
<hub-panels type="accordion" variant="info"> … </hub-panels>
```

> `variant` accepts the built-in `primary | success | danger | warning | info`
> (rendered with the exact design-system tints) **or any custom string**: the
> strip reads `--hub-sys-color-<variant>` from your app and derives the
> hover/active roles with `color-mix`, so your own accent palette works with no
> changes here. Defaults to `primary` when omitted. Same open-set pattern as the
> `<hub-panel appearance="alert">` accent.

### Vertical / Justified / Scrollable

```html
<hub-panels vertical> … </hub-panels>
<hub-panels justified> … </hub-panels>
<div style="max-width: 360px">
	<hub-panels scrollable> … many panels … </hub-panels>
</div>
```

### Reactive forms

```html
<hub-panels [formControl]="selected">
	<hub-panel heading="Light" value="light">…</hub-panel>
	<hub-panel heading="Dark" value="dark">…</hub-panel>
</hub-panels>
```

```ts
selected = new FormControl<string>('dark');
```

With `multiple`, the form value is an array. Use `bindValue="meta.key"` to map
each panel's `value` object to a primitive, and `compareWith` for custom equality.

### Multiple selection

Add `multiple` to let several panels be open at once. In the `tabs` / `pills`
views the open panes render side by side (or stacked, when `vertical`), each at
least `--hub-panels-pane-min-width` wide; the content area scrolls when they
overflow. In the `accordion` view every selected panel expands.

```html
<hub-panels multiple [formControl]="open">
	<hub-panel heading="Summary" value="summary">…</hub-panel>
	<hub-panel heading="Stats" value="stats">…</hub-panel>
	<hub-panel heading="Activity" value="activity">…</hub-panel>
</hub-panels>
```

```ts
open = new FormControl<string[]>(['summary', 'stats']);
```

### Routed panels

```html
<hub-panels>
	<hub-panel heading="Profile" routerLink="/account/profile">Loaded via router-outlet</hub-panel>
	<hub-panel heading="Billing" routerLink="/account/billing">Loaded via router-outlet</hub-panel>
</hub-panels>
```

When the active panel is routed, the content area renders a `<router-outlet>` and
the active panel follows the current URL (`tabs` / `pills` views only).

### Custom headers

```html
<hub-panel>
	<ng-template hubPanelHeading>
		<i class="fa-solid fa-gear"></i> Settings <span class="badge text-bg-primary">3</span>
	</ng-template>
	Panel content
</hub-panel>
```

---

## 🪄 API Reference

### `<hub-panels>` inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'tabs' \| 'pills' \| 'accordion' \| 'card'` | `'tabs'` | Visualization of the container. `card` removes the strip and shows every panel as a card. |
| `vertical` | `boolean` | `false` | Stacks the strip beside the content (tabs / pills). |
| `justified` | `boolean` | `false` | Stretches headers to equal width. |
| `scrollable` | `boolean` | `false` | Adds scroll buttons when the strip overflows. |
| `isKeysAllowed` | `boolean` | `true` | Enables keyboard navigation. |
| `multiple` | `boolean` | `false` | Accordion: allow several panels expanded at once. |
| `flush` | `boolean` | `false` | Accordion: edge-to-edge layout without outer chrome. |
| `togglePosition` | `HubPanelsTogglePosition` (`'start' \| 'end'`) | `'end'` | Accordion: side of the header row the disclosure chevron sits on (logical, so it mirrors under RTL). |
| `variant` | `HubPanelVariant \| string` | `undefined` | Semantic accent of the navigation strip (active/hover tab, active pill, active accordion header). Any string works: it reads `--hub-sys-color-<variant>`. |
| `bindValue` | `string` | `undefined` | Dot-notation path applied to each panel value. |
| `compareWith` | `(a, b) => boolean` | `===` | Equality used to match form values. |

### `<hub-panels>` outputs

| Output | Payload | Description |
| --- | --- | --- |
| `panelChange` | `PanelChangeEvent` | Emitted when a different panel is opened (`{ current, prev }`). |

### `<hub-panel>` inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `heading` | `string` | `undefined` | Plain-text header (ignored when a `hubPanelHeading` template is present). |
| `appearance` | `HubPanelAppearance` (`'card' \| 'alert'`) | `'card'` | Card views only: a plain card or a semantic `alert` callout. Ignored in the tabs / pills / accordion strip views. |
| `variant` | `HubPanelVariant \| string` | `undefined` | Semantic accent of the panel: tints the whole card (reflected as `data-variant`) or colours the `alert`. Any string works: it reads `--hub-sys-color-<variant>`. |
| `flush` | `boolean` | `false` | Card only: removes the body padding for edge-to-edge content. |
| `fill` | `boolean` | `false` | Card only: fills the parent's height and scrolls the body. |
| `standalone` | attribute | — | Static attribute: opts a loose `<hub-panel>` OUT of an ancestor `<hub-panels>` so it renders as a plain card. |
| `id` | `string` | auto | ARIA pairing id. |
| `value` | `unknown` | `id` | Value contributed to the form control. |
| `active` | `boolean` (model) | `false` | Two-way active/expanded state. |
| `disabled` | `boolean` | `false` | Prevents activation. |
| `removable` | `boolean` | `false` | Shows a ✕ and enables the Delete key. |
| `removeLabel` | `string` | `'Remove panel'` | Accessible name (`aria-label`) of the ✕ button; override to localize. |
| `routerLink` | `string \| string[]` | `undefined` | Turns the panel into a routed panel. |
| `queryParams` | `Params` | `undefined` | Query params for `routerLink`. |
| `pathMatch` | `'route' \| 'full'` | `'route'` | URL comparison for routed panels. |
| `customClass` | `string` | `undefined` | Extra classes on the nav item and pane. |

### `<hub-panel>` outputs

| Output | Payload | Description |
| --- | --- | --- |
| `activeChange` | `boolean` | Change half of the two-way `active` model; emitted with the new expanded state. |
| `selectPanel` | `HubPanelComponent` | Emitted when the panel becomes active. |
| `deselectPanel` | `HubPanelComponent` | Emitted when the panel stops being active. |
| `removed` | `HubPanelComponent` | Emitted on removal (✕ or Delete). |

### `<hub-tab-nav>` — lightweight value-bound strip

A content-less, controlled tab strip. It renders the header row only and emits the
selected `value`; the consumer renders the active view itself.

```html
<hub-tab-nav [items]="tabs" [(active)]="selected" appearance="pills" />
```

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `HubTabNavItem[]` | `[]` | The selectable tabs (`{ value, label, disabled?, id? }`). |
| `active` | `unknown` (model) | `undefined` | Two-way selected value; `activeChange` fires on change. |
| `appearance` | `'tabs' \| 'pills'` | `'tabs'` | Underlined tabs or rounded pills. |
| `justified` | `boolean` | `false` | Stretches tabs to equal width. |
| `vertical` | `boolean` | `false` | Stacks the strip vertically. |

| Output | Payload | Description |
| --- | --- | --- |
| `activeChange` | `unknown` | Emitted with the new value when the selected tab changes. |

### Directives

- `hubPanelHeading` — marks an `<ng-template>` inside a `hub-panel` as its custom **navigational** header (tab/pill link or accordion disclosure button).
- `hubPanelHeadingActions` — marks an `<ng-template>` inside a `hub-panel` as the accordion row's **actions** slot, rendered beside the disclosure button (never inside it) so real controls stay valid and reachable while the row is collapsed.
- `hubPanelHeader` — marks an element inside a `hub-panel` as the content **header** band, rendered at the top of the panel body in every view.
- `hubPanelFooter` — marks an element inside a `hub-panel` as the content **footer** band, rendered at the bottom of the panel body in every view.

### `HubPanelsComponent` methods

Reach the container with `viewChild(HubPanelsComponent)` to drive it imperatively. Beyond
these four, its public members are the `ControlValueAccessor` contract Angular calls and
the registration hooks `<hub-panel>` uses.

| Method | Signature | Description |
| --- | --- | --- |
| `selectPanel` | `(panel: HubPanelComponent) => void` | Activates a panel as a user click would: marks it active, navigates when routed and emits `panelChange`. |
| `togglePanel` | `(panel: HubPanelComponent) => void` | Accordion toggle for a panel, honouring `multiple`. |
| `removePanel` | `(panel: HubPanelComponent, options?: { reselect?: boolean; emit?: boolean }) => void` | Removes a panel from the group. |
| `removePanelAndRefocus` | `(panel: HubPanelComponent) => void` | Removes a panel and hands keyboard focus to the closest remaining header, so a Delete-key removal never drops focus to the body. |

### Configuration

Provide `HubPanelsConfig` to change defaults application-wide:

```ts
providers: [{ provide: HubPanelsConfig, useValue: { ...new HubPanelsConfig(), type: 'pills' } }];
```

---

## 🎨 Styling

Everything is themed through `--hub-panels-*` CSS custom properties. See
[`docs/css-variables-reference.md`](./docs/css-variables-reference.md) for the full list.

```css
hub-panels {
	--hub-panels-tab-color-active: #198754;
	--hub-panels-pill-bg-active: #198754;
}
```

The `card` view and the header/footer bands have their own tokens
(`--hub-panels-card-*`, `--hub-panels-card-gap`, `--hub-panels-panel-header-*`).
Because a standalone `<hub-panel>` has no `.hub-panels` ancestor, target the panel
itself when theming standalone cards:

```css
hub-panel {
	--hub-panels-card-border-radius: 0.75rem;
	--hub-panels-panel-header-bg: #eef2ff;
}
```

The accordion view also reads the `--hub-accordion-*` contract, so themes written
for `ng-hub-ui-accordion` keep working.

### `hub-panels-theme` mixin

For the common knobs there is a one-call SCSS mixin, so a theme is a single include
instead of a list of custom properties. Every parameter is optional and only the ones
you pass are emitted.

```scss
@use 'ng-hub-ui-panels/styles' as panels;

.settings {
	@include panels.hub-panels-theme($accent: var(--hub-sys-color-brand), $border-radius: 0.75rem);
}
```

`$accent` feeds `--hub-panels-accent`, from which the component derives the
`-emphasis` / `-subtle` / `-on` roles at runtime. Any token the mixin does not expose is
still set as a `--hub-panels-*` custom property.

---

## ♿ Accessibility

- `tabs` / `pills`: `role="tablist"`, `role="tab"`, `role="tabpanel"`, roving tabindex and `aria-selected`.
- `accordion`: a disclosure button per panel with `aria-expanded` / `aria-controls` and an inert collapsed region.
- Keyboard: Arrow keys, Home, End move focus; Delete removes a `removable` panel; Enter/Space toggle accordion headers.

---

## 📚 Migration from `ng-hub-ui-accordion`

`ng-hub-ui-panels` replaces `ng-hub-ui-accordion`. Map the markup as follows:

| Accordion | Panels |
| --- | --- |
| `<hub-accordion [multiple]="true">` | `<hub-panels type="accordion" multiple>` |
| `<hub-accordion [options]="{ flush: true }">` | `<hub-panels type="accordion" flush>` |
| `<hub-accordion-panel title="…">` | `<hub-panel heading="…">` |
| `<ng-template hubAccordionPanelHeader>` | `<ng-template hubPanelHeading>` |
| `(collapsedChange)` | `(panelChange)` |

Form binding (`formControl` / `ngModel`, `value`, `bindValue`, `compareWith`) works
the same. Existing `--hub-accordion-*` theme overrides keep applying.

---

## 📊 Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## 📄 License

MIT © [Carlos Morcillo](https://www.carlosmorcillo.com)
