import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HubPanelComponent } from '../panel/panel.component';
import { HubPanelsComponent } from './panels.component';

/**
 * A panel behind an `@if` is constructed when its condition turns true, not when the template is
 * written. While the strip was built from panels adding themselves in their constructor, that made
 * registration order the creation order: the conditional tab landed last however the consumer wrote
 * it, and moved again every time the condition flipped.
 *
 * The container discovers its panels with a content query now, which reports them in the order the
 * consumer wrote them and reaches through control-flow blocks, so the position is stable.
 *
 * Note the condition is a signal. The application runs zoneless, so a plain field would never make
 * the `@if` re-evaluate and the test would report a panel that was simply never created.
 */
@Component({
	standalone: true,
	imports: [HubPanelsComponent, HubPanelComponent],
	template: `
		<hub-panels>
			<hub-panel heading="One" value="one">Uno</hub-panel>
			@if (showSecond()) {
				<hub-panel heading="Two" value="two">Dos</hub-panel>
			}
			<hub-panel heading="Three" value="three">Tres</hub-panel>
		</hub-panels>
	`
})
class ConditionalHost {
	readonly showSecond = signal(false);
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
	fixture.detectChanges();
	await fixture.whenStable();
	fixture.detectChanges();
}

describe('HubPanelsComponent, tab order', () => {
	let fixture: ComponentFixture<ConditionalHost>;

	const headings = () =>
		Array.from(fixture.nativeElement.querySelectorAll('.hub-panels__link, [role="tab"]')).map((el) =>
			(el as HTMLElement).textContent!.trim()
		);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ConditionalHost],
			providers: [provideRouter([])]
		}).compileComponents();
		fixture = TestBed.createComponent(ConditionalHost);
		await settle(fixture);
	});

	it('opens with the two panels that are written', () => {
		expect(headings()).toEqual(['One', 'Three']);
	});

	it('puts a panel revealed by @if where the template writes it, not at the end', async () => {
		fixture.componentInstance.showSecond.set(true);
		await settle(fixture);

		expect(headings()).toEqual(['One', 'Two', 'Three']);
	});

	it('keeps that position when the condition flips twice', async () => {
		fixture.componentInstance.showSecond.set(true);
		await settle(fixture);
		fixture.componentInstance.showSecond.set(false);
		await settle(fixture);
		fixture.componentInstance.showSecond.set(true);
		await settle(fixture);

		expect(headings()).toEqual(['One', 'Two', 'Three']);
	});
});
