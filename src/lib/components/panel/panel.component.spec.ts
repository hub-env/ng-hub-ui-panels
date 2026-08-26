import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { PanelsComponent } from '../panels/panels.component';
import { PanelComponent } from './panel.component';

@Component({
	standalone: true,
	imports: [PanelsComponent, PanelComponent, ReactiveFormsModule],
	template: `
		<hub-panels [formControl]="control" [multiple]="multiple">
			<hub-panel heading="A" value="a">A</hub-panel>
			<hub-panel heading="B" value="b">B</hub-panel>
		</hub-panels>
	`
})
class FormHostComponent {
	multiple = false;
	readonly control = new FormControl<string | string[] | null>(null);
}

async function settle(fixture: ComponentFixture<FormHostComponent>): Promise<void> {
	fixture.detectChanges();
	await fixture.whenStable();
	fixture.detectChanges();
}

describe('PanelComponent form integration', () => {
	let fixture: ComponentFixture<FormHostComponent>;
	let host: FormHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FormHostComponent],
			providers: [provideRouter([])]
		}).compileComponents();

		fixture = TestBed.createComponent(FormHostComponent);
		host = fixture.componentInstance;
	});

	function navLinks(): HTMLButtonElement[] {
		return Array.from(fixture.nativeElement.querySelectorAll('.hub-panels__nav-link'));
	}

	it('activates the panel matching the bound form value', async () => {
		host.control.setValue('b');
		await settle(fixture);

		expect(navLinks()[1].classList).toContain('hub-panels__nav-link--active');
		expect(navLinks()[0].classList).not.toContain('hub-panels__nav-link--active');
	});

	it('writes the selected panel value back to the form control', async () => {
		host.control.setValue('a');
		await settle(fixture);

		navLinks()[1].click();
		await settle(fixture);

		expect(host.control.value).toBe('b');
	});

	it('exposes an array value when multiple is enabled', async () => {
		host.multiple = true;
		host.control.setValue(['a', 'b']);
		await settle(fixture);

		expect(navLinks()[0].classList).toContain('hub-panels__nav-link--active');
		expect(navLinks()[1].classList).toContain('hub-panels__nav-link--active');
	});

	it('disables every header when the control is disabled', async () => {
		host.control.disable();
		await settle(fixture);

		for (const link of navLinks()) {
			expect(link.disabled).toBe(true);
		}
	});
});
