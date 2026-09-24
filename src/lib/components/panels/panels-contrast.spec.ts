import { compile } from 'sass';
import { compositeOver, contrastRatio, HubRgb, oklchToRgb, rgbToOklch, toHex, toRgb } from 'ng-hub-ui-utils';

/**
 * Three things `<hub-panels>` paints with its accent are text, and text has a floor.
 *
 * The strip's `-emphasis` role — the hovered tab, the card band's label, the label of an
 * alert or card built on a custom accent — was `color-mix(accent 80%, ink)`, and a
 * percentage cannot darken a pale hue: the info card's band label measured 2.46:1 on the
 * band. The built-in variants had already been moved onto the design system's own
 * `-emphasis` token, so the open path a consumer reaches with a custom accent was the only
 * one still broken — the opposite of what the open-set contract promises.
 *
 * The removable tab's ✕ is the other half: an enabled control, with an accessible name,
 * faded to 60% so it sat at 2.42:1 on the active tab and 4.18:1 on the others. Nothing
 * about it is disabled, so nothing exempts it.
 *
 * Measured off the compiled stylesheets: jsdom lays nothing out and resolves no relative
 * colour, so measuring the elements would measure nothing.
 */

/** The ds light-theme accents `--hub-sys-color-*` resolves to. The derivation is under test, not the palette. */
const ACCENTS: Readonly<Record<string, string>> = {
	primary: '#0d6efd',
	secondary: '#6c757d',
	success: '#198754',
	danger: '#dc3545',
	warning: '#ffc107',
	info: '#0dcaf0',
	neutral: '#6c757d',
	light: '#f8f9fa',
	dark: '#212529'
};

/** WCAG AA for body text. A tab label is 16px at weight 500, so the large-text relaxation never applies. */
const MIN_CONTRAST = 4.5;

/** The ds light theme, as far as these derivations read it. */
const THEME: Record<string, string> = {
	'--hub-sys-emphasis-lightness-min': '0',
	'--hub-sys-emphasis-lightness-max': '0.45',
	'--hub-sys-color-ink': '#212529',
	'--hub-sys-surface-page': '#ffffff',
	'--hub-sys-surface-elevated': '#f8f9fa',
	'--hub-sys-text-primary': '#212529'
};

/** One compiled rule: the selector it matched on and the declarations it carries. */
interface Rule {
	selector: string;
	body: string;
}

function rules(path: string): Rule[] {
	const css = compile(path).css.replace(/\/\*[\s\S]*?\*\//g, '');
	const out: Rule[] = [];
	for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		out.push({ selector: match[1].replace(/\s+/g, ' ').trim(), body: match[2] });
	}
	return out;
}

const STRIP = rules('projects/panels/src/lib/components/panels/panels.variables.scss');
const PANEL = rules('projects/panels/src/lib/components/panel/panel.component.scss');

/**
 * Every custom property declared by the rules carrying all the given markers, in source
 * order. Rules pinned to one named variant are skipped: they hand the built-in nine straight
 * to the design system's own tokens, and what is under test here is the open derivation a
 * consumer's custom accent goes through.
 */
function tokensOf(sheet: Rule[], ...markers: string[]): Record<string, string> {
	const table: Record<string, string> = { ...THEME };
	for (const rule of sheet) {
		if (!markers.every((marker) => rule.selector.includes(marker)) || /\[data-variant[=~|^$*]/.test(rule.selector)) {
			continue;
		}
		for (const match of rule.body.matchAll(/(--[\w-]+):([^;}]+)/g)) {
			table[match[1]] = match[2].replace(/\s+/g, ' ').trim();
		}
	}
	return table;
}

/** The value a plain property ends up with, among the rules carrying all the given markers. */
function declared(sheet: Rule[], property: string, ...markers: string[]): string {
	let winner: string | null = null;
	for (const rule of sheet) {
		if (!markers.every((marker) => rule.selector.includes(marker))) {
			continue;
		}
		const match = new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`).exec(rule.body);
		if (match) {
			winner = match[1].replace(/\s+/g, ' ').trim();
		}
	}
	expect(winner, `${property} is declared by no rule matching ${markers.join(' + ')}`).not.toBeNull();
	return winner!;
}

/** Splits a function's arguments on top-level commas. */
function args(inner: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let current = '';
	for (const char of inner) {
		if (char === '(') depth++;
		if (char === ')') depth--;
		if (char === ',' && depth === 0) {
			out.push(current.trim());
			current = '';
			continue;
		}
		current += char;
	}
	out.push(current.trim());
	return out;
}

/** Splits a relative-colour body on top-level whitespace: `from`, the source, then L C H. */
function parts(inner: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let current = '';
	for (const char of inner) {
		if (char === '(') depth++;
		if (char === ')') depth--;
		if (/\s/.test(char) && depth === 0) {
			if (current) out.push(current);
			current = '';
			continue;
		}
		current += char;
	}
	if (current) out.push(current);
	return out;
}

/** The contents of `name(...)` when `value` is exactly that call, and not a call inside a larger one. */
function call(value: string, name: string): string | null {
	if (!value.toLowerCase().startsWith(`${name}(`) || !value.endsWith(')')) {
		return null;
	}
	const inner = value.slice(name.length + 1, -1);
	let depth = 0;
	for (const char of inner) {
		if (char === '(') depth++;
		if (char === ')') depth--;
		if (depth < 0) return null;
	}
	return inner.trim();
}

/** The source colour's own channels, which `l` / `c` / `h` stand for inside a relative colour. */
type Channels = { l: number; c: number; h: number };

/** Evaluates a CSS numeric expression — `clamp()`, `min()`, `max()`, `var()` and the channel keywords. */
function resolveNumber(value: string, vars: Record<string, string>, channels: Channels): number {
	const trimmed = value.trim();

	if (trimmed === 'l' || trimmed === 'c' || trimmed === 'h') {
		return channels[trimmed];
	}

	for (const [name, pick] of [
		['min', Math.min],
		['max', Math.max]
	] as const) {
		const inner = call(trimmed, name);
		if (inner !== null) {
			return pick(...args(inner).map((part) => resolveNumber(part, vars, channels)));
		}
	}

	const clamped = call(trimmed, 'clamp');
	if (clamped !== null) {
		const [low, mid, high] = args(clamped).map((part) => resolveNumber(part, vars, channels));
		// CSS resolves clamp() as max(low, min(mid, high)), so an inverted window yields `low`.
		return Math.max(low, Math.min(mid, high));
	}

	const variable = call(trimmed, 'var');
	if (variable !== null) {
		const [name, ...fallback] = args(variable);
		return resolveNumber(vars[name] ?? fallback.join(', '), vars, channels);
	}

	return Number(trimmed);
}

function clampChannels(rgb: HubRgb): HubRgb {
	const fit = (channel: number) => Math.min(255, Math.max(0, channel));
	return { r: fit(rgb.r), g: fit(rgb.g), b: fit(rgb.b), a: rgb.a };
}

/**
 * Resolves a colour-valued declaration down to sRGB, following `var()`, the relative
 * `oklch(from …)` syntax and `color-mix(in oklch, …)`.
 *
 * `color-mix()` interpolates in OKLCh along the shorter hue arc, and a colour with no chroma
 * has no hue to contribute — which is the case for every surface these mixes are made with.
 */
function resolveColor(value: string, vars: Record<string, string>): HubRgb {
	const trimmed = value.trim();

	const variable = call(trimmed, 'var');
	if (variable !== null) {
		const [name, ...fallback] = args(variable);
		return resolveColor(vars[name] ?? fallback.join(', '), vars);
	}

	const relative = call(trimmed, 'oklch');
	if (relative?.startsWith('from')) {
		const [, source, lightness, chroma, hue] = parts(relative);
		const base = rgbToOklch(resolveColor(source, vars));
		const channels: Channels = { l: base.l, c: base.c, h: base.h };
		return clampChannels(
			oklchToRgb({
				l: resolveNumber(lightness, vars, channels),
				c: resolveNumber(chroma, vars, channels),
				h: resolveNumber(hue, vars, channels),
				a: 1
			})
		);
	}

	const mix = call(trimmed, 'color-mix');
	if (mix !== null) {
		const [space, first, second] = args(mix);
		expect(space.trim()).toBe('in oklch');
		const [firstColor, firstShare] = parts(first);
		const share = Number.parseFloat(firstShare) / 100;
		const a = rgbToOklch(resolveColor(firstColor, vars));
		const b = rgbToOklch(resolveColor(parts(second)[0], vars));
		let delta = b.h - a.h;
		if (delta > 180) delta -= 360;
		if (delta < -180) delta += 360;
		const hue = a.c < 1e-6 ? b.h : b.c < 1e-6 ? a.h : a.h + delta * (1 - share);
		return clampChannels(
			oklchToRgb({ l: a.l * share + b.l * (1 - share), c: a.c * share + b.c * (1 - share), h: hue, a: 1 })
		);
	}

	const parsed = toRgb(trimmed);
	expect(parsed, `${trimmed} is not a colour this resolver understands`).not.toBeNull();
	return parsed!;
}

/** The colour a value resolves to, as a hex string. */
function paint(vars: Record<string, string>, value: string): string {
	return toHex(resolveColor(value, vars))!;
}

/** The colour a faded foreground is actually seen as, once composited over what it sits on. */
function faded(vars: Record<string, string>, value: string, opacity: string, background: string): string {
	const rgb = resolveColor(value, vars);
	return toHex(
		compositeOver({ ...rgb, a: resolveNumber(opacity, vars, { l: 0, c: 0, h: 0 }) }, resolveColor(background, vars))
	)!;
}

describe('panels text contrast', () => {
	describe('navigation strip', () => {
		const vars = (accent: string) => ({ ...tokensOf(STRIP, '.hub-panels'), '--hub-panels-accent': ACCENTS[accent] });

		it.each(Object.keys(ACCENTS))('keeps the hovered %s tab label readable on the hover surface', (accent) => {
			const table = vars(accent);

			expect(
				contrastRatio(
					paint(table, 'var(--hub-panels-tab-color-hover)'),
					paint(table, 'var(--hub-panels-tab-bg-hover)')
				)!
			).toBeGreaterThanOrEqual(MIN_CONTRAST);
		});

		it('keeps the removable tab ✕ readable while its tab is at rest', () => {
			const table = vars('primary');
			const opacity = declared(STRIP, '--hub-panels-remove-btn-opacity', '.hub-panels');

			expect(
				contrastRatio(
					faded(table, 'var(--hub-panels-tab-color)', opacity, 'var(--hub-panels-content-bg)'),
					paint(table, 'var(--hub-panels-content-bg)')
				)!
			).toBeGreaterThanOrEqual(MIN_CONTRAST);
		});

		it('keeps the removable tab ✕ readable on the active tab', () => {
			const table = vars('primary');
			const opacity = declared(STRIP, '--hub-panels-remove-btn-opacity', '.hub-panels');

			expect(
				contrastRatio(
					faded(table, 'var(--hub-panels-tab-color-active)', opacity, 'var(--hub-panels-tab-bg-active)'),
					paint(table, 'var(--hub-panels-tab-bg-active)')
				)!
			).toBeGreaterThanOrEqual(MIN_CONTRAST);
		});
	});

	/**
	 * The open path — the derivation a consumer's own accent goes through. The nine built-in
	 * variants are served by the design system's `-emphasis` token instead, and the contract
	 * this library publishes is that a custom variant renders exactly like a built-in.
	 */
	describe('card and alert built on a custom accent', () => {
		it.each(Object.keys(ACCENTS))('keeps the %s card band label readable on the band', (accent) => {
			const table = {
				...tokensOf(PANEL, '.hub-panels__panel-header'),
				'--hub-panels-card-accent': ACCENTS[accent]
			};
			const band = declared(PANEL, 'background', '.hub-panels__panel--card', '.hub-panels__panel-header');

			expect(
				contrastRatio(paint(table, 'var(--hub-panels-panel-header-color)'), paint(table, band))!
			).toBeGreaterThanOrEqual(MIN_CONTRAST);
		});

		it.each(Object.keys(ACCENTS))('keeps the %s card band label readable on the neutral band', (accent) => {
			const table = {
				...tokensOf(PANEL, '.hub-panels__panel-header'),
				'--hub-panels-card-accent': ACCENTS[accent]
			};

			// The band rule is zero-specificity, so `.hub-panels__panel-header`'s own background
			// wins and the band is painted with the neutral elevated surface, not the variant tint.
			expect(contrastRatio(paint(table, 'var(--hub-panels-panel-header-color)'), '#f8f9fa')!).toBeGreaterThanOrEqual(
				MIN_CONTRAST
			);
		});

		it.each(Object.keys(ACCENTS))('keeps the %s card body text readable on its tint', (accent) => {
			const table = { ...tokensOf(PANEL, '.hub-panels__panel--card'), '--hub-panels-card-accent': ACCENTS[accent] };

			expect(
				contrastRatio(paint(table, 'var(--hub-panels-card-color)'), paint(table, 'var(--hub-panels-card-bg)'))!
			).toBeGreaterThanOrEqual(MIN_CONTRAST);
		});

		it.each(Object.keys(ACCENTS))('keeps the %s alert text readable on its tint', (accent) => {
			const table = { ...tokensOf(PANEL, '.hub-panels__panel--alert'), '--hub-panels-alert-accent': ACCENTS[accent] };

			expect(
				contrastRatio(paint(table, 'var(--hub-panels-alert-color)'), paint(table, 'var(--hub-panels-alert-bg)'))!
			).toBeGreaterThanOrEqual(MIN_CONTRAST);
		});
	});
});
