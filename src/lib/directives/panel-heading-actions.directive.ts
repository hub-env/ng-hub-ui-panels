import { Directive, inject, TemplateRef } from '@angular/core';

import { HubPanelComponent } from '../components/panel/panel.component';

/**
 * Marks an `<ng-template>` inside a `hub-panel` as that panel's header
 * **actions** slot, rendered in the `accordion` view as a sibling of the
 * disclosure button — inside the header row, outside the button.
 *
 * This is the slot for row affordances that must stay reachable while the
 * panel is collapsed (edit, delete, a menu). They cannot live in
 * `hubPanelHeading`, which projects *inside* the disclosure `<button>`: a
 * `<button>` nested in another button is invalid HTML and is not reachable
 * with the keyboard. Nor can they live in `hubPanelHeader`, which projects
 * inside the collapse region and therefore disappears when the row closes.
 *
 * Clicks on the actions never toggle the panel — the slot sits outside the
 * button, so no `stopPropagation` is needed. In the `tabs` / `pills` / `card`
 * views the slot renders nothing (those views have no header row of their own).
 *
 * @example
 * ```html
 * <hub-panels type="accordion" multiple>
 *   <hub-panel>
 *     <ng-template hubPanelHeading>Shipping address</ng-template>
 *     <ng-template hubPanelHeadingActions>
 *       <button type="button" (click)="edit()">Edit</button>
 *       <button type="button" (click)="remove()">Delete</button>
 *     </ng-template>
 *     Panel content
 *   </hub-panel>
 * </hub-panels>
 * ```
 */
@Directive({ selector: '[hubPanelHeadingActions]' })
export class HubPanelHeadingActionsDirective {
	constructor() {
		inject(HubPanelComponent).headingActionsRef.set(inject(TemplateRef));
	}
}
