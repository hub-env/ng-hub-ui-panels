import { NgTemplateOutlet } from '@angular/common';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	ElementRef,
	inject,
	input,
	model,
	OnDestroy,
	output,
	Renderer2,
	signal,
	TemplateRef,
	ViewEncapsulation
} from '@angular/core';
import { Params, Router } from '@angular/router';

import { HubPanelAppearance, HubPanelVariant } from '../../models/panels.types';
import { resolveHubAccent } from '../../utils/resolve-hub-accent';
import { PanelsComponent } from '../panels/panels.component';

/** Monotonic counter backing the auto-generated accessibility ids. */
let nextPanelId = 0;

/**
 * One content panel inside a `<hub-panels>` container.
 *
 * In the `tabs` / `pills` views the host element is the tab *panel*
 * (`role="tabpanel"`) and the clickable header is rendered by
 * {@link PanelsComponent} in the strip. In the `accordion` view this component
 * renders its own disclosure header plus an animated collapse wrapper around
 * the projected content. In every view the header comes from `heading` or from
 * a `<ng-template hubPanelHeading>` projected inside this element.
 *
 * Panels can be plain content panes or routed: when `routerLink` is set, the
 * container renders a `<router-outlet>` instead of the projected panels and
 * the active panel follows the current URL (`tabs` / `pills` views only).
 *
 * @example
 * ```html
 * <hub-panels>
 *   <hub-panel heading="Fields">…</hub-panel>
 *   <hub-panel>
 *     <ng-template hubPanelHeading>Validations <span class="badge">3</span></ng-template>
 *     …
 *   </hub-panel>
 * </hub-panels>
 * ```
 */
@Component({
	selector: 'hub-panel, [hub-panel]',
	exportAs: 'hubPanel',
	imports: [NgTemplateOutlet],
	templateUrl: './panel.component.html',
	// The `card` view styles (and the projected header/footer bands) live here so
	// a standalone `<hub-panel>` — used outside any `<hub-panels>` container, which
	// would otherwise be the only source of the global styles — is styled too.
	// `ViewEncapsulation.None` is required so the rules reach the projected,
	// consumer-owned `[hubPanelHeader]` / `[hubPanelFooter]` elements.
	styleUrl: './panel.component.scss',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-panels__panel',
		'[attr.id]': 'accordionView() || cardView() ? null : id()',
		'[attr.role]': "alertView() ? 'alert' : (accordionView() || cardView() ? null : 'tabpanel')",
		'[attr.aria-labelledby]': "accordionView() || cardView() ? null : id() + '-link'",
		'[attr.data-variant]': 'cardView() ? (variant() ?? null) : null',
		'[style.--hub-panels-alert-accent]': 'alertAccent()',
		'[style.--hub-panels-card-accent]': 'cardAccent()',
		'[class.hub-panels__panel--active]': 'active()',
		'[class.hub-panels__panel--accordion]': 'accordionView()',
		'[class.hub-panels__panel--toggle-start]': 'toggleAtStart()',
		'[class.hub-panels__panel--card]': 'cardView() && !alertView()',
		'[class.hub-panels__panel--alert]': 'alertView()',
		'[class.hub-panels__panel--fill]': 'fill()',
		'[class.hub-panels__panel--flush]': 'flush()'
	}
})
export class PanelComponent implements OnDestroy {
	/** Host element reference — exposed so the container can detach removed panes. */
	readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

	readonly #renderer = inject(Renderer2);
	readonly #router = inject(Router);

	/**
	 * Owning panels container, or `null` when the panel is used standalone
	 * (outside any `<hub-panels>`), in which case it renders as a card.
	 * Exposed to the template for the accordion header.
	 *
	 * Resolved with `host: true`, so a panel only binds to a group declared in
	 * the SAME template (its direct container). Without the host boundary the
	 * lookup walks the whole ancestor injector tree, and a standalone panel
	 * inside a component projected into a tab pane would register itself as a
	 * hidden tab of the outer group instead of rendering as a card.
	 */
	protected readonly tabset = inject(PanelsComponent, { optional: true, host: true });

	/**
	 * Opts a standalone `<hub-panel>` OUT of an ancestor `<hub-panels>` group so it
	 * renders as a plain card even when nested inside a tabs / pills / accordion
	 * container (otherwise hierarchical DI would capture it as a hidden 0×0 tab).
	 *
	 * Must be a STATIC attribute (`<hub-panel standalone>`): the opt-out is decided
	 * when the panel is created — before dynamic inputs are applied — so it is read
	 * from the host attribute rather than a reactive input.
	 */
	readonly standalone = this.elementRef.nativeElement.hasAttribute('standalone');

	/** Plain-text panel header. Ignored when a `hubPanelHeading` template exists. */
	readonly heading = input<string | undefined>(undefined);

	/**
	 * Visual appearance of a standalone panel: a plain `card` (default) or a
	 * semantic `alert` callout. Only meaningful when the panel renders as a
	 * card (used standalone or inside a `card` container); ignored in the
	 * tabs / pills / accordion strip views.
	 */
	readonly appearance = input<HubPanelAppearance>('card');

	/**
	 * Semantic colour applied when `appearance` is `alert`. The built-in values
	 * (`primary` / `success` / `danger` / `warning` / `info`) render with the
	 * design-system tints. Any other string is also accepted: the alert reads
	 * `--hub-sys-color-<variant>` from the host application, so a custom accent
	 * palette interconnects with no changes to this library. Omit for a neutral
	 * alert.
	 */
	readonly variant = input<HubPanelVariant | (string & {}) | undefined>(undefined);

	/**
	 * Makes a card panel fill its parent's height and lets an inner scroll region
	 * work: the host, both content wrappers and the body become a flex column
	 * (`flex: 1; min-height: 0`) and the body scrolls. Opt-in; off by default so
	 * existing layouts are byte-identical. Card view only.
	 */
	readonly fill = input(false, { transform: booleanAttribute });

	/**
	 * Removes the card body padding (`--hub-panels-card-padding-x/-y` → 0) so a card
	 * can host a flush element (a table, a list, a media block) edge-to-edge. Opt-in;
	 * card view only.
	 */
	readonly flush = input(false, { transform: booleanAttribute });

	/**
	 * Unique id used for the `tab` / `tabpanel` (or accordion header / region)
	 * ARIA pairing. Auto-generated (`hub-panel-<n>`) when not provided.
	 */
	readonly id = input<string>(`hub-panel-${nextPanelId++}`);

	/** Whether the panel cannot be activated. */
	readonly disabled = input(false, { transform: booleanAttribute });

	/** Whether the panel shows a remove affordance (✕ and the Delete key). */
	readonly removable = input(false, { transform: booleanAttribute });

	/**
	 * Accessible name announced for the ✕ remove button (`removable` panels).
	 * The visible glyph is decorative, so this label is what assistive
	 * technologies read; override it to localize the control.
	 */
	readonly removeLabel = input<string>('Remove panel');

	/**
	 * URL comparison used to mark routed panels active: `'route'` compares the
	 * path only, `'full'` also compares query params.
	 */
	readonly pathMatch = input<'route' | 'full'>('route');

	/** Navigation target that turns this panel into a routed panel. */
	readonly routerLink = input<string | string[] | null | undefined>(undefined);

	/** Query params appended when navigating to `routerLink`. */
	readonly queryParams = input<Params | null | undefined>(undefined);

	/** Extra CSS classes applied to both the nav item and this pane. */
	readonly customClass = input<string | undefined>(undefined);

	/**
	 * Value this panel contributes when the container is used as a form control
	 * (see {@link PanelsComponent} `ControlValueAccessor`). Defaults to `id`.
	 */
	readonly value = input<unknown>(undefined);

	/** Whether the panel is currently active (expanded, in the accordion view). */
	readonly active = model(false);

	/** Emitted when the panel becomes active. */
	readonly selectPanel = output<PanelComponent>();

	/** Emitted when the panel stops being active. */
	readonly deselectPanel = output<PanelComponent>();

	/** Emitted when the panel is removed through the ✕ button or the Delete key. */
	readonly removed = output<PanelComponent>();

	/** Custom header template registered by `PanelHeadingDirective`. */
	readonly headingRef = signal<TemplateRef<unknown> | undefined>(undefined);

	/**
	 * Header actions template registered by `PanelHeadingActionsDirective`.
	 * Rendered beside the accordion disclosure button — never inside it — so
	 * real `<button>`s stay valid and reachable while the row is collapsed.
	 */
	readonly headingActionsRef = signal<TemplateRef<unknown> | undefined>(undefined);

	/** Whether the owning container renders the accordion visualization. */
	protected readonly accordionView = computed(() => !this.standalone && (this.tabset?.isAccordionView() ?? false));

	/**
	 * Whether this panel's disclosure chevron leads the header row.
	 *
	 * Resolved on the PANEL, not on the container: a nested accordion is a DOM descendant of
	 * the outer one, so a descendant selector on the container would leak the outer chevron
	 * placement into every accordion inside its panels.
	 */
	protected readonly toggleAtStart = computed(
		() => this.accordionView() && this.tabset?.togglePosition() === 'start'
	);

	/**
	 * Whether this panel renders as a card: either inside a `<hub-panels
	 * type="card">` container or standalone (no owning container at all).
	 */
	protected readonly cardView = computed(() => this.standalone || !this.tabset || this.tabset.isCardView());

	/**
	 * Whether this panel renders as a semantic alert: `appearance="alert"` while
	 * in a card-capable context (standalone or inside a `card` container). In the
	 * strip / accordion views the alert appearance is ignored.
	 */
	protected readonly alertView = computed(() => this.appearance() === 'alert' && this.cardView());

	/**
	 * Inline accent fed to the alert styles, resolved from the `variant` input so
	 * ANY colour works. A bareword (a semantic name, a registered accent or a CSS
	 * named colour) resolves to `var(--hub-sys-color-<variant>, <variant>)` — the
	 * design-system token with the word itself as the raw fallback; a literal
	 * (`#hex` / `rgb()` / `oklch()` / `var()`) is passed through unchanged. Returns
	 * `null` for a neutral alert / non-alert view. The built-in semantic variants
	 * additionally pick up their exact ds tints through the SCSS `@each`.
	 */
	protected readonly alertAccent = computed(() => {
		if (!this.alertView()) {
			return null;
		}
		return resolveHubAccent(this.variant());
	});

	/**
	 * Inline accent fed to the card variant tint, resolved from the `variant` input
	 * exactly like {@link alertAccent}: a bareword becomes
	 * `var(--hub-sys-color-<variant>, <variant>)` and a literal colour is passed
	 * through unchanged. Returns `null` for an alert or non-card view, keeping the
	 * card variant set open with no colour values living in this library.
	 */
	protected readonly cardAccent = computed(() => {
		if (!this.cardView() || this.alertView()) {
			return null;
		}
		return resolveHubAccent(this.variant());
	});

	/** Form value resolved for this panel: the explicit `value` or the panel id. */
	readonly formValue = computed(() => (this.value() !== undefined ? this.value() : this.id()));

	/** `routerLink` normalised to a segments array, or `null` when not routed. */
	readonly routerUrl = computed<string[] | null>(() => {
		const link = this.routerLink();
		if (!link) {
			return null;
		}
		return Array.isArray(link) ? link : [link];
	});

	/** Last activation state seen by the effect — avoids emitting on init. */
	#wasActive = false;

	constructor() {
		// A standalone panel (no container, or explicitly `standalone` inside one)
		// renders as a card and skips registration so it never becomes a hidden tab.
		if (!this.standalone) {
			this.tabset?.registerPanel(this);
		}

		// Mirror `customClass` onto the pane host element.
		effect((onCleanup) => {
			const classes = (this.customClass() ?? '')
				.split(' ')
				.map((cssClass) => cssClass.trim())
				.filter((cssClass) => cssClass.length > 0);
			for (const cssClass of classes) {
				this.#renderer.addClass(this.elementRef.nativeElement, cssClass);
			}
			onCleanup(() => {
				for (const cssClass of classes) {
					this.#renderer.removeClass(this.elementRef.nativeElement, cssClass);
				}
			});
		});

		// Activation side effects: emit outputs and enforce single-active-panel
		// (unless the container allows multiple expanded panels — accordion mode).
		effect(() => {
			const isActive = this.active();
			if (isActive && this.disabled()) {
				this.active.set(false);
				return;
			}
			if (isActive === this.#wasActive) {
				return;
			}
			this.#wasActive = isActive;
			if (isActive) {
				this.selectPanel.emit(this);
				if (this.tabset && !this.tabset.allowsMultipleActive()) {
					for (const panel of this.tabset.panels()) {
						if (panel !== this) {
							panel.active.set(false);
						}
					}
				}
			} else {
				this.deselectPanel.emit(this);
			}
		});
	}

	ngOnDestroy(): void {
		if (!this.standalone) {
			this.tabset?.removePanel(this, { reselect: false, emit: false });
		}
	}

	/** Route path plus query string, or `null` when the panel is not routed. */
	getFullRoute(): string | null {
		const route = this.getRoute();
		if (!route) {
			return null;
		}
		const queryString = this.getQueryParamsString();
		return queryString ? `${route}?${queryString}` : route;
	}

	/** Normalised absolute route path, or `null` when the panel is not routed. */
	getRoute(): string | null {
		const routerUrl = this.routerUrl();
		if (!routerUrl) {
			return null;
		}
		let route = routerUrl.join('/').replace(/\/\/+/g, '/');
		if (route.charAt(0) === '.') {
			route = route.substring(1);
		}
		if (route.charAt(0) !== '/') {
			route = `/${route}`;
		}
		return route;
	}

	/** `queryParams` serialised as `key=value&…`, or `null` when empty. */
	getQueryParamsString(): string | null {
		const params = this.queryParams();
		if (!params || !Object.keys(params).length) {
			return null;
		}
		return Object.entries(params)
			.map(([key, value]) => `${key}=${value}`)
			.join('&');
	}

	/** Navigates to the panel's route. No-op for non-routed panels. */
	navigate(): void {
		const routerUrl = this.routerUrl();
		if (routerUrl) {
			this.#router.navigate(routerUrl, { queryParams: this.queryParams() ?? {} });
		}
	}

	/** Accordion header click — toggles this panel through the container. */
	protected onAccordionHeaderClick(): void {
		this.tabset?.togglePanel(this);
	}

	/** Accordion header keyboard navigation, delegated to the container. */
	protected onAccordionHeaderKeydown(event: KeyboardEvent): void {
		this.tabset?.onAccordionKeydown(event, this);
	}

	/**
	 * Removes this panel through the accordion header's ✕ button, handing
	 * keyboard focus to the closest remaining header afterwards.
	 */
	protected removeSelf(): void {
		this.tabset?.removePanelAndRefocus(this);
	}
}
