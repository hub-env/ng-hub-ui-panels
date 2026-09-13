import {
	afterNextRender,
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	DOCUMENT,
	effect,
	ElementRef,
	inject,
	Injector,
	input,
	model,
	numberAttribute,
	untracked
} from '@angular/core';

import { HubSidePanelContainerComponent } from './side-panel-container.component';
import type { HubSidePanelMode, HubSidePanelPosition, HubSidePanelRole } from './side-panel.types';

/** Elements that can take keyboard focus, in the order a first-focus search should try them. */
const TABBABLE =
	'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
	'textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * Non-modal panel docked to one inline edge of a `<hub-side-panel-container>`.
 *
 * `ng-hub-ui-modal` in offcanvas mode is a real dialog: it covers the viewport, locks the body
 * scroll and traps focus, which is right for a task that must be finished before the page is
 * used again and wrong for a companion that lives beside the page (an assistant, an inspector, a
 * detail pane). This panel is that companion: no backdrop, no scroll lock, no focus trap and no
 * `aria-modal`, so the page stays usable while it is open.
 *
 * - `mode="side"` takes its width from the container row, and the content narrows to make room.
 *   Below `breakpoint` (measured on the container) it falls back to `over`, because a docked panel
 *   on a phone would leave the content a sliver.
 * - `mode="over"` floats over the content edge. Only the strip the panel covers is unusable.
 *
 * Both modes animate the same property: a closed panel keeps its width and sits just beyond the
 * container edge through a negative logical margin, and opening animates that margin to zero. In
 * the docked row that one transition slides the panel in and narrows the content in the same
 * frames; for the floating panel it is a slide. Logical margins keep it right under `dir="rtl"`
 * without a physical transform. `prefers-reduced-motion` turns the transition off.
 *
 * **Content is never destroyed by closing.** Projected content belongs to the consumer's view and
 * lives as long as the `<hub-side-panel>` element does; closing hides it (`visibility: hidden`
 * once the slide ends, and `inert` straight away, so nothing inside can be focused or read while
 * it is shut) and opening shows the same instances again. A chat keeps its thread and its draft.
 * A consumer who wants the content torn down on close wraps it in `@if (panel.open())`.
 *
 * Focus: nothing moves on open unless `autoFocus` is set, in which case the first `[autofocus]`
 * element, else the first tabbable element, else the panel itself takes it. On close, if focus was
 * inside the panel, it goes back to the element that had it when the panel opened, so closing
 * from inside (Escape, a close button) never drops the reader on `<body>`.
 *
 * @example
 * ```html
 * <hub-side-panel-container style="height: 100dvh">
 * 	<main>…the page…</main>
 *
 * 	<hub-side-panel #assistant [(open)]="assistantOpen" ariaLabel="Assistant" autoFocus>
 * 		<header hubSidePanelHeader>
 * 			Assistant <button type="button" (click)="assistant.close()">Close</button>
 * 		</header>
 * 		<app-chat-thread />
 * 		<footer hubSidePanelFooter><textarea autofocus></textarea></footer>
 * 	</hub-side-panel>
 * </hub-side-panel-container>
 * ```
 */
@Component({
	selector: 'hub-side-panel',
	exportAs: 'hubSidePanel',
	templateUrl: './side-panel.component.html',
	styleUrl: './side-panel.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-side-panel',
		tabindex: '-1',
		'[attr.role]': 'role()',
		'[attr.aria-label]': 'ariaLabel() || null',
		'[attr.aria-labelledby]': 'ariaLabelledBy() || null',
		'[attr.inert]': "open() ? null : ''",
		'[class.hub-side-panel--open]': 'open()',
		'[class.hub-side-panel--side]': "effectiveMode() === 'side'",
		'[class.hub-side-panel--over]': "effectiveMode() === 'over'",
		'[class.hub-side-panel--start]': "position() === 'start'",
		'[class.hub-side-panel--end]': "position() === 'end'",
		'(keydown.escape)': 'onEscape($event)'
	}
})
export class HubSidePanelComponent {
	readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
	readonly #document = inject(DOCUMENT);
	readonly #injector = inject(Injector);
	readonly #container = inject(HubSidePanelContainerComponent, { optional: true });

	/** Element that held focus when the panel last opened, where focus returns on close. */
	#returnFocusTo: HTMLElement | null = null;

	/** Docked beside the content (`'side'`) or floating over its edge (`'over'`). */
	readonly mode = input<HubSidePanelMode>('side');

	/** Inline edge of the container the panel sits on; logical, so `'end'` is the left edge in RTL. */
	readonly position = input<HubSidePanelPosition>('end');

	/** Two-way open state; `openChange` fires whenever it changes, whoever changed it. */
	readonly open = model(false);

	/** Whether Escape pressed inside the panel closes it. Escape pressed elsewhere is never taken. */
	readonly closeOnEscape = input(true, { transform: booleanAttribute });

	/**
	 * Container inline size in CSS pixels below which a `side` panel renders as `over`. The default
	 * matches `--hub-sys-breakpoint-md`. `0` keeps the panel docked at any width.
	 */
	readonly breakpoint = input(768, { transform: numberAttribute });

	/** Whether opening moves focus into the panel. Off by default: a companion should not steal focus. */
	readonly autoFocus = input(false, { transform: booleanAttribute });

	/** Landmark role; use `'region'` when the panel sits inside the page's `<main>`. */
	readonly role = input<HubSidePanelRole>('complementary');

	/** Accessible name of the landmark. Give it this or `ariaLabelledBy`: an unnamed landmark is noise. */
	readonly ariaLabel = input<string>();

	/** Id of the element that names the landmark, typically the heading in the header slot. */
	readonly ariaLabelledBy = input<string>();

	/**
	 * The mode actually rendered: `mode`, except that a `side` panel whose container is narrower
	 * than `breakpoint` floats instead. Outside a container, or before the container has measured
	 * itself, the requested mode is used.
	 */
	readonly effectiveMode = computed<HubSidePanelMode>(() => {
		if (this.mode() === 'over') {
			return 'over';
		}
		const inlineSize = this.#container?.inlineSize();
		const breakpoint = this.breakpoint();
		return inlineSize != null && breakpoint > 0 && inlineSize < breakpoint ? 'over' : 'side';
	});

	constructor() {
		// Focus handling reacts to transitions of `open`, not to its value: the first run only
		// records the initial state, so a panel rendered open never grabs focus on page load.
		let previous: boolean | undefined;
		effect(() => {
			const open = this.open();
			untracked(() => {
				if (previous !== undefined && previous !== open) {
					if (open) {
						this.#onOpened();
					} else {
						this.#onClosed();
					}
				}
				previous = open;
			});
		});
	}

	/**
	 * Opens or closes the panel.
	 *
	 * @param force - `true` to open, `false` to close; omitted, the state flips.
	 */
	toggle(force?: boolean): void {
		this.open.set(force ?? !this.open());
	}

	/** Closes the panel. Focus, if it was inside, returns to where it was before the panel opened. */
	close(): void {
		this.open.set(false);
	}

	/**
	 * Closes on Escape. A handler inside the panel that already consumed the key (a select closing
	 * its list calls `preventDefault()`) keeps the panel open; the key is marked consumed here in
	 * turn, so an ancestor listening for Escape does not close as well.
	 */
	protected onEscape(event: Event): void {
		if (!this.open() || !this.closeOnEscape() || event.defaultPrevented) {
			return;
		}
		event.preventDefault();
		this.close();
	}

	/** Remembers where focus was, and moves it inside once the open state has rendered. */
	#onOpened(): void {
		const active = this.#document.activeElement as HTMLElement | null;
		this.#returnFocusTo =
			active && active !== this.#document.body && !this.#host.nativeElement.contains(active) ? active : null;

		if (this.autoFocus()) {
			// After render, not now: the host is still `inert` until the open state reaches the DOM.
			afterNextRender(() => this.#focusInitial(), { injector: this.#injector });
		}
	}

	/**
	 * Hands focus back when it was inside the panel. Checked now, while the element that has focus
	 * is still inside: once `inert` lands the browser blurs it to `<body>`.
	 */
	#onClosed(): void {
		const target = this.#returnFocusTo;
		this.#returnFocusTo = null;

		const active = this.#document.activeElement;
		if (active && this.#host.nativeElement.contains(active) && target?.isConnected) {
			target.focus();
		}
	}

	/**
	 * Focuses the first `[autofocus]` element, else the first tabbable one, else the panel. The
	 * scroll is prevented because the container clips a panel that is still sliding in, and a
	 * focus-driven scroll would shift the whole row sideways.
	 */
	#focusInitial(): void {
		if (!this.open()) {
			return;
		}
		const host = this.#host.nativeElement;
		const target = host.querySelector<HTMLElement>('[autofocus]') ?? host.querySelector<HTMLElement>(TABBABLE) ?? host;
		target.focus({ preventScroll: true });
	}
}
