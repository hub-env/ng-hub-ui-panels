import * as api from './public-api';

/**
 * The `Hub` prefix is a promise about the whole exported surface, and a promise nothing
 * enforces is one class away from being false: the next directive added to `public-api.ts`
 * lands unprefixed and nobody notices until a consumer's own `PanelComponent` collides with
 * ours. So the surface is read back from the compiled module rather than listed by hand, and
 * the only names allowed through without the prefix are the aliases kept for the consumers
 * who already import them — each of which has to resolve to the very same class, or the
 * alias is a second implementation wearing an old name.
 */

/** The deprecated names, mapped to the class each one must still resolve to. */
const ALIASES: ReadonlyArray<readonly [string, string]> = [
	['PanelComponent', 'HubPanelComponent'],
	['PanelsComponent', 'HubPanelsComponent'],
	['PanelsConfig', 'HubPanelsConfig'],
	['PanelHeadingDirective', 'HubPanelHeadingDirective'],
	['PanelHeadingActionsDirective', 'HubPanelHeadingActionsDirective'],
	['PanelHeaderDirective', 'HubPanelHeaderDirective'],
	['PanelFooterDirective', 'HubPanelFooterDirective']
];

const UNPREFIXED_BY_DESIGN = new Set(ALIASES.map(([deprecated]) => deprecated));

/** Angular stamps one of these on every class it compiles; plain functions carry none. */
const ANGULAR_DEFINITIONS = ['ɵcmp', 'ɵdir', 'ɵpipe', 'ɵmod', 'ɵprov', 'ɵfac'];

function isAngularClass(value: unknown): boolean {
	return typeof value === 'function' && ANGULAR_DEFINITIONS.some((key) => key in (value as object));
}

describe('ng-hub-ui-panels public surface', () => {
	it('exports no class without the Hub prefix beyond the names kept for compatibility', () => {
		const unprefixed = Object.entries(api)
			.filter(([name, value]) => isAngularClass(value) && !name.startsWith('Hub'))
			.map(([name]) => name)
			.filter((name) => !UNPREFIXED_BY_DESIGN.has(name));

		expect(unprefixed).toEqual([]);
	});

	it.each(ALIASES)('%s still resolves to %s', (deprecated, current) => {
		const surface = api as Record<string, unknown>;

		expect(surface[deprecated]).toBeDefined();
		expect(surface[deprecated]).toBe(surface[current]);
	});
});
