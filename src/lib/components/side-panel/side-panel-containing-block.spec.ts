import { TestBed } from '@angular/core/testing';
import { HubSidePanelContainerComponent } from './side-panel-container.component';
import { HubSidePanelComponent } from './side-panel.component';

/**
 * A `position: fixed` element declared inside the container has to measure from the viewport.
 *
 * It did not: the container carried `container-type: inline-size`, which applies layout
 * containment, and a layout-contained box becomes the containing block for every fixed descendant.
 * A fullscreen overlay written inside the content area — a `hub-loading mode="fullscreen"`, a
 * cookie banner, a consumer's own dialog — was sized and placed against the container instead of
 * the window, and consuming products worked around it by moving the node to `<body>` by hand.
 *
 * Nothing about that is visible in the markup and jsdom computes no layout, so what is pinned here
 * is the declaration that creates the containing block, read back from the stylesheet the build
 * actually injects rather than from the `.scss` source.
 */

/** Properties that, declared on an ancestor, make it the containing block for `position: fixed`. */
const CONTAINING_BLOCK_PROPERTIES = [
	'container',
	'container-type',
	'contain',
	'transform',
	'translate',
	'rotate',
	'scale',
	'perspective',
	'filter',
	'backdrop-filter',
	'will-change'
];

/** Container-relative length units, which only resolve inside a query container. */
const CONTAINER_UNITS = /\d(?:\.\d+)?cq(?:i|b|w|h|min|max)\b/;

/** The marker attribute Angular's encapsulation shim stamps on this component's host rules. */
function hostMarker(element: HTMLElement): string {
	const marker = Array.from(element.attributes)
		.map((attribute) => attribute.name)
		.find((name) => name.startsWith('_nghost-'));

	expect(marker).toBeTruthy();
	return marker as string;
}

/**
 * The declarations of every rule that selects the given host, gathered from the document.
 *
 * Read from the injected `<style>` elements, not from the source: `:host` means nothing until the
 * shim has rewritten it, and the rules that reach the page are the ones that decide the cascade.
 */
function hostDeclarations(marker: string): string[] {
	const css = Array.from(document.querySelectorAll('style'))
		.map((style) => style.textContent ?? '')
		.join('\n')
		.replace(/\/\*[\s\S]*?\*\//g, '');

	const declarations: string[] = [];

	for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		if (rule[1].includes(`[${marker}]`)) {
			declarations.push(...rule[2].split(';').map((declaration) => declaration.trim()));
		}
	}

	return declarations.filter(Boolean);
}

/** The property half of a declaration, lowercased; custom properties keep their leading dashes. */
const propertyOf = (declaration: string): string => declaration.slice(0, declaration.indexOf(':')).trim().toLowerCase();

describe('hub-side-panel-container containing block', () => {
	it('declares nothing that makes it the containing block for a fixed descendant', () => {
		const fixture = TestBed.createComponent(HubSidePanelContainerComponent);
		fixture.detectChanges();

		const offenders = hostDeclarations(hostMarker(fixture.nativeElement))
			.map(propertyOf)
			.filter((property) => CONTAINING_BLOCK_PROPERTIES.includes(property));

		expect(offenders).toEqual([]);
	});
});

describe('hub-side-panel width cap', () => {
	/**
	 * The cap used to be `100cqi`, which only means anything while an ancestor is a query
	 * container. Now that the container is not one, a surviving `cq` unit would silently fall back
	 * to the viewport size and the panel would stop being capped at its container.
	 */
	it('caps the panel without a container-relative unit', () => {
		const fixture = TestBed.createComponent(HubSidePanelComponent);
		fixture.detectChanges();

		const declarations = hostDeclarations(hostMarker(fixture.nativeElement));
		const sized = declarations.filter((declaration) => propertyOf(declaration) === 'inline-size');

		expect(sized.length).toBeGreaterThan(0);
		expect(declarations.filter((declaration) => CONTAINER_UNITS.test(declaration))).toEqual([]);
	});
});
