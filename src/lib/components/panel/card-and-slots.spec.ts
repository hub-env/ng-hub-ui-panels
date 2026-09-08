import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HubPanelFooterDirective } from '../../directives/panel-footer.directive';
import { HubPanelHeaderDirective } from '../../directives/panel-header.directive';
import { HubPanelComponent } from './panel.component';
import { HubPanelsComponent } from '../panels/panels.component';

@Component({
	standalone: true,
	imports: [HubPanelsComponent, HubPanelComponent, HubPanelHeaderDirective, HubPanelFooterDirective],
	template: `
		<hub-panels type="card">
			<hub-panel>
				<div hubPanelHeader>Header A</div>
				Body A
				<div hubPanelFooter>Footer A</div>
			</hub-panel>
			<hub-panel>Body B</hub-panel>
		</hub-panels>
	`
})
class CardContainerHost {}

@Component({
	standalone: true,
	imports: [HubPanelComponent, HubPanelHeaderDirective, HubPanelFooterDirective],
	template: `
		<hub-panel>
			<div hubPanelHeader>Standalone header</div>
			Standalone body
			<div hubPanelFooter>Standalone footer</div>
		</hub-panel>
	`
})
class StandaloneHost {}

@Component({
	standalone: true,
	imports: [HubPanelsComponent, HubPanelComponent, HubPanelHeaderDirective],
	template: `
		<hub-panels type="tabs">
			<hub-panel heading="A">
				<div hubPanelHeader>Tab header</div>
				Body A
			</hub-panel>
		</hub-panels>
	`
})
class TabsWithHeaderHost {}

@Component({
	standalone: true,
	imports: [HubPanelComponent],
	template: `
		<hub-panel appearance="alert" variant="success">Saved successfully</hub-panel>
		<hub-panel appearance="alert">Neutral notice</hub-panel>
	`
})
class AlertHost {}

@Component({
	standalone: true,
	imports: [HubPanelsComponent, HubPanelComponent],
	template: `
		<hub-panels type="tabs">
			<hub-panel heading="A" appearance="alert" variant="danger">Body A</hub-panel>
		</hub-panels>
	`
})
class AlertInTabsHost {}

@Component({
	standalone: true,
	imports: [HubPanelComponent],
	template: `<hub-panel appearance="alert" variant="brand">Custom accent</hub-panel>`
})
class CustomVariantAlertHost {}

@Component({
	standalone: true,
	imports: [HubPanelComponent],
	template: `<hub-panel appearance="alert" variant="#ff0000">Literal accent</hub-panel>`
})
class LiteralVariantAlertHost {}

@Component({
	selector: 'spec-nested-feature',
	standalone: true,
	imports: [HubPanelComponent],
	template: `<hub-panel><p>nested card body</p></hub-panel>`
})
class NestedFeatureComponent {}

@Component({
	standalone: true,
	imports: [HubPanelsComponent, HubPanelComponent, NestedFeatureComponent],
	template: `
		<hub-panels type="tabs">
			<hub-panel heading="Tab A"><spec-nested-feature /></hub-panel>
		</hub-panels>
	`
})
class NestedStandaloneInTabsHost {}

@Component({
	standalone: true,
	imports: [HubPanelsComponent, HubPanelComponent],
	template: `
		<hub-panels type="tabs">
			@if (true) {
				<hub-panel heading="Wrapped">Wrapped body</hub-panel>
			}
		</hub-panels>
	`
})
class EmbeddedViewPanelHost {}

describe('panels card view + content header/footer slots', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [provideRouter([])]
		}).compileComponents();
	});

	describe('type="card" container', () => {
		it('renders no navigation strip and flags the card view', () => {
			const fixture = TestBed.createComponent(CardContainerHost);
			fixture.detectChanges();

			const root = fixture.nativeElement as HTMLElement;
			expect(root.querySelector('.hub-panels')?.classList).toContain('hub-panels--card');
			expect(root.querySelectorAll('.hub-panels__nav-link').length).toBe(0);
			expect(root.querySelector('.hub-panels__header')).toBeNull();
		});

		it('marks every panel as a card (all visible, none gated by --active)', () => {
			const fixture = TestBed.createComponent(CardContainerHost);
			fixture.detectChanges();

			const panels = fixture.nativeElement.querySelectorAll('.hub-panels__panel');
			expect(panels.length).toBe(2);
			for (const panel of panels) {
				expect(panel.classList).toContain('hub-panels__panel--card');
			}
		});

		it('projects header/footer slots with their band classes', () => {
			const fixture = TestBed.createComponent(CardContainerHost);
			fixture.detectChanges();

			const root = fixture.nativeElement as HTMLElement;
			const header = root.querySelector('[hubPanelHeader]');
			const footer = root.querySelector('[hubPanelFooter]');
			expect(header?.classList).toContain('hub-panels__panel-header');
			expect(footer?.classList).toContain('hub-panels__panel-footer');
			expect(header?.textContent).toContain('Header A');
			expect(footer?.textContent).toContain('Footer A');
		});
	});

	describe('standalone <hub-panel>', () => {
		it('renders as a card without an owning container and without throwing', () => {
			const fixture = TestBed.createComponent(StandaloneHost);
			expect(() => fixture.detectChanges()).not.toThrow();

			const panel = fixture.nativeElement.querySelector('.hub-panels__panel');
			expect(panel).not.toBeNull();
			expect(panel.classList).toContain('hub-panels__panel--card');
			expect(panel.textContent).toContain('Standalone body');
		});

		it('projects the header/footer slots when used standalone', () => {
			const fixture = TestBed.createComponent(StandaloneHost);
			fixture.detectChanges();

			const header = fixture.nativeElement.querySelector('[hubPanelHeader]');
			const footer = fixture.nativeElement.querySelector('[hubPanelFooter]');
			expect(header?.classList).toContain('hub-panels__panel-header');
			expect(footer?.classList).toContain('hub-panels__panel-footer');
		});

		it('renders as a visible card when nested transitively inside a tab pane (no group capture)', () => {
			const fixture = TestBed.createComponent(NestedStandaloneInTabsHost);
			fixture.detectChanges();

			const root = fixture.nativeElement as HTMLElement;
			// The outer group only registered its direct child: one tab link, one tabpanel.
			expect(root.querySelectorAll('.hub-panels__nav-link').length).toBe(1);
			expect(root.querySelectorAll('[role="tabpanel"]').length).toBe(1);

			// The nested panel renders as a standalone card, not as a hidden tab.
			const nested = root.querySelector('spec-nested-feature .hub-panels__panel') as HTMLElement;
			expect(nested).not.toBeNull();
			expect(nested.classList).toContain('hub-panels__panel--card');
			expect(nested.getAttribute('role')).toBeNull();
			expect(nested.textContent).toContain('nested card body');
		});

		it('still registers panels wrapped in a control-flow block of the same template', async () => {
			const fixture = TestBed.createComponent(EmbeddedViewPanelHost);
			fixture.detectChanges();
			// Timing contract: default activation (`#ensureActivePanel`) runs in the
			// container's `afterNextRender` + `queueMicrotask` housekeeping, so the
			// `--active` class lands one settle AFTER the first render. A zone-based
			// TestBed (@angular/build >= 22.0.8 loads zone.js for library test
			// targets) does not flush `afterNextRender` inside `detectChanges()`,
			// so settle explicitly — same pattern as `settle()` in the main spec.
			await fixture.whenStable();
			fixture.detectChanges();

			const root = fixture.nativeElement as HTMLElement;
			const link = root.querySelector('.hub-panels__nav-link');
			expect(link?.textContent).toContain('Wrapped');
			expect(root.querySelectorAll('[role="tabpanel"]').length).toBe(1);
			expect(root.querySelector('[role="tabpanel"]')?.classList).toContain('hub-panels__panel--active');
		});
	});

	describe('alert appearance', () => {
		it('renders a semantic alert with the variant data-attribute and role', () => {
			const fixture = TestBed.createComponent(AlertHost);
			fixture.detectChanges();

			const panels = fixture.nativeElement.querySelectorAll('.hub-panels__panel');
			const success = panels[0] as HTMLElement;
			expect(success.classList).toContain('hub-panels__panel--alert');
			expect(success.classList).not.toContain('hub-panels__panel--card');
			expect(success.getAttribute('data-variant')).toBe('success');
			expect(success.getAttribute('role')).toBe('alert');
			expect(success.textContent).toContain('Saved successfully');
		});

		it('omits data-variant for a neutral alert (no variant)', () => {
			const fixture = TestBed.createComponent(AlertHost);
			fixture.detectChanges();

			const neutral = fixture.nativeElement.querySelectorAll('.hub-panels__panel')[1] as HTMLElement;
			expect(neutral.classList).toContain('hub-panels__panel--alert');
			expect(neutral.getAttribute('data-variant')).toBeNull();
		});

		it('feeds the accent inline from the variant name (success)', () => {
			const fixture = TestBed.createComponent(AlertHost);
			fixture.detectChanges();

			const success = fixture.nativeElement.querySelector(
				'.hub-panels__panel--alert[data-variant=success]'
			) as HTMLElement;
			expect(success.style.getPropertyValue('--hub-panels-alert-accent')).toBe('var(--hub-sys-color-success, success)');
		});

		it('supports an arbitrary custom variant (open accent palette)', () => {
			const fixture = TestBed.createComponent(CustomVariantAlertHost);
			fixture.detectChanges();

			const el = fixture.nativeElement.querySelector('.hub-panels__panel--alert') as HTMLElement;
			expect(el.getAttribute('data-variant')).toBe('brand');
			expect(el.style.getPropertyValue('--hub-panels-alert-accent')).toBe('var(--hub-sys-color-brand, brand)');
		});

		it('passes a literal colour variant through unchanged', () => {
			const fixture = TestBed.createComponent(LiteralVariantAlertHost);
			fixture.detectChanges();

			const el = fixture.nativeElement.querySelector('.hub-panels__panel--alert') as HTMLElement;
			expect(el.style.getPropertyValue('--hub-panels-alert-accent')).toBe('#ff0000');
		});

		it('ignores the alert appearance inside a strip view (tabs)', () => {
			const fixture = TestBed.createComponent(AlertInTabsHost);
			fixture.detectChanges();

			const panel = fixture.nativeElement.querySelector('.hub-panels__panel') as HTMLElement;
			expect(panel.classList).not.toContain('hub-panels__panel--alert');
			expect(panel.getAttribute('data-variant')).toBeNull();
			expect(panel.getAttribute('role')).toBe('tabpanel');
		});
	});

	describe('shared header slot in the tabs view', () => {
		it('projects [hubPanelHeader] inside the pane body of a tab panel', () => {
			const fixture = TestBed.createComponent(TabsWithHeaderHost);
			fixture.detectChanges();

			// The nav strip still renders the tab label…
			const root = fixture.nativeElement as HTMLElement;
			expect(root.querySelector('.hub-panels__nav-link')?.textContent).toContain('A');

			// …and the content header band renders inside the panel body.
			const header = root.querySelector('.hub-panels__panel [hubPanelHeader]');
			expect(header?.classList).toContain('hub-panels__panel-header');
			expect(header?.textContent).toContain('Tab header');
		});
	});
});
