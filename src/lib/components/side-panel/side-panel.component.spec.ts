import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubSidePanelContainerComponent } from './side-panel-container.component';
import { HubSidePanelComponent } from './side-panel.component';
import type { HubSidePanelMode, HubSidePanelPosition } from './side-panel.types';

/** Stateful child: counts its constructions so a test can tell "hidden" from "destroyed and rebuilt". */
@Component({
	selector: 'app-counter',
	template: `<span class="count">{{ count() }}</span>`
})
class CounterComponent {
	static created = 0;
	readonly count = signal(0);

	constructor() {
		CounterComponent.created += 1;
	}
}

/**
 * Host state lives in signals: components are OnPush by default, so a plain field changed after
 * the first render would never reach the bindings.
 */
@Component({
	imports: [HubSidePanelContainerComponent, HubSidePanelComponent, CounterComponent],
	template: `
		<button type="button" class="outside">Outside</button>
		<hub-side-panel-container>
			<p class="page">Page content</p>
			<hub-side-panel position="start" ariaLabel="Navigation" class="start-panel" />
			<hub-side-panel
				#panel
				class="end-panel"
				ariaLabel="Assistant"
				[(open)]="open"
				[mode]="mode()"
				[position]="position()"
				[breakpoint]="breakpoint()"
				[closeOnEscape]="closeOnEscape()"
				[autoFocus]="autoFocus()"
			>
				<h2 hubSidePanelHeader>Assistant</h2>
				<app-counter />
				<input class="draft" autofocus (keydown.escape)="consume($event)" />
				<button hubSidePanelFooter type="button" class="send">Send</button>
			</hub-side-panel>
		</hub-side-panel-container>
	`
})
class HostComponent {
	readonly open = signal(false);
	readonly mode = signal<HubSidePanelMode>('side');
	readonly position = signal<HubSidePanelPosition>('end');
	readonly breakpoint = signal(768);
	readonly closeOnEscape = signal(true);
	readonly autoFocus = signal(false);
	readonly consumeEscape = signal(false);

	readonly panel = viewChild.required<HubSidePanelComponent>('panel');
	readonly counter = viewChild.required(CounterComponent);

	/**
	 * Plays a control that handles Escape itself. It returns nothing on purpose: Angular calls
	 * `preventDefault()` on any event whose template handler returns `false`, so an inline
	 * `flag && $event.preventDefault()` would consume the key exactly when it should not.
	 */
	consume(event: Event): void {
		if (this.consumeEscape()) {
			event.preventDefault();
		}
	}
}

/**
 * Stand-in for `ResizeObserver`, which jsdom does not implement: it hands the container whatever
 * inline size a test reports, so the breakpoint fallback can be driven without a layout engine.
 */
class FakeResizeObserver {
	static instances: FakeResizeObserver[] = [];

	constructor(private readonly callback: ResizeObserverCallback) {
		FakeResizeObserver.instances.push(this);
	}

	observe(): void {}

	disconnect(): void {}

	report(inlineSize: number): void {
		const entry = { borderBoxSize: [{ inlineSize, blockSize: 0 }], contentRect: { width: inlineSize } };
		this.callback([entry as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
	}
}

/** Flushes input propagation, effects and after-render hooks. */
async function settle(fixture: ComponentFixture<HostComponent>): Promise<void> {
	fixture.detectChanges();
	await fixture.whenStable();
	fixture.detectChanges();
}

describe('HubSidePanelComponent', () => {
	let fixture: ComponentFixture<HostComponent>;
	let host: HostComponent;
	const nativeResizeObserver = globalThis.ResizeObserver;

	beforeEach(async () => {
		FakeResizeObserver.instances = [];
		CounterComponent.created = 0;
		globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;

		await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
		fixture = TestBed.createComponent(HostComponent);
		host = fixture.componentInstance;
		await settle(fixture);
	});

	afterEach(() => {
		globalThis.ResizeObserver = nativeResizeObserver;
	});

	function query<T extends Element = HTMLElement>(selector: string): T {
		return fixture.nativeElement.querySelector(selector) as T;
	}

	const panel = () => query('.end-panel');

	async function setOpen(open: boolean): Promise<void> {
		host.open.set(open);
		await settle(fixture);
	}

	async function pressEscapeOn(selector: string): Promise<void> {
		query(selector).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
		await settle(fixture);
	}

	async function reportContainerWidth(inlineSize: number): Promise<void> {
		expect(FakeResizeObserver.instances.length).toBe(1);
		FakeResizeObserver.instances[0].report(inlineSize);
		await settle(fixture);
	}

	it('renders a named complementary landmark, not a dialog', () => {
		expect(panel().getAttribute('role')).toBe('complementary');
		expect(panel().getAttribute('aria-label')).toBe('Assistant');
		expect(panel().hasAttribute('aria-modal')).toBe(false);
		expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
	});

	it('starts closed and inert, so nothing inside can take focus', () => {
		expect(panel().classList).not.toContain('hub-side-panel--open');
		expect(panel().hasAttribute('inert')).toBe(true);
	});

	it('opens through the two-way binding and reports a close back to it', async () => {
		await setOpen(true);
		expect(panel().classList).toContain('hub-side-panel--open');
		expect(panel().hasAttribute('inert')).toBe(false);

		host.panel().close();
		await settle(fixture);
		expect(host.open()).toBe(false);
		expect(panel().classList).not.toContain('hub-side-panel--open');
	});

	it('toggles, and forces the state when told which one', async () => {
		host.panel().toggle();
		await settle(fixture);
		expect(host.open()).toBe(true);

		host.panel().toggle(true);
		await settle(fixture);
		expect(host.open()).toBe(true);

		host.panel().toggle();
		await settle(fixture);
		expect(host.open()).toBe(false);
	});

	it('closes on Escape pressed inside the panel, and never on Escape pressed on the page', async () => {
		await setOpen(true);
		await pressEscapeOn('.page');
		expect(host.open()).toBe(true);

		await pressEscapeOn('.draft');
		expect(host.open()).toBe(false);
	});

	it('keeps Escape for the page when closeOnEscape is off', async () => {
		host.closeOnEscape.set(false);
		await setOpen(true);
		await pressEscapeOn('.draft');
		expect(host.open()).toBe(true);
	});

	it('stays open when a control inside already consumed the Escape', async () => {
		host.consumeEscape.set(true);
		await setOpen(true);
		await pressEscapeOn('.draft');
		expect(host.open()).toBe(true);
	});

	it('sits on the requested logical edge, with a static start panel ahead of the content in the DOM', async () => {
		expect(panel().classList).toContain('hub-side-panel--end');
		expect(query('.start-panel').classList).toContain('hub-side-panel--start');

		const children = Array.from(query('hub-side-panel-container').children);
		const content = query('.hub-side-panel-container__content');
		expect(children.indexOf(query('.start-panel'))).toBeLessThan(children.indexOf(content));
		expect(children.indexOf(panel())).toBeGreaterThan(children.indexOf(content));

		host.position.set('start');
		await settle(fixture);
		expect(panel().classList).toContain('hub-side-panel--start');
		expect(panel().classList).not.toContain('hub-side-panel--end');
	});

	it('renders the requested mode while the container has not been measured', async () => {
		expect(panel().classList).toContain('hub-side-panel--side');

		host.mode.set('over');
		await settle(fixture);
		expect(panel().classList).toContain('hub-side-panel--over');
		expect(panel().classList).not.toContain('hub-side-panel--side');
	});

	it('floats a side panel over the content when the container is narrower than the breakpoint', async () => {
		await reportContainerWidth(500);
		expect(panel().classList).toContain('hub-side-panel--over');
		expect(host.panel().effectiveMode()).toBe('over');

		await reportContainerWidth(1024);
		expect(panel().classList).toContain('hub-side-panel--side');
	});

	it('stays docked at any width when the breakpoint is 0', async () => {
		host.breakpoint.set(0);
		await reportContainerWidth(320);
		expect(panel().classList).toContain('hub-side-panel--side');
	});

	it('keeps the projected content alive while it is closed', async () => {
		await setOpen(true);
		host.counter().count.set(3);
		await setOpen(false);
		await setOpen(true);

		expect(CounterComponent.created).toBe(1);
		expect(query('.count').textContent).toBe('3');
	});

	it('projects the header and footer slots into their own bands', () => {
		expect(query('.hub-side-panel__header h2')?.textContent).toBe('Assistant');
		expect(query('.hub-side-panel__footer .send')).toBeTruthy();
		expect(query('.hub-side-panel__body app-counter')).toBeTruthy();
		expect(query('.start-panel .hub-side-panel__header').childElementCount).toBe(0);
	});

	it('leaves focus where it is on open unless autoFocus is set', async () => {
		const outside = query<HTMLButtonElement>('.outside');
		outside.focus();
		await setOpen(true);
		expect(document.activeElement).toBe(outside);
	});

	it('moves focus to the [autofocus] element on open when autoFocus is set', async () => {
		host.autoFocus.set(true);
		query<HTMLButtonElement>('.outside').focus();
		await setOpen(true);
		expect(document.activeElement).toBe(query('.draft'));
	});

	it('hands focus back to where it was when the panel closes with focus inside', async () => {
		const outside = query<HTMLButtonElement>('.outside');
		outside.focus();
		await setOpen(true);
		query<HTMLInputElement>('.draft').focus();

		await pressEscapeOn('.draft');
		expect(document.activeElement).toBe(outside);
	});
});
