# Functionalities of Panels Library

This table details the functionalities of the `ng-hub-ui-panels` library and indicates which ones are covered by interactive examples.

The library ships five components — `hub-panels` (the container), `hub-panel` (a pane, or a standalone card / alert), `hub-tab-nav` (a content-less value-bound strip), and `hub-side-panel` with its layout parent `hub-side-panel-container` (a non-modal side panel) — plus four content-projection directives.

## Container (`hub-panels`)

| Category              | Functionality                                                      | Example Covered |
| :-------------------- | :----------------------------------------------------------------- | :-------------: |
| **Visualizations**    | Underlined tabs (`type="tabs"`, default)                           |       ✅        |
|                       | Rounded pills (`type="pills"`)                                     |       ✅        |
|                       | Stacked accordion (`type="accordion"`)                             |       ✅        |
|                       | Chromeless cards (`type="card"`)                                   |       ✅        |
| **Strip Layout**      | Vertical strip beside the content (`vertical`)                     |       ✅        |
|                       | Headers stretched to equal width (`justified`)                     |       ✅        |
|                       | Scroll buttons on overflow (`scrollable`)                          |       ✅        |
| **Selection**         | Several panels open at once (`multiple`)                           |       ✅        |
|                       | Grouped visible blocks in `multiple` tabs / pills                  |       ✅        |
| **Accordion Options** | Edge-to-edge layout (`flush`)                                      |       ✅        |
|                       | Chevron side (`togglePosition="start" \| "end"`)                   |       ✅        |
|                       | Animated grid-based collapse                                       |       ✅        |
| **Theming**           | Strip accent (`variant`, open set via `--hub-sys-color-<variant>`) |       ✅        |
| **Forms**             | `ControlValueAccessor` with `formControl` / `ngModel`              |       ✅        |
|                       | Array form value under `multiple`                                  |       ✅        |
|                       | Value path narrowing (`bindValue`)                                 |       ❌        |
|                       | Custom equality (`compareWith`)                                    |       ❌        |
| **Keyboard**          | Roving tabindex, Arrow / Home / End keys                           |       ✅        |
|                       | Delete removes a `removable` panel                                 |       ✅        |
|                       | Keyboard navigation switch (`isKeysAllowed`)                       |       ❌        |
| **Events**            | `panelChange` (`{ current, prev }`)                                |       ❌        |
| **Imperative API**    | `selectPanel(panel)`                                               |       ❌        |
|                       | `togglePanel(panel)`                                               |       ❌        |
|                       | `removePanel(panel, options?)`                                     |       ❌        |
|                       | `removePanelAndRefocus(panel)`                                     |       ❌        |
| **Configuration**     | App-wide defaults through `HubPanelsConfig`                        |       ❌        |

## Panel (`hub-panel`)

| Category       | Functionality                                                 | Example Covered |
| :------------- | :------------------------------------------------------------ | :-------------: |
| **Header**     | Plain-text header (`heading`)                                 |       ✅        |
|                | Projected header template (`hubPanelHeading`)                 |       ✅        |
| **Appearance** | Card container (`appearance="card"`, default)                 |       ✅        |
|                | Semantic alert callout (`appearance="alert"`, `role="alert"`) |       ✅        |
|                | Semantic tint (`variant`, open set)                           |       ✅        |
|                | Body padding removed (`flush`)                                |       ✅        |
|                | Fills the parent's height, body scrolls (`fill`)              |       ✅        |
| **Standalone** | A loose `<hub-panel>` renders as a card with no container     |       ✅        |
|                | Opt-out of an ancestor group (`standalone` static attribute)  |       ❌        |
| **State**      | Two-way active / expanded state (`active` / `activeChange`)   |       ✅        |
|                | Non-activatable panel (`disabled`)                            |       ✅        |
|                | Form value contributed (`value`)                              |       ✅        |
|                | ARIA pairing id (`id`, auto-generated)                        |       ❌        |
|                | Extra classes on nav item and pane (`customClass`)            |       ❌        |
| **Removal**    | ✕ affordance and Delete key (`removable`)                     |       ✅        |
|                | Localizable accessible name (`removeLabel`)                   |       ✅        |
|                | `removed` event                                               |       ✅        |
| **Routing**    | Routed panel via `routerLink` and `<router-outlet>`           |       ❌        |
|                | Query params (`queryParams`)                                  |       ❌        |
|                | URL comparison (`pathMatch="route" \| "full"`)                |       ❌        |
| **Events**     | `selectPanel`                                                 |       ❌        |
|                | `deselectPanel`                                               |       ❌        |

## Tab strip (`hub-tab-nav`)

| Category       | Functionality                                      | Example Covered |
| :------------- | :------------------------------------------------- | :-------------: |
| **Items**      | Value-bound item list (`items`)                    |       ✅        |
|                | Disabled item (`disabled`)                         |       ❌        |
|                | Explicit item id (`id`)                            |       ❌        |
| **Selection**  | Two-way selected value (`active` / `activeChange`) |       ✅        |
| **Appearance** | Underlined tabs or rounded pills (`appearance`)    |       ✅        |
|                | Equal-width tabs (`justified`)                     |       ✅        |
|                | Vertical strip (`vertical`)                        |       ❌        |

## Side panel (`hub-side-panel`)

| Category             | Functionality                                                         | Example Covered |
| :------------------- | :-------------------------------------------------------------------- | :-------------: |
| **Modes**            | Docked beside the content, which narrows (`mode="side"`)              |       ✅        |
|                      | Floating over the content edge, page still usable (`mode="over"`)     |       ✅        |
|                      | `side` falls back to `over` below the container `breakpoint`          |       ❌        |
| **Placement**        | Logical edge (`position="start" \| "end"`)                            |       ✅        |
| **State**            | Two-way open state (`open` / `openChange`), `toggle()` / `close()`    |       ✅        |
|                      | Projected content kept alive while closed                             |       ✅        |
| **Slots**            | Header and footer bands (`hubSidePanelHeader` / `hubSidePanelFooter`) |       ✅        |
| **Keyboard & focus** | Escape inside the panel closes it (`closeOnEscape`)                   |       ✅        |
|                      | Focus moved in on open (`autoFocus`) and returned on close            |       ✅        |
| **Accessibility**    | `complementary` landmark named by `ariaLabel`                         |       ✅        |
|                      | `role="region"` and `ariaLabelledBy`                                  |       ❌        |
| **Motion**           | Logical-margin slide, off under `prefers-reduced-motion`              |       ✅        |
| **Layout**           | Panel width capped at the container (`100%`, no query container)      |       ❌        |
|                      | A `position: fixed` descendant still measures from the window         |       ❌        |

## Directives

| Category              | Functionality                                                    | Example Covered |
| :-------------------- | :--------------------------------------------------------------- | :-------------: |
| **Navigation header** | `hubPanelHeading` — custom tab / disclosure label                |       ✅        |
| **Row actions**       | `hubPanelHeadingActions` — controls beside the disclosure button |       ✅        |
| **Content bands**     | `hubPanelHeader` — header band, every view                       |       ✅        |
|                       | `hubPanelFooter` — footer band, every view                       |       ✅        |

## Styling

| Category          | Functionality                                                               | Example Covered |
| :---------------- | :-------------------------------------------------------------------------- | :-------------: |
| **SCSS mixin**    | `hub-panels-theme(...)` one-call theming                                    |       ✅        |
| **CSS Variables** | `--hub-panels-*` token contract                                             |       ✅        |
|                   | `--hub-accordion-*` compatibility contract                                  |       ❌        |
|                   | Card and band tokens (`--hub-panels-card-*`, `--hub-panels-panel-header-*`) |       ✅        |

## Accessibility

| Category         | Functionality                                              | Example Covered |
| :--------------- | :--------------------------------------------------------- | :-------------: |
| **Tabs / pills** | `role="tablist"` / `tab` / `tabpanel` with `aria-selected` |       ✅        |
| **Accordion**    | Disclosure button with `aria-expanded` / `aria-controls`   |       ✅        |
|                  | Inert collapsed region                                     |       ✅        |
| **Alert**        | `role="alert"` on an alert panel                           |       ✅        |
| **Focus**        | Focus handed to the closest header after a removal         |       ✅        |
| **RTL**          | Logical chevron placement under `dir="rtl"`                |       ❌        |
