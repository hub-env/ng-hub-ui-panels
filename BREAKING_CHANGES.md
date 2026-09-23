# Breaking Changes - ng-hub-ui-panels

This document tracks breaking changes in the `ng-hub-ui-panels` library.

The major version of this package states which Angular major it targets, so it can never be raised to announce a break:
inside a major line the highest a break can go is a minor, and the notice semantic versioning cannot give here is given
in this file. The two entries under 22.8.2 went out in a patch, which is the reason they need writing up more than any
other entry, not less.

## [22.13.0] - 2026-09-23

### `panels` no longer accepts writes

- **Change**: `HubPanelsComponent.panels` was a `WritableSignal<HubPanelComponent[]>` filled by
  panels registering themselves. It is now a `computed` derived from a content query, so `set` and
  `update` are gone from it.

- **Why**: registration order is creation order, and a panel inside an `@if` is created late. That
  put a conditional tab at the end of the strip however the consumer wrote it. A content query
  reports the panels in the order they are written, which is the order a reader expects.

- **Impact — reading it is unaffected; writing to it no longer compiles.** Nothing outside the
  component wrote to it, so this is expected to touch nobody. If you did, the panels are whatever
  your template declares now: add or remove them there instead. `registerPanel()` still exists and
  still compiles, but does nothing, and it goes in 23.0.0.

## [22.11.0] - 2026-09-08

### The seven exported classes are renamed with the `Hub` prefix

- **Change**: `PanelsComponent` is now `HubPanelsComponent`, `PanelComponent` is
  `HubPanelComponent`, `PanelsConfig` is `HubPanelsConfig`, and the four content directives are
  `HubPanelHeadingDirective`, `HubPanelHeadingActionsDirective`, `HubPanelHeaderDirective` and
  `HubPanelFooterDirective`. Only the exported names move: the classes are the same objects, the
  selectors (`hub-panels`, `hub-panel`, `[hubPanelHeading]`, `[hubPanelHeadingActions]`,
  `[hubPanelHeader]`, `[hubPanelFooter]`) are untouched, and every exported type —
  `PanelChangeEvent`, `HubPanelVariant`, `PanelsType` and the rest — keeps its name.

- **Why**: `PanelComponent` and `PanelsComponent` are ordinary names for ordinary things, and an
  application that has a panel of its own will reach for one of them. An unprefixed export puts the
  library in the consumer's namespace: the file that imports ours and declares its own has two
  bindings on one identifier and has to alias its way out of a collision it did not create. The
  selectors and the types of this package were already prefixed — `hub-panel`, `HubPanelVariant`,
  `HubPanelsTogglePosition` — so the classes were the last part of the surface still spelled the
  other way, which is also why the same import list could show both conventions at once.
  `PanelsConfig` is the sharpest case of the three: it is the DI token an application writes in its
  own `providers` array, so the collision would show up in the place hardest to read.

- **What happens if you do nothing**: today, nothing. All seven old names are still exported as
  `@deprecated` aliases resolving to the very same classes, so imports keep compiling, `imports:
[...]` arrays keep matching, `viewChild(PanelsComponent)` still finds the container and a
  provider written as `{ provide: PanelsConfig, useValue: { ...new PanelsConfig(), type: 'pills' } }`
  still overrides the defaults — the alias and the new name are one class. They are removed in
  **23.0.0**, the release that moves this family to Angular 23, and that is the version where the
  import stops compiling.

- **Migration**: rename the imports and their uses. No template and no stylesheet changes.

    ```ts
    // Before
    import { PanelsComponent, PanelComponent, PanelHeadingDirective, PanelsConfig } from 'ng-hub-ui-panels';

    // After
    import { HubPanelsComponent, HubPanelComponent, HubPanelHeadingDirective, HubPanelsConfig } from 'ng-hub-ui-panels';
    ```

    A `PanelChangeEvent` handler needs no change; its `current` and `prev` were always the panel
    class, which is the same class under its new name.

## [22.8.2] - 2026-07-09

Neither entry below renamed or removed anything, so every consumer kept compiling and only the rendered result moved.
That is why both were filed as `Changed` and shipped under a patch number. They are still breaks: a consumer who styled
`.hub-panels__accordion-btn` directly has to move that CSS.

### `.hub-panels__accordion-btn` no longer paints the row surface

- **Change**: the accordion row's surface is painted by `.hub-panels__accordion-header`, and the disclosure button now
  declares `background-color: transparent`. The tokens are untouched: `--hub-panels-accordion-btn-bg` and
  `--hub-panels-accordion-active-bg` still drive the row's colour, read by the header (the expanded value through the
  `.hub-panels__accordion-header--expanded` modifier).
- **Impact**: theming through those tokens is unaffected. A consumer who bypassed them and set `background` /
  `background-color` on `.hub-panels__accordion-btn` is hit twice. The library now declares `transparent` on that same
  single-class selector, and the component styles are unencapsulated
  (`ViewEncapsulation.None`), so which of the two fills wins comes down to stylesheet order rather than to anything the
  consumer controls. And where the consumer's rule does win, the fill only covers the disclosure button, which since
  22.8.0 is a `flex: 1 1 auto` child of the row — so with `hubPanelHeadingActions` present the actions area keeps the
  header's colour and the row reads two-toned, and the hairline closing an expanded row stays hidden under the button.
- **Migration**: paint the header, not the button — or, better, set the tokens the header already reads.

    ```css
    /* before — the button was the row surface */
    .hub-panels__accordion-btn {
    	background-color: #eef2ff;
    }

    /* after — the row surface belongs to the header */
    .hub-panels__accordion-header {
    	background-color: #eef2ff;
    }
    .hub-panels__accordion-header--expanded {
    	background-color: #dbe4ff;
    }

    /* preferred — the tokens survive any further move of the surface */
    .my-accordion {
    	--hub-panels-accordion-btn-bg: #eef2ff;
    	--hub-panels-accordion-active-bg: #dbe4ff;
    }
    ```

### `.hub-panels__accordion-btn` is no longer `position: relative`

- **Change**: the button dropped `position: relative`; the header carries it instead. That is what lets the trailing
  chevron be anchored to the end of the **row** rather than to the end of the button, which is what `togglePosition="end"`
  always claimed to mean.
- **Impact**: absolutely positioned content inside a `hubPanelHeading` template — a badge pinned to a corner, say — used
  to resolve against the button. It now resolves against `.hub-panels__accordion-header`, which spans the whole row, so
  `inset-inline-end: 0` lands at the row's end instead of the button's: under the chevron's gutter, or over the
  `hubPanelHeadingActions` slot. The header is a containing block too, so nothing escapes to the viewport — the symptom
  is a displaced offset, not a stray element.
- **Migration**: give the positioned content its own containing block inside the heading template.

    ```html
    <ng-template hubPanelHeading>
    	<span class="invoice-heading">Invoices <span class="invoice-heading__badge">3</span></span>
    </ng-template>
    ```

    ```css
    .invoice-heading {
    	position: relative;
    }
    ```

## [22.3.0] - 2026-07-02

### A `<hub-panel>` only joins a `<hub-panels>` declared in the same template

- **Change**: `<hub-panel>` resolves its group with `inject(PanelsComponent, { optional: true, host: true })`. Angular's
  hierarchical DI used to walk the whole ancestor injector tree, so any `<hub-panel>` rendered below a `<hub-panels>`
  found it, however deep and across however many component boundaries.
- **Impact**: a wrapper component whose own template renders a `<hub-panel>` no longer attaches it to a `<hub-panels>`
  outside that template — it renders as a standalone card / alert instead of as a pane of the group, so a wrapper written
  to contribute a tab silently stops contributing it. Panels declared beside their group are unaffected, including those
  under `@if` / `@for` blocks of that same template. The entry was filed as a fix because the same unbounded lookup made
  an unrelated content-card `<hub-panel>` inside a tab pane register as an invisible extra tab of the outer group; the
  cure for that case is the break for this one.
- **Migration**: declare the `<hub-panel>` alongside its `<hub-panels>` and project the wrapper's content into it.

    ```html
    <!-- before — the wrapper rendered the panel and it joined the outer group -->
    <hub-panels>
    	<app-invoice-pane />
    </hub-panels>

    <!-- after — the panel is declared with its group, the wrapper only fills it -->
    <hub-panels>
    	<hub-panel heading="Invoices">
    		<app-invoice-pane />
    	</hub-panel>
    </hub-panels>
    ```

    Two consequences worth collecting while you are there: the `providers: [{ provide: PanelsComponent, useValue: null }]`
    workaround consumers wrote to keep a nested card out of the group is no longer needed and can be deleted, and the
    remaining case `host: true` cannot cover — a card declared **directly** inside a group — is opted out with the
    `standalone` attribute added in 22.4.0.
