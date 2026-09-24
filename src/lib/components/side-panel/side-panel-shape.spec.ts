import { TestBed } from '@angular/core/testing';

import { HubSidePanelContainerComponent } from './side-panel-container.component';
import { HubSidePanelComponent } from './side-panel.component';

/**
 * The panel's shape — how round it is and how far it sits from the container edge — used to be
 * reachable only by writing CSS against `.hub-side-panel`, which is the internal class the token
 * contract exists to keep private.
 *
 * jsdom lays nothing out, so none of this can be measured. What is pinned instead is the rule the
 * build actually ships: read back from the injected `<style>`, after Sass has compiled it and the
 * encapsulation shim has rewritten `:host`, which is the form that decides the cascade.
 */

/** One `selector { … }` rule of the stylesheet as the build injects it into the document. */
interface StyleRule {
	selector: string;
	body: string;
}

/** The side-panel stylesheet the build ships, comments stripped. */
function shippedCss(): string {
	return Array.from(document.querySelectorAll('style'))
		.map((style) => style.textContent ?? '')
		.filter((text) => text.includes('hub-side-panel'))
		.join('\n')
		.replace(/\/\*[\s\S]*?\*\//g, '');
}

function shippedRules(): StyleRule[] {
	return [...shippedCss().matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
		selector: match[1].trim().replace(/\s+/g, ' '),
		body: match[2]
	}));
}

/** The value the given rule assigns to a property, whitespace collapsed; `null` when it assigns none. */
function declaration(rule: StyleRule | undefined, property: string): string | null {
	const match = rule?.body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:([^;]*)`));
	return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

/** The `:host` rule with no state class — the one an `end` panel gets on its own. */
function baseRule(): StyleRule | undefined {
	return shippedRules().find((rule) => /^\[_nghost-[^\]]+\]$/.test(rule.selector));
}

/** The `:host(.hub-side-panel--start)` rule. */
function startRule(): StyleRule | undefined {
	return shippedRules().find((rule) => /^\.hub-side-panel--start\[_nghost-[^\]]+\]$/.test(rule.selector));
}

/** The `:host(.hub-side-panel--open)` rule. */
function openRule(): StyleRule | undefined {
	return shippedRules().find((rule) => /^\.hub-side-panel--open\[_nghost-[^\]]+\]$/.test(rule.selector));
}

const RADIUS = 'var(--hub-side-panel-border-radius, 0px)';
const INSET = 'var(--hub-side-panel-inset, 0px)';
const OUTER_RADIUS = `min(${RADIUS}, ${INSET})`;

describe('hub-side-panel shape tokens', () => {
	beforeEach(() => {
		const fixture = TestBed.createComponent(HubSidePanelComponent);
		fixture.detectChanges();
	});

	it('defaults both tokens to zero, so a panel that sets neither is square and flush as before', () => {
		const css = shippedCss();

		// Every read carries the default with it, so nothing here paints differently until a
		// consumer sets the token — and `0px` rather than `0`, because both are read inside
		// `min()` / `calc()`, where a unitless zero is not a length.
		expect(css).toContain(RADIUS);
		expect(css).toContain(INSET);
		expect([...css.matchAll(/var\(--hub-side-panel-border-radius,([^)]*)\)/g)].map((m) => m[1].trim())).toEqual(
			expect.arrayContaining(['0px'])
		);
		expect([...css.matchAll(/var\(--hub-side-panel-(?:border-radius|inset),([^)]*)\)/g)].map((m) => m[1].trim())).toEqual(
			new Array([...css.matchAll(/var\(--hub-side-panel-(?:border-radius|inset),([^)]*)\)/g)].length).fill('0px')
		);

		// The open panel sat flush against the container edge and took no margin. It still does
		// while the inset is zero, which is what makes this a new dial and not a new look.
		expect(declaration(openRule(), 'margin-inline')).toBe(INSET);
		expect(declaration(baseRule(), 'margin-block')).toBe(INSET);
	});

	it('rounds the corners the position leaves free, from the one radius token', () => {
		// The corners facing the content take the radius; the two against the container edge do
		// not. Which pair is which follows the `position` class, so a start panel and an end panel
		// round opposite sides without a token per corner.
		expect(declaration(baseRule(), 'border-start-start-radius')).toBe(RADIUS);
		expect(declaration(baseRule(), 'border-end-start-radius')).toBe(RADIUS);
		expect(declaration(baseRule(), 'border-start-end-radius')).toBe(OUTER_RADIUS);
		expect(declaration(baseRule(), 'border-end-end-radius')).toBe(OUTER_RADIUS);

		expect(declaration(startRule(), 'border-start-end-radius')).toBe(RADIUS);
		expect(declaration(startRule(), 'border-end-end-radius')).toBe(RADIUS);
		expect(declaration(startRule(), 'border-start-start-radius')).toBe(OUTER_RADIUS);
		expect(declaration(startRule(), 'border-end-start-radius')).toBe(OUTER_RADIUS);
	});

	it('changes the rule once the tokens are given a value', () => {
		// Setting the inset moves the panel off the edge and, through the same expression, lets the
		// outer corners round with it: `min()` is the whole per-side logic.
		expect(declaration(baseRule(), 'border-start-end-radius')).toContain('--hub-side-panel-inset');

		// The gap has to come off the closed position too, or a panel inset from the edge would
		// leave a sliver of itself showing while shut.
		expect(declaration(baseRule(), 'margin-inline-end')).toContain('--hub-side-panel-inset');
		expect(declaration(startRule(), 'margin-inline-start')).toContain('--hub-side-panel-inset');
		expect(declaration(baseRule(), 'margin-inline-start')).toBe(INSET);
		expect(declaration(startRule(), 'margin-inline-end')).toBe(INSET);
	});

	it('claims neither token on the host, so a value set on any ancestor reaches the panel', () => {
		const fixture = TestBed.createComponent(HubSidePanelContainerComponent);
		fixture.detectChanges();

		const container = fixture.nativeElement as HTMLElement;
		const panel = document.createElement('hub-side-panel');
		container.appendChild(panel);
		document.body.appendChild(container);

		container.style.setProperty('--hub-side-panel-border-radius', '0.75rem');
		container.style.setProperty('--hub-side-panel-inset', '1rem');

		// A declaration on the panel would beat an inherited value whatever its specificity, which
		// is exactly what the rest of this token contract avoids by reading each one at its point
		// of use. Read back from the panel, not from the container, so a stray `:host` declaration
		// would show up here.
		const computed = getComputedStyle(panel);
		expect(computed.getPropertyValue('--hub-side-panel-border-radius')).toBe('0.75rem');
		expect(computed.getPropertyValue('--hub-side-panel-inset')).toBe('1rem');

		container.remove();
	});
});
