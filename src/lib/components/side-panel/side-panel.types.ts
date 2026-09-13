/**
 * How a {@link HubSidePanelComponent} shares the space of its container.
 *
 * - `'side'` docks the panel beside the content, and the content narrows to make room for it.
 * - `'over'` floats the panel over the content edge. There is no backdrop, no scroll lock and no
 *   focus trap, so the part of the page the panel does not cover stays usable.
 */
export type HubSidePanelMode = 'side' | 'over';

/**
 * Which inline edge of the container the {@link HubSidePanelComponent} sits on. The values are
 * logical: `'end'` is the right edge in a left-to-right document and the left edge under `dir="rtl"`.
 */
export type HubSidePanelPosition = 'start' | 'end';

/**
 * Landmark role of the {@link HubSidePanelComponent}. `'complementary'` suits a panel placed beside
 * the page's `<main>`; `'region'` suits one nested inside it, where a complementary landmark would
 * be misplaced.
 */
export type HubSidePanelRole = 'complementary' | 'region';
