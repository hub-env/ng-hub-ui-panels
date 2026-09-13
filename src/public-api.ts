/*
 * Public API Surface of ng-hub-ui-panels
 */

export { HubPanelHeadingDirective } from './lib/directives/panel-heading.directive';
export { HubPanelHeadingActionsDirective } from './lib/directives/panel-heading-actions.directive';
export { HubPanelHeaderDirective } from './lib/directives/panel-header.directive';
export { HubPanelFooterDirective } from './lib/directives/panel-footer.directive';
export { HubPanelComponent } from './lib/components/panel/panel.component';
export { HubPanelsComponent } from './lib/components/panels/panels.component';
export { HubTabNavComponent } from './lib/components/tab-nav/tab-nav.component';
export { HubSidePanelContainerComponent } from './lib/components/side-panel/side-panel-container.component';
export { HubSidePanelComponent } from './lib/components/side-panel/side-panel.component';
export { HubPanelsConfig } from './lib/services/panels-config.service';
export type {
	HubPanelAppearance,
	HubPanelsTogglePosition,
	HubPanelVariant,
	PanelChangeEvent,
	PanelsType
} from './lib/models/panels.types';
export type { HubTabNavAppearance, HubTabNavItem } from './lib/components/tab-nav/tab-nav.types';
export type { HubSidePanelMode, HubSidePanelPosition, HubSidePanelRole } from './lib/components/side-panel/side-panel.types';

// ─── Deprecated aliases ───────────────────────────────────────────────────────
// Every class in the family carries the `Hub` prefix, so a consumer importing several
// packages into one file cannot end up with two `PanelComponent`s. The classes behind
// these aliases are unchanged; only the exported names move.

/** @deprecated Renamed to `HubPanelHeadingDirective`, and removed under this name in **23.0.0**. */
export { HubPanelHeadingDirective as PanelHeadingDirective } from './lib/directives/panel-heading.directive';
/** @deprecated Renamed to `HubPanelHeadingActionsDirective`, and removed under this name in **23.0.0**. */
export { HubPanelHeadingActionsDirective as PanelHeadingActionsDirective } from './lib/directives/panel-heading-actions.directive';
/** @deprecated Renamed to `HubPanelHeaderDirective`, and removed under this name in **23.0.0**. */
export { HubPanelHeaderDirective as PanelHeaderDirective } from './lib/directives/panel-header.directive';
/** @deprecated Renamed to `HubPanelFooterDirective`, and removed under this name in **23.0.0**. */
export { HubPanelFooterDirective as PanelFooterDirective } from './lib/directives/panel-footer.directive';
/** @deprecated Renamed to `HubPanelComponent`, and removed under this name in **23.0.0**. */
export { HubPanelComponent as PanelComponent } from './lib/components/panel/panel.component';
/** @deprecated Renamed to `HubPanelsComponent`, and removed under this name in **23.0.0**. */
export { HubPanelsComponent as PanelsComponent } from './lib/components/panels/panels.component';
/** @deprecated Renamed to `HubPanelsConfig`, and removed under this name in **23.0.0**. */
export { HubPanelsConfig as PanelsConfig } from './lib/services/panels-config.service';
