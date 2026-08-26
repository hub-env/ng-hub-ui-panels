import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	ElementRef,
	inject,
	input,
	model,
	ViewEncapsulation
} from '@angular/core';

import type { HubTabNavAppearance, HubTabNavItem } from './tab-nav.types';

/**
 * Lightweight, value-bound tab strip — the hub `tab-nav` primitive.
 *
 * Where `<hub-panels type="tabs">` couples the strip to projected
 * `<hub-panel>` content (lazy render, accordion / card modes, routing, forms),
 * `<hub-tab-nav>` is a **content-less** controlled strip: it renders an
 * accessible `role="tablist"` of `role="tab"` buttons from a plain `items`
 * array and emits the selected `value` through the two-way `active` model. The
 * consumer owns the view and renders it themselves based on `active()` /
 * `(activeChange)` — a segmented control, a filter switch or a manual
 * tabs-with-external-content layout.
 *
 * It reuses the `<hub-panels>` strip look through the same
 * `--hub-panels-*` theming tokens (picked up automatically when nested in a
 * themed panels subtree, literal fallbacks otherwise) and exposes two
 * strip-local tokens: `--hub-tabs-indicator-color` (the active underline / pill
 * fill) and `--hub-tabs-gap` (the inter-tab gap).
 *
 * Keyboard: arrow keys move focus and activate the neighbour (roving
 * `tabindex`), `Home` / `End` jump to the first / last enabled tab. Disabled
 * tabs are skipped by pointer and keyboard.
 *
 * @example
 * ```html
 * <hub-tab-nav
 * 	[items]="[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }]"
 * 	[(active)]="filter"
 * 	appearance="pills"
 * />
 * <!-- consumer renders its own view based on `filter` -->
 * ```
 */
@Component({
	selector: 'hub-tab-nav',
	exportAs: 'hubTabNav',
	templateUrl: './tab-nav.component.html',
	styleUrl: './tab-nav.component.scss',
	// Library-style global stylesheet: rules stay namespaced under
	// `.hub-tab-nav*` and reach the projected `<button>` headers.
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-tab-nav',
		'[class.hub-tab-nav--vertical]': 'vertical()'
	}
})
export class HubTabNavComponent {
	readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

	/** The selectable tabs, in render order. */
	readonly items = input<HubTabNavItem[]>([]);

	/** Two-way selected value; `activeChange` fires whenever it changes. */
	readonly active = model<unknown>();

	/** Visual appearance — underlined `'tabs'` (default) or rounded `'pills'`. */
	readonly appearance = input<HubTabNavAppearance>('tabs');

	/** Whether the tabs stretch to share the available width equally. */
	readonly justified = input(false, { transform: booleanAttribute });

	/** Whether the strip stacks vertically instead of in a row. */
	readonly vertical = input(false, { transform: booleanAttribute });

	/** Index of the item whose value matches `active`, or `-1` when none does. */
	readonly activeIndex = computed(() => {
		const active = this.active();
		return this.items().findIndex((item) => item.value === active);
	});

	/** Whether the given item is the active one. */
	protected isActive(item: HubTabNavItem): boolean {
		return item.value === this.active();
	}

	/** ARIA id of a tab button — the item's own `id` or a deterministic fallback. */
	protected itemId(item: HubTabNavItem, index: number): string {
		return item.id ?? `hub-tab-nav-${index}`;
	}

	/**
	 * Roving `tabindex` for the tab at `index`: `0` for the active tab (or the
	 * first enabled tab when none is active), `-1` for the rest — so the strip
	 * is a single tab stop and arrow keys move within it.
	 */
	protected tabIndexFor(index: number): number {
		const activeIndex = this.activeIndex();
		if (activeIndex >= 0) {
			return index === activeIndex ? 0 : -1;
		}
		return index === this.items().findIndex((item) => !item.disabled) ? 0 : -1;
	}

	/**
	 * Activates a tab on behalf of the user: sets `active` to its value (which
	 * emits `activeChange`). Disabled tabs and re-selecting the active tab
	 * no-op.
	 */
	select(item: HubTabNavItem): void {
		if (item.disabled || this.isActive(item)) {
			return;
		}
		this.active.set(item.value);
	}

	/** Keyboard navigation for the strip (arrows / Home / End). */
	protected onKeydown(event: KeyboardEvent, index: number): void {
		let target: number;
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				target = this.#stepEnabledIndex(index, 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				target = this.#stepEnabledIndex(index, -1);
				break;
			case 'Home':
				target = this.items().findIndex((item) => !item.disabled);
				break;
			case 'End': {
				const items = this.items();
				target = items.length - 1 - [...items].reverse().findIndex((item) => !item.disabled);
				break;
			}
			default:
				return;
		}
		if (target < 0) {
			return;
		}
		event.preventDefault();
		const item = this.items()[target];
		if (item && !item.disabled) {
			this.active.set(item.value);
			this.#focusAt(target);
		}
	}

	/** Next enabled tab index from `index` in `direction`, wrapping around. */
	#stepEnabledIndex(index: number, direction: 1 | -1): number {
		const items = this.items();
		const count = items.length;
		if (!count) {
			return -1;
		}
		for (let step = 1; step <= count; step += 1) {
			const candidate = (((index + direction * step) % count) + count) % count;
			if (!items[candidate].disabled) {
				return candidate;
			}
		}
		return index;
	}

	/** Moves DOM focus to the tab button at `index`. */
	#focusAt(index: number): void {
		const buttons = this.#host.nativeElement.querySelectorAll<HTMLElement>('.hub-tab-nav__nav-link');
		buttons[index]?.focus();
	}
}
