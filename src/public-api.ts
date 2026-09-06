/*
 * Public API Surface of ng-hub-ui-panels
 */

export { PanelHeadingDirective } from './lib/directives/panel-heading.directive';
export { PanelHeadingActionsDirective } from './lib/directives/panel-heading-actions.directive';
export { PanelHeaderDirective } from './lib/directives/panel-header.directive';
export { PanelFooterDirective } from './lib/directives/panel-footer.directive';
export { PanelComponent } from './lib/components/panel/panel.component';
export { PanelsComponent } from './lib/components/panels/panels.component';
export { HubTabNavComponent } from './lib/components/tab-nav/tab-nav.component';
export { PanelsConfig } from './lib/services/panels-config.service';
export type {
	HubPanelAppearance,
	HubPanelsTogglePosition,
	HubPanelVariant,
	PanelChangeEvent,
	PanelsType
} from './lib/models/panels.types';
export type { HubTabNavAppearance, HubTabNavItem } from './lib/components/tab-nav/tab-nav.types';
