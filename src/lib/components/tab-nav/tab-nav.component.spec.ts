import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubTabNavComponent } from './tab-nav.component';
import type { HubTabNavItem } from './tab-nav.types';

@Component({
	standalone: true,
	imports: [HubTabNavComponent],
	template: ` <hub-tab-nav [items]="items" [active]="active" [appearance]="appearance" (activeChange)="onChange($event)" /> `
})
class HostComponent {
	items: HubTabNavItem[] = [
		{ value: 'a', label: 'Alpha' },
		{ value: 'b', label: 'Beta' },
		{ value: 'c', label: 'Gamma', disabled: true },
		{ value: 'd', label: 'Delta' }
	];
	active: unknown = 'a';
	appearance: 'tabs' | 'pills' = 'tabs';
	readonly changes: unknown[] = [];

	onChange(value: unknown): void {
		this.active = value;
		this.changes.push(value);
	}
}

/** Flushes input propagation + signal-driven view refresh. */
async function settle(fixture: ComponentFixture<HostComponent>): Promise<void> {
	fixture.detectChanges();
	await fixture.whenStable();
	fixture.detectChanges();
}

describe('HubTabNavComponent', () => {
	let fixture: ComponentFixture<HostComponent>;
	let host: HostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HostComponent);
		host = fixture.componentInstance;
	});

	function tabs(): HTMLButtonElement[] {
		return Array.from(fixture.nativeElement.querySelectorAll('.hub-tab-nav__nav-link'));
	}

	it('renders one role=tab button per item inside a role=tablist', async () => {
		await settle(fixture);
		expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeTruthy();
		const buttons = tabs();
		expect(buttons.length).toBe(4);
		expect(buttons.every((button) => button.getAttribute('role') === 'tab')).toBe(true);
		expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
	});

	it('marks the active tab with aria-selected and tabindex 0', async () => {
		await settle(fixture);
		const [alpha, beta] = tabs();
		expect(alpha.getAttribute('aria-selected')).toBe('true');
		expect(alpha.getAttribute('tabindex')).toBe('0');
		expect(beta.getAttribute('aria-selected')).toBe('false');
		expect(beta.getAttribute('tabindex')).toBe('-1');
	});

	it('emits the value on click and reflects it back through active', async () => {
		await settle(fixture);
		tabs()[1].click();
		await settle(fixture);
		expect(host.changes).toEqual(['b']);
		expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
	});

	it('does not emit when a disabled tab is clicked', async () => {
		await settle(fixture);
		tabs()[2].click();
		await settle(fixture);
		expect(host.changes).toEqual([]);
	});

	it('does not emit when re-clicking the already-active tab', async () => {
		await settle(fixture);
		tabs()[0].click();
		await settle(fixture);
		expect(host.changes).toEqual([]);
	});

	it('moves selection with ArrowRight, skipping disabled tabs', async () => {
		host.active = 'b';
		await settle(fixture);
		tabs()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
		await settle(fixture);
		// Beta -> (Gamma disabled) -> Delta
		expect(host.changes).toEqual(['d']);
		expect(tabs()[3].getAttribute('aria-selected')).toBe('true');
	});

	it('wraps to the first enabled tab with ArrowRight from the last', async () => {
		host.active = 'd';
		await settle(fixture);
		tabs()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
		await settle(fixture);
		expect(host.changes).toEqual(['a']);
	});

	it('activates the last enabled tab with End and the first with Home', async () => {
		await settle(fixture);
		tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
		await settle(fixture);
		expect(host.changes.at(-1)).toBe('d');

		tabs()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
		await settle(fixture);
		expect(host.changes.at(-1)).toBe('a');
	});

	it('renders the pills modifier when appearance is pills', async () => {
		host.appearance = 'pills';
		await settle(fixture);
		expect(fixture.nativeElement.querySelector('.hub-tab-nav__nav--pills')).toBeTruthy();
	});
});
