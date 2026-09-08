import { Directive } from '@angular/core';

/**
 * Marks an element inside a `hub-panel` as the panel's content **footer** band,
 * projected at the bottom of the panel body (below `<ng-content>`).
 *
 * Renders in **every** view (`tabs`, `pills`, `accordion`, `card`); it is the
 * natural actions/footer slot for the `card` format.
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
	selector: '[hubPanelFooter]',
	host: { class: 'hub-panels__panel-footer' }
})
export class HubPanelFooterDirective {}
