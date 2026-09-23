import { InjectionToken } from '@angular/core';

import type { HubPanelComponent } from './panel.component';

/**
 * Stands in for `HubPanelComponent` where importing the class would close a cycle.
 *
 * The panel injects its container and the container queries its panels, so one of the two
 * directions has to be type-only. This token is that direction: the panel provides itself under
 * it, and the container queries the token.
 */
export const HUB_PANEL = new InjectionToken<HubPanelComponent>('HUB_PANEL');
