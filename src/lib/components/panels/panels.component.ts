import { NgTemplateOutlet } from '@angular/common';
import {
	afterNextRender,
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	ElementRef,
	forwardRef,
	inject,
	input,
	output,
	Renderer2,
	RendererStyleFlags2,
	signal,
	viewChild,
	viewChildren,
	ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import type { HubPanelsTogglePosition, HubPanelVariant, PanelChangeEvent, PanelsType } from '../../models/panels.types';
import { HubPanelsConfig } from '../../services/panels-config.service';
import { contentBoxWidth } from '../../utils/content-box-width';
import { readByPath } from '../../utils/read-by-path';
import { resolveHubAccent } from 'ng-hub-ui-utils';
import type { HubPanelComponent } from '../panel/panel.component';

interface MultipleHeaderGroup {
	activePanel?: HubPanelComponent;
	headers: HubPanelComponent[];
}

/**
 * Content-panels container — the hub `panels` primitive.
 *
 * Projects `<hub-panel>` panes and renders them in one of three views:
 *
 * - **`tabs` / `pills`** — an accessible `tablist` of clickable headers
 *   (roving tabindex, arrow/Home/End/Delete keys) above the active pane.
 *   Panels with a `routerLink` switch the content area to a `<router-outlet>`
 *   and the active panel follows the URL. With `scrollable`, overflowing
 *   headers get backward/forward scroll buttons.
 * - **`accordion`** — each panel renders as a stacked disclosure panel with an
 *   animated collapse: clicking an open header closes it, `multiple` allows
 *   several panels open at once and `flush` removes the outer chrome. All
 *   panels start collapsed unless a panel is marked `[active]` or a form value
 *   is bound. Routed panels are not supported in this view.
 *
 * The container implements `ControlValueAccessor`, so the active panel(s) can
 * be bound as a form value (`ngModel` / `formControl`): each panel contributes
 * its `value` (or its `id` by default), optionally narrowed with `bindValue`
 * and compared with `compareWith`. With `multiple` the form value is an array.
 *
 * Theming is driven entirely by the `--hub-panels-*` CSS custom properties
 * (see `panels.variables.scss`); the accordion view also honours the
 * `--hub-accordion-*` ng-hub-ui contract as a compatibility fallback.
 *
 * @example
 * ```html
 * <hub-panels type="accordion" multiple [formControl]="openPanels">
 *   <hub-panel heading="Fields" value="fields">…</hub-panel>
 *   <hub-panel heading="Validations" value="validations">…</hub-panel>
 * </hub-panels>
 * ```
 */
@Component({
	selector: 'hub-panels',
	imports: [NgTemplateOutlet, RouterOutlet],
	templateUrl: './panels.component.html',
	// Split by concern (token contract / strip views / accordion view) so each
	// sheet stays inside the `anyComponentStyle` budget.
	styleUrls: ['./panels.variables.scss', './panels.component.scss', './panels.accordion.scss'],
	// Library-style global stylesheet: rules are namespaced under `.hub-panels*`
	// and must reach the projected `hub-panel` panes (host-bound classes).
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => HubPanelsComponent),
			multi: true
		}
	],
	host: {
		class: 'hub-panels',
		'[class.hub-panels--tabs]': "type() === 'tabs'",
		'[class.hub-panels--pills]': "type() === 'pills'",
		'[class.hub-panels--card]': 'isCardView()',
		'[class.hub-panels--vertical]': 'vertical() && !isAccordionView() && !isCardView()',
		'[class.hub-panels--accordion]': 'isAccordionView()',
		'[class.hub-panels--toggle-start]': "isAccordionView() && togglePosition() === 'start'",
		'[class.hub-panels--flush]': 'isAccordionView() && flush()',
		'[class.hub-panels--multiple]': 'multiple()',
		'[attr.data-variant]': 'variant() ?? null',
		'[style.--hub-panels-accent]': 'groupAccent()',
		'(window:resize)': 'onWindowResize()'
	}
})
export class HubPanelsComponent implements ControlValueAccessor {
	readonly #router = inject(Router);
	readonly #renderer = inject(Renderer2);
	readonly #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	readonly #destroyRef = inject(DestroyRef);

	/** Container-wide defaults (aria labels, default type, keyboard toggle). */
	protected readonly config = inject(HubPanelsConfig);

	/** Scrollable container hosting the panel headers (`tabs` / `pills` views). */
	readonly navScroller = viewChild<ElementRef<HTMLElement>>('navScroller');

	/** Backward scroll button (only rendered while it can scroll back). */
	readonly prevBtn = viewChild<ElementRef<HTMLElement>>('prevBtn');

	/** Forward scroll button (only rendered while it can scroll forward). */
	readonly nextBtn = viewChild<ElementRef<HTMLElement>>('nextBtn');

	/** Parking lot that owns the projected panel hosts before they are placed. */
	readonly contentRoot = viewChild<ElementRef<HTMLElement>>('contentRoot');

	/** Visible block hosts used by `multiple` tabs / pills. */
	readonly multiplePaneHosts = viewChildren<ElementRef<HTMLElement>>('multiplePaneHost');

	/** Visible grouped blocks used by `multiple` tabs / pills. */
	readonly multipleBlocks = viewChildren<ElementRef<HTMLElement>>('multipleBlock');

	/** Emitted when the user activates (opens) a different panel. */
	readonly panelChange = output<PanelChangeEvent>();

	/** Whether the panel list is stacked beside the content (`tabs` / `pills`). */
	readonly vertical = input(false, { transform: booleanAttribute });

	/** Whether panel headers stretch to share the available width equally. */
	readonly justified = input(false, { transform: booleanAttribute });

	/** Visualization — `'tabs'` (default), `'pills'` or `'accordion'`. */
	readonly type = input<PanelsType>(this.config.type);

	/** Whether keyboard navigation is enabled. */
	readonly isKeysAllowed = input(this.config.isKeysAllowed, {
		transform: booleanAttribute
	});

	/** Whether overflowing headers get backward/forward scroll buttons. */
	readonly scrollable = input(false, { transform: booleanAttribute });

	/** Accordion view: whether several panels may be expanded at once. */
	readonly multiple = input(false, { transform: booleanAttribute });

	/** Accordion view: edge-to-edge panels without outer borders or radius. */
	readonly flush = input(false, { transform: booleanAttribute });

	/**
	 * Accordion view: which side of the header row the disclosure chevron sits
	 * on — `'end'` (default) trails the heading, `'start'` leads it. Purely
	 * visual: the DOM order never changes, and the placement is expressed with
	 * logical properties, so it mirrors automatically under `dir="rtl"`.
	 */
	readonly togglePosition = input<HubPanelsTogglePosition>(this.config.togglePosition);

	/**
	 * Semantic accent applied to the navigation strip — the active/hover tab, the
	 * active pill and the active accordion header all follow it. The built-in
	 * values (`primary` / `success` / `danger` / `warning` / `info`) render with
	 * the design-system tints; any other string is also accepted, since the strip
	 * reads `--hub-sys-color-<variant>` from the host application, so a custom
	 * accent palette interconnects with no changes to this library. Defaults to
	 * `primary` when omitted.
	 */
	readonly variant = input<HubPanelVariant | (string & {}) | undefined>(undefined);

	/**
	 * Dot-notation path applied to each panel's `value` to obtain the emitted
	 * form value (e.g. `'meta.key'`). Empty by default — the raw value is used.
	 */
	readonly bindValue = input<string | undefined>(undefined);

	/** Equality used to match form values against panel values. `===` by default. */
	readonly compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);

	/** Registered panels, in projection order. */
	readonly panels = signal<HubPanelComponent[]>([]);

	/** Currently active panel, if any (the first one, under `multiple`). */
	readonly activePanel = computed(() => this.panels().find((panel) => panel.active()));

	/** Panel index lookup used by the strip templates and keyboard navigation. */
	readonly panelIndexMap = computed(() => new Map(this.panels().map((panel, index) => [panel, index])));

	/** Whether the container renders the accordion visualization. */
	readonly isAccordionView = computed(() => this.type() === 'accordion');

	/**
	 * Whether the container renders the chromeless `card` visualization: no
	 * navigation strip and every panel always visible, each styled as a card.
	 */
	readonly isCardView = computed(() => this.type() === 'card');

	/**
	 * Inline accent fed to the strip styles, resolved from the `variant` input so
	 * ANY colour works. A bareword (a semantic name, a registered accent or a CSS
	 * named colour) resolves to `var(--hub-sys-color-<variant>, <variant>)` — the
	 * design-system token with the word itself as the raw fallback; a literal
	 * (`#hex` / `rgb()` / `oklch()` / `var()`) is passed through unchanged. Returns
	 * `null` to keep the `primary` default. The built-in semantic variants
	 * additionally pick up their exact ds tints through the SCSS `@each`.
	 */
	protected readonly groupAccent = computed(() => resolveHubAccent(this.variant()));

	/**
	 * Whether more than one panel may be active at once. Driven by `multiple`
	 * for every view, and always enabled in the `card` view, where all panels
	 * stay visible at once and must not deactivate one another.
	 */
	readonly allowsMultipleActive = computed(() => this.multiple() || this.isCardView());

	/** Whether the bound form control disabled the whole container. */
	readonly formDisabled = signal(false);

	/**
	 * Whether the active panel routes its content through a `<router-outlet>`.
	 * Never true in the accordion view, where routed panels are not supported.
	 */
	protected readonly activePanelHasRouter = computed(
		() => !this.isAccordionView() && !this.allowsMultipleActive() && !!this.activePanel()?.routerUrl()
	);

	/**
	 * In `multiple` tabs/pills, headers are partitioned into blocks. Every
	 * active panel starts a block; following inactive headers stay visible in
	 * that same block until the next active panel starts a new one.
	 */
	protected readonly multipleHeaderGroups = computed<MultipleHeaderGroup[]>(() => {
		if (!this.allowsMultipleActive() || this.isAccordionView()) {
			return [];
		}
		const panels = this.panels();
		if (!panels.length) {
			return [];
		}
		const activeIndices = panels.map((panel, index) => (panel.active() ? index : -1)).filter((index) => index !== -1);
		if (!activeIndices.length) {
			return [{ headers: panels }];
		}
		return activeIndices.map((activeIndex, groupIndex) => {
			const startIndex = groupIndex === 0 ? 0 : activeIndex;
			const endIndex = activeIndices[groupIndex + 1] ?? panels.length;
			return {
				activePanel: panels[activeIndex],
				headers: panels.slice(startIndex, endIndex)
			};
		});
	});

	/** Whether the strip cannot scroll further backward. */
	readonly backwardIsDisabled = signal(true);

	/** Whether the strip cannot scroll further forward. */
	readonly forwardIsDisabled = signal(false);

	#isDestroyed = false;
	#syncScheduled = false;
	#viewInitialised = false;
	#placementScheduled = false;
	#multipleBlockSizingScheduled = false;

	/** Last value written by the bound form control; `null` when no form. */
	#formValue: unknown[] | null = null;

	#onChange: (value: unknown) => void = () => undefined;
	#onTouched: () => void = () => undefined;

	constructor() {
		this.#destroyRef.onDestroy(() => {
			this.#isDestroyed = true;
		});

		afterNextRender(() => {
			this.#viewInitialised = true;
			this.updateScrollButtons();
			this.setActivePanel();
			// Re-apply any form value written before the panels' inputs were bound.
			this.#applyFormValue();
			this.#ensureActivePanel();
			this.#schedulePanelPlacement();
			this.#scheduleMultipleBlockSizing();
			this.#router.events
				.pipe(
					filter((event) => event instanceof NavigationEnd),
					takeUntilDestroyed(this.#destroyRef)
				)
				.subscribe(() => this.setActivePanel());
		});
	}

	/**
	 * Registers a panel in the container. Called by `HubPanelComponent` on
	 * construction — not meant for manual use.
	 */
	registerPanel(panel: HubPanelComponent): void {
		this.panels.update((panels) => [...panels, panel]);
		this.#scheduleSync();
	}

	/**
	 * Removes a panel from the container. `reselect` activates the closest
	 * enabled neighbour when the removed panel was active; `emit` fires the
	 * panel's `removed` output.
	 */
	removePanel(panel: HubPanelComponent, options: { reselect?: boolean; emit?: boolean } = {}): void {
		const { reselect = true, emit = true } = options;
		const panels = this.panels();
		const index = panels.indexOf(panel);
		if (index === -1 || this.#isDestroyed) {
			return;
		}

		if (reselect && panel.active() && !this.isAccordionView()) {
			const closestIndex = this.#closestEnabledIndex(index);
			if (closestIndex !== -1) {
				panels[closestIndex].active.set(true);
			}
		}
		if (emit) {
			panel.removed.emit(panel);
		}

		this.panels.update((currentPanels) => currentPanels.filter((candidate) => candidate !== panel));

		// Detach the projected pane: the consumer template still owns the node,
		// so removing the header alone would leave the pane content behind.
		const paneElement = panel.elementRef.nativeElement;
		if (paneElement.parentNode) {
			this.#renderer.removeChild(paneElement.parentNode, paneElement);
		}
		if (panel.active()) {
			panel.active.set(false);
			this.#emitFormValue();
		}
		this.#scheduleSync();
	}

	/**
	 * Removes a panel on behalf of the user (the ✕ button or the Delete key)
	 * and returns keyboard focus to the closest remaining header — strip link
	 * or accordion button — so focus never falls back to `<body>` when the
	 * focused control disappears with its panel.
	 */
	removePanelAndRefocus(panel: HubPanelComponent): void {
		const index = this.panels().indexOf(panel);
		if (index === -1) {
			return;
		}
		this.removePanel(panel);
		queueMicrotask(() => this.#focusPanelAt(Math.min(index, this.panels().length - 1)));
	}

	/**
	 * Activates a panel on behalf of the user (`tabs` / `pills` views): marks it
	 * active, navigates when routed, and emits `panelChange`. In `multiple` mode
	 * clicking an active panel toggles it off (the panes render side by side);
	 * otherwise an already-active panel no-ops. Disabled panels always no-op.
	 */
	selectPanel(panel: HubPanelComponent): void {
		if (panel.disabled() || this.formDisabled()) {
			return;
		}
		if (this.allowsMultipleActive()) {
			if (panel.active()) {
				panel.active.set(false);
			} else {
				panel.active.set(true);
				panel.navigate();
				this.panelChange.emit({ prev: undefined, current: panel });
			}
			this.#emitFormValue();
			this.#onTouched();
			this.#schedulePanelPlacement();
			return;
		}
		if (panel.active()) {
			return;
		}
		const previousPanel = this.activePanel();
		// Deactivate the previously active panel up front so the emitted form
		// value reflects only the newly selected panel. The per-panel effect that
		// enforces single-active runs asynchronously, so relying on it here would
		// emit a stale value that still includes the previous panel.
		if (previousPanel && previousPanel !== panel) {
			previousPanel.active.set(false);
		}
		panel.active.set(true);
		panel.navigate();
		this.panelChange.emit({ prev: previousPanel, current: panel });
		this.#emitFormValue();
		this.#onTouched();
		this.#schedulePanelPlacement();
	}

	/**
	 * Toggles a panel on behalf of the user (accordion view): an open panel
	 * closes, a closed one opens — closing the others unless `multiple`.
	 * Emits `panelChange` when a panel opens.
	 */
	togglePanel(panel: HubPanelComponent): void {
		if (panel.disabled() || this.formDisabled()) {
			return;
		}
		if (panel.active()) {
			panel.active.set(false);
		} else {
			const previousPanel = this.allowsMultipleActive() ? undefined : this.activePanel();
			panel.active.set(true);
			this.panelChange.emit({ prev: previousPanel, current: panel });
		}
		this.#emitFormValue();
		this.#onTouched();
		this.#schedulePanelPlacement();
	}

	/**
	 * Marks the routed panel matching the current URL as active. Does not
	 * navigate — activation through this path is URL-driven. No-op in the
	 * accordion view, where routed panels are not supported.
	 */
	setActivePanel(): void {
		if (this.isAccordionView()) {
			return;
		}
		const [route, queryString] = this.#router.url.split('?');
		for (const panel of this.panels()) {
			if (!panel.routerUrl()) {
				continue;
			}
			let matches: boolean;
			if (panel.pathMatch() === 'full') {
				const currentUrl = queryString?.trim() ? `${route}?${queryString.trim()}` : route;
				matches = currentUrl === panel.getFullRoute();
			} else {
				matches = route === panel.getRoute();
			}
			if (matches) {
				if (!panel.active()) {
					panel.active.set(true);
				}
				break;
			}
		}
	}

	// ── ControlValueAccessor ────────────────────────────────────────────────

	/**
	 * Writes the form value into the container: panels whose (`bindValue`-mapped)
	 * value matches are activated, the rest are deactivated. With `multiple` an
	 * array is expected; otherwise a single value.
	 */
	writeValue(value: unknown): void {
		if (value == null) {
			this.#formValue = [];
		} else if (this.multiple()) {
			this.#formValue = Array.isArray(value) ? [...value] : [value];
		} else {
			this.#formValue = Array.isArray(value) ? value.slice(0, 1) : [value];
		}
		this.#applyFormValue();
	}

	/** Registers the form-control change callback. */
	registerOnChange(onChange: (value: unknown) => void): void {
		this.#onChange = onChange;
	}

	/** Registers the form-control touched callback. */
	registerOnTouched(onTouched: () => void): void {
		this.#onTouched = onTouched;
	}

	/** Enables/disables every panel header on behalf of the form control. */
	setDisabledState(isDisabled: boolean): void {
		this.formDisabled.set(isDisabled);
	}

	/** Keyboard navigation for the panel strip (arrows / Home / End / Delete). */
	protected onPanelKeydown(event: KeyboardEvent, index: number): void {
		if (!this.isKeysAllowed()) {
			return;
		}
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				if (event.key === 'ArrowDown' && !this.vertical()) {
					return;
				}
				event.preventDefault();
				this.#focusPanelAt(this.#stepEnabledIndex(index, 1));
				return;
			case 'ArrowLeft':
			case 'ArrowUp':
				if (event.key === 'ArrowUp' && !this.vertical()) {
					return;
				}
				event.preventDefault();
				this.#focusPanelAt(this.#stepEnabledIndex(index, -1));
				return;
			case 'Home':
				event.preventDefault();
				this.#focusPanelAt(this.panels().findIndex((panel) => !panel.disabled()));
				return;
			case 'End': {
				event.preventDefault();
				const panels = this.panels();
				this.#focusPanelAt(panels.length - 1 - [...panels].reverse().findIndex((panel) => !panel.disabled()));
				return;
			}
			case 'Delete': {
				const panel = this.panels()[index];
				if (panel?.removable()) {
					this.removePanelAndRefocus(panel);
				}
			}
		}
	}

	/**
	 * Keyboard navigation between accordion headers (arrows / Home / End /
	 * Delete). Enter and Space toggle natively through the button click.
	 */
	onAccordionKeydown(event: KeyboardEvent, panel: HubPanelComponent): void {
		if (!this.isKeysAllowed()) {
			return;
		}
		const index = this.panels().indexOf(panel);
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this.#focusPanelAt(this.#stepEnabledIndex(index, 1));
				return;
			case 'ArrowUp':
				event.preventDefault();
				this.#focusPanelAt(this.#stepEnabledIndex(index, -1));
				return;
			case 'Home':
				event.preventDefault();
				this.#focusPanelAt(this.panels().findIndex((candidate) => !candidate.disabled()));
				return;
			case 'End': {
				event.preventDefault();
				const panels = this.panels();
				this.#focusPanelAt(panels.length - 1 - [...panels].reverse().findIndex((candidate) => !candidate.disabled()));
				return;
			}
			case 'Delete': {
				if (panel.removable()) {
					this.removePanelAndRefocus(panel);
				}
			}
		}
	}

	/** Recomputes the enabled/disabled state of the scroll buttons. */
	protected updateScrollButtons(): void {
		if (!this.scrollable() || this.isAccordionView()) {
			return;
		}
		const scroller = this.navScroller()?.nativeElement;
		if (!scroller) {
			return;
		}
		const { scrollLeft, scrollWidth } = scroller;
		this.backwardIsDisabled.set(scrollLeft <= 0);
		this.forwardIsDisabled.set(scrollLeft + contentBoxWidth(scroller) + 1 >= scrollWidth);
	}

	/** Re-syncs scroll controls and multiple-block sizing on window resize. */
	protected onWindowResize(): void {
		this.updateScrollButtons();
		this.#scheduleMultipleBlockSizing();
	}

	/** Updates the scroll buttons as the strip scrolls. */
	protected onScroll(): void {
		this.updateScrollButtons();
	}

	/** Global index of a panel within the projected strip order. */
	protected panelIndex(panel: HubPanelComponent): number {
		return this.panelIndexMap().get(panel) ?? -1;
	}

	/** Scrolls the panel headers one viewport backward. */
	protected navBackward(): void {
		const scroller = this.navScroller()?.nativeElement;
		if (!scroller) {
			return;
		}
		const step = contentBoxWidth(scroller) - this.#visibleScrollButtonsWidth();
		scroller.scrollLeft = Math.max(scroller.scrollLeft - step, 0);
	}

	/** Scrolls the panel headers one viewport forward. */
	protected navForward(): void {
		const scroller = this.navScroller()?.nativeElement;
		if (!scroller) {
			return;
		}
		const step = contentBoxWidth(scroller) - this.#visibleScrollButtonsWidth();
		const lastPosition = scroller.scrollWidth - step;
		scroller.scrollLeft = Math.min(scroller.scrollLeft + step, lastPosition);
	}

	/** Width currently taken by the visible scroll buttons. */
	#visibleScrollButtonsWidth(): number {
		return [this.prevBtn()?.nativeElement, this.nextBtn()?.nativeElement].reduce(
			(total, button) => (button ? total + contentBoxWidth(button) : total),
			0
		);
	}

	/** Index of the enabled panel closest to `index`, or `-1` when none exists. */
	#closestEnabledIndex(index: number): number {
		const panels = this.panels();
		for (let step = 1; step <= panels.length; step += 1) {
			const previous = panels[index - step];
			if (previous && !previous.disabled()) {
				return index - step;
			}
			const next = panels[index + step];
			if (next && !next.disabled()) {
				return index + step;
			}
		}
		return -1;
	}

	/** Next enabled panel index from `index` in `direction`, wrapping around. */
	#stepEnabledIndex(index: number, direction: 1 | -1): number {
		const panels = this.panels();
		for (let step = 1; step <= panels.length; step += 1) {
			const candidate = (index + direction * step + panels.length * step) % panels.length;
			if (!panels[candidate].disabled()) {
				return candidate;
			}
		}
		return index;
	}

	/** Moves DOM focus to the panel header at `index` (strip link or accordion button). */
	#focusPanelAt(index: number): void {
		if (index < 0) {
			return;
		}
		const selector = this.isAccordionView() ? '.hub-panels__accordion-btn' : '.hub-panels__nav-link';
		const headers = this.#elementRef.nativeElement.querySelectorAll<HTMLElement>(selector);
		headers[index]?.focus();
	}

	/**
	 * Coalesces post-registration/removal housekeeping into one microtask:
	 * re-applies the bound form value to the current panels, guarantees an
	 * active panel (non-routed `tabs` / `pills` containers without a bound
	 * form) and refreshes the scroll buttons after the strip changed size.
	 * Skipped until the first render — before it the projected panels' inputs
	 * are not bound yet, and the constructor's `afterNextRender` performs the
	 * initial pass instead.
	 */
	#scheduleSync(): void {
		if (this.#syncScheduled || this.#isDestroyed) {
			return;
		}
		this.#syncScheduled = true;
		queueMicrotask(() => {
			this.#syncScheduled = false;
			if (this.#isDestroyed || !this.#viewInitialised) {
				return;
			}
			this.#applyFormValue();
			this.#ensureActivePanel();
			this.#schedulePanelPlacement();
			this.updateScrollButtons();
		});
	}

	/** Coalesces DOM moves for the projected `hub-panel` hosts. */
	#schedulePanelPlacement(): void {
		if (this.#placementScheduled || this.#isDestroyed) {
			return;
		}
		this.#placementScheduled = true;
		requestAnimationFrame(() => {
			this.#placementScheduled = false;
			if (this.#isDestroyed || !this.#viewInitialised) {
				return;
			}
			this.#runPanelPlacementPass();
			requestAnimationFrame(() => {
				if (this.#isDestroyed || !this.#viewInitialised) {
					return;
				}
				this.#runPanelPlacementPass();
			});
		});
	}

	/** Performs one projected-panel placement pass plus dependent sizing. */
	#runPanelPlacementPass(): void {
		this.#placeProjectedPanels();
		this.#scheduleMultipleBlockSizing();
	}

	/** Coalesces the DOM measurements needed by `multiple + vertical`. */
	#scheduleMultipleBlockSizing(): void {
		if (this.#multipleBlockSizingScheduled || this.#isDestroyed) {
			return;
		}
		this.#multipleBlockSizingScheduled = true;
		requestAnimationFrame(() => {
			this.#multipleBlockSizingScheduled = false;
			if (this.#isDestroyed || !this.#viewInitialised) {
				return;
			}
			this.#syncMultipleBlockSizing();
		});
	}

	/** Moves projected panel hosts into their visible multiple-block container. */
	#placeProjectedPanels(): void {
		const contentRoot = this.contentRoot()?.nativeElement;
		if (!contentRoot) {
			return;
		}
		if (!this.allowsMultipleActive() || this.isAccordionView()) {
			for (const panel of this.panels()) {
				const panelElement = panel.elementRef.nativeElement;
				if (panelElement.parentElement !== contentRoot) {
					this.#renderer.appendChild(contentRoot, panelElement);
				}
			}
			return;
		}
		const hostMap = new Map(
			Array.from(
				this.#elementRef.nativeElement.querySelectorAll<HTMLElement>(
					'.hub-panels__multiple-layout .hub-panels__multiple-pane-host'
				)
			).map((host) => [host.dataset['panelId'] ?? '', host] as const)
		);
		for (const panel of this.panels()) {
			const panelElement = panel.elementRef.nativeElement;
			const targetHost = hostMap.get(panel.id()) ?? contentRoot;
			if (panelElement.parentElement !== targetHost) {
				this.#renderer.appendChild(targetHost, panelElement);
			}
		}
	}

	/** Updates the minimum content width for each `multiple + vertical` block. */
	#syncMultipleBlockSizing(): void {
		for (const blockRef of this.multipleBlocks()) {
			const block = blockRef.nativeElement;
			this.#renderer.removeStyle(block, '--hub-panels-multiple-vertical-panel-min-width', RendererStyleFlags2.DashCase);
			if (!this.vertical() || !this.allowsMultipleActive() || this.isAccordionView()) {
				continue;
			}
			const header = block.querySelector(':scope > .hub-panels__header');
			if (!(header instanceof HTMLElement)) {
				continue;
			}
			const headerStackHeight = Math.ceil(header.getBoundingClientRect().height);
			this.#renderer.setStyle(
				block,
				'--hub-panels-multiple-vertical-panel-min-width',
				`${headerStackHeight}px`,
				RendererStyleFlags2.DashCase
			);
		}
	}

	/**
	 * Activates the first enabled panel when none is active. Skipped for the
	 * accordion view (panels start collapsed), for routed containers (the URL
	 * is the single source of truth) and when a form value is bound (the form
	 * is).
	 */
	#ensureActivePanel(): void {
		if (this.isAccordionView() || this.#formValue !== null) {
			return;
		}
		if (this.allowsMultipleActive()) {
			return;
		}
		const panels = this.panels();
		if (!panels.length || panels.some((panel) => panel.active())) {
			return;
		}
		if (panels.some((panel) => !!panel.routerUrl())) {
			return;
		}
		panels.find((panel) => !panel.disabled())?.active.set(true);
	}

	/** Activates/deactivates panels so they mirror the bound form value. */
	#applyFormValue(): void {
		if (this.#formValue === null) {
			return;
		}
		const compare = this.compareWith();
		for (const panel of this.panels()) {
			const panelValue = this.#comparableValue(panel);
			const matches = this.#formValue.some((selectedValue) => compare(selectedValue, panelValue));
			if (panel.active() !== matches) {
				panel.active.set(matches);
			}
		}
	}

	/** Emits the current selection through the form-control callback. */
	#emitFormValue(): void {
		const compare = this.compareWith();
		const activeValues = this.panels()
			.filter((panel) => panel.active())
			.map((panel) => this.#comparableValue(panel));
		if (this.#formValue !== null) {
			this.#formValue = [...activeValues];
		}
		// Deduplicate defensively when several panels share the same value.
		const uniqueValues = activeValues.filter(
			(value, index) => activeValues.findIndex((candidate) => compare(candidate, value)) === index
		);
		this.#onChange(this.multiple() ? uniqueValues : (uniqueValues[0] ?? null));
	}

	/** Form value of a panel with the `bindValue` path applied. */
	#comparableValue(panel: HubPanelComponent): unknown {
		const rawValue = panel.formValue();
		const bindPath = this.bindValue();
		return bindPath ? readByPath(rawValue, bindPath) : rawValue;
	}
}
