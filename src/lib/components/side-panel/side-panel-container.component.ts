import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';

/**
 * Layout parent of one or more `<hub-side-panel>` elements.
 *
 * A docked (`side`) panel can only narrow the content if something lays the two out together, so
 * the container is a flex row that holds the page content in its own scrolling area and the
 * panels as direct children. It also measures its own inline size, which is what a panel compares
 * with its `breakpoint` to decide whether it still has room to dock or has to float over the
 * content instead. Measuring the container rather than the viewport keeps that decision right when
 * the container is not full width (a shell with a navigation rail, an embedded demo).
 *
 * A panel declared with a static `position="start"` attribute is projected before the content and
 * every other panel after it, so the DOM order (and therefore the tab order) follows the visual
 * order in the common case. A panel whose `position` is bound is projected after the content and
 * placed visually by CSS `order`.
 *
 * Give the container a block size (`height: 100dvh` in an app shell, a fixed height in a card):
 * the content area scrolls inside it, and an `over` panel spans the container's full height.
 *
 * @example
 * ```html
 * <hub-side-panel-container class="app-shell">
 * 	<main>…the page…</main>
 * 	<hub-side-panel [(open)]="assistantOpen" ariaLabel="Assistant">…</hub-side-panel>
 * </hub-side-panel-container>
 * ```
 */
@Component({
	selector: 'hub-side-panel-container',
	exportAs: 'hubSidePanelContainer',
	templateUrl: './side-panel-container.component.html',
	styleUrl: './side-panel-container.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-side-panel-container'
	}
})
export class HubSidePanelContainerComponent {
	readonly #inlineSize = signal<number | null>(null);

	/**
	 * Measured inline size of the container in CSS pixels, or `null` before the first measurement
	 * and wherever `ResizeObserver` does not exist (server rendering). Panels read it to apply their
	 * `breakpoint`; `null` means "assume there is room", so the server renders the requested mode.
	 */
	readonly inlineSize = this.#inlineSize.asReadonly();

	constructor() {
		const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
		const destroyRef = inject(DestroyRef);

		afterNextRender(() => {
			if (typeof ResizeObserver === 'undefined') {
				return;
			}
			// `borderBoxSize` is logical, so the value stays the inline size in vertical writing
			// modes too; `contentRect.width` is only the fallback for engines that lack it.
			const observer = new ResizeObserver(([entry]) => {
				this.#inlineSize.set(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
			});
			observer.observe(host);
			destroyRef.onDestroy(() => observer.disconnect());
		});
	}
}
