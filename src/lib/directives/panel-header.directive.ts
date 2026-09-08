import { Directive } from '@angular/core';

/**
 * Marks an element inside a `hub-panel` as the panel's content **header** band,
 * projected at the top of the panel body (above `<ng-content>`).
 *
 * Unlike `hubPanelHeading` — which renders the navigational label in the
 * `tabs`/`pills` strip or the `accordion` disclosure button — this header lives
 * inside the panel body and renders in **every** view (`tabs`, `pills`,
 * `accordion`, `card`). It is the natural title slot for the `card` format.
 *
 * @example
 * ```html
 * <hub-panel>
 *   <div hubPanelHeader>Card title</div>
 *   Card content
 *   <div hubPanelFooter>Actions</div>
 * </hub-panel>
 * ```
 */
@Directive({
	selector: '[hubPanelHeader]',
	host: { class: 'hub-panels__panel-header' }
})
export class HubPanelHeaderDirective {}
