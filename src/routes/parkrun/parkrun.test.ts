import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import Parkrun from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('Parkrun page', () => {
	// ── Rendering ─────────────────────────────────────────────────────────────

	it('renders the heading', () => {
		render(Parkrun);
		expect(screen.getByRole('heading', { level: 1, name: 'Parkrun Predictor' })).toBeInTheDocument();
	});

	it('renders the back-to-home link', () => {
		render(Parkrun);
		expect(screen.getByRole('link', { name: /all tools/i })).toHaveAttribute('href', '/');
	});

	it('inactiveTab_usesExplicitHoverToken_notIncidentalInkFlip', () => {
		render(Parkrun);
		const averagePaceTab = screen.getByRole('tab', { name: 'Average Pace' });
		expect(averagePaceTab.className).toContain('hover:text-hover');
		expect(averagePaceTab.className).not.toContain('hover:text-ink');
	});

	it('page title contains Parkrun Predictor (AC1)', () => {
		render(Parkrun);
		expect(document.title).toContain('Parkrun Predictor');
	});

	// ── Input mode toggle (AC2) ───────────────────────────────────────────────

	it('renders Recent Run and Average Pace tabs (AC2)', () => {
		render(Parkrun);
		expect(screen.getByRole('tab', { name: 'Recent Run' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Average Pace' })).toBeInTheDocument();
	});

	it('defaults to Recent Run mode showing distance and time inputs', () => {
		render(Parkrun);
		expect(screen.getByLabelText(/^distance/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
	});

	it('switching to Average Pace mode shows pace input (AC2)', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Average Pace' }));
		expect(screen.getByLabelText(/pace/i)).toBeInTheDocument();
		expect(screen.queryByLabelText(/^distance/i)).not.toBeInTheDocument();
	});

	it('modeTabs_haveCompleteFocusVisibleClasses', () => {
		render(Parkrun);
		for (const tab of [
			screen.getByRole('tab', { name: 'Recent Run' }),
			screen.getByRole('tab', { name: 'Average Pace' })
		]) {
			expect(tab.className).toContain('focus-visible:outline-none');
			expect(tab.className).toContain('focus-visible:ring-2');
			expect(tab.className).toContain('focus-visible:ring-accent');
			expect(tab.className).toContain('focus-visible:ring-offset-2');
		}
	});

	// ── Reference distance selector (AC3) ─────────────────────────────────────

	it('renders the reference distance slider (AC3)', () => {
		render(Parkrun);
		expect(screen.getByLabelText('Reference distance')).toBeInTheDocument();
	});

	it('referenceDistanceSlider_hasCompleteFocusVisibleClasses', () => {
		render(Parkrun);
		const slider = screen.getByLabelText('Reference distance');
		expect(slider.className).toContain('focus-visible:outline-none');
		expect(slider.className).toContain('focus-visible:ring-2');
		expect(slider.className).toContain('focus-visible:ring-accent');
		expect(slider.className).toContain('focus-visible:ring-offset-2');
	});

	it('10K is selected by default', () => {
		render(Parkrun);
		expect(screen.getByLabelText('Reference distance')).toHaveAttribute('aria-valuetext', '10K');
	});

	it('moving the slider to Marathon updates aria-valuetext', async () => {
		render(Parkrun);
		const slider = screen.getByLabelText('Reference distance');
		await fireEvent.input(slider, { target: { value: '5' } });
		expect(slider).toHaveAttribute('aria-valuetext', 'Marathon');
	});

	// ── Empty state (AC13) ────────────────────────────────────────────────────

	it('shows empty state when no input entered (AC13)', () => {
		render(Parkrun);
		expect(screen.getByText(/enter a distance and time above/i)).toBeInTheDocument();
	});

	it('does not show results in empty state', () => {
		render(Parkrun);
		expect(screen.queryByText('Predicted Parkrun Time')).not.toBeInTheDocument();
	});

	// ── Prediction display (AC4, AC5, AC6) ────────────────────────────────────

	it('entering 8K / 48:00 with Marathon reference shows predicted time and pace (AC4, AC5, AC6)', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });
		await fireEvent.input(screen.getByLabelText('Reference distance'), { target: { value: '5' } });

		expect(screen.getByText('Predicted Parkrun Time')).toBeInTheDocument();
		expect(screen.getByText(/\/km/)).toBeInTheDocument();
		expect(screen.getByText(/\/mile/)).toBeInTheDocument();
	});

	it('Average Pace mode produces a prediction from pace alone', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Average Pace' }));
		await fireEvent.input(screen.getByLabelText(/pace/i), { target: { value: '6:00' } });

		expect(screen.getByText('Predicted Parkrun Time')).toBeInTheDocument();
	});

	// ── Split table (AC7) ─────────────────────────────────────────────────────

	it('split table displays 5 rows (AC7)', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });

		const table = screen.getByRole('table');
		const rows = table.querySelectorAll('tbody tr');
		expect(rows).toHaveLength(5);
	});

	// ── PB comparison (AC8) ───────────────────────────────────────────────────

	it('does not show PB comparison when PB is blank', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });

		expect(screen.queryByText(/than your pb/i)).not.toBeInTheDocument();
	});

	it('shows PB comparison when PB entered (AC8)', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });
		await fireEvent.input(screen.getByLabelText(/pb/i), { target: { value: '24:30' } });

		expect(screen.getByText(/than your pb/i)).toBeInTheDocument();
	});

	// ── Age grade (AC9, AC10) ─────────────────────────────────────────────────

	it('does not show age grade when age/gender blank', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });

		expect(screen.queryByText(/age grade/i)).not.toBeInTheDocument();
	});

	it('shows age grade when age and gender provided (AC9, AC10)', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });
		await fireEvent.input(screen.getByLabelText(/age/i), { target: { value: 35, valueAsNumber: 35 } });
		await fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: 'male' } });

		expect(screen.getByText(/age grade/i)).toBeInTheDocument();
		expect(screen.getByText(/%/)).toBeInTheDocument();
	});

	// ── Optional fields (AC12) ────────────────────────────────────────────────

	it('optional PB, age, gender fields can be left blank (AC12)', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });

		expect(screen.getByText('Predicted Parkrun Time')).toBeInTheDocument();
	});

	// ── Cross-links ────────────────────────────────────────────────────────────

	it('shows cross-links to Race Predictor, Training Paces, VO2 Max', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });

		expect(screen.getByRole('link', { name: /race time predictor/i })).toHaveAttribute(
			'href',
			'/race-predictor'
		);
		expect(screen.getByRole('link', { name: /training pace calculator/i })).toHaveAttribute(
			'href',
			'/training-paces'
		);
		expect(screen.getByRole('link', { name: /vo2 max estimator/i })).toHaveAttribute(
			'href',
			'/vo2max'
		);
	});

	// ── Reactive updates, no submit button ────────────────────────────────────

	it('results update reactively, no submit button', () => {
		render(Parkrun);
		expect(screen.queryByRole('button', { name: /calculate|submit/i })).toBeNull();
	});

	// ── Target Time tab (Task 1) ─────────────────────────────────────────────

	it('renders a Target Time tab after Average Pace', () => {
		render(Parkrun);
		expect(screen.getByRole('tab', { name: 'Target Time' })).toBeInTheDocument();
	});

	it('targetTimeTab_hasCompleteFocusVisibleClasses', () => {
		render(Parkrun);
		const tab = screen.getByRole('tab', { name: 'Target Time' });
		expect(tab.className).toContain('focus-visible:outline-none');
		expect(tab.className).toContain('focus-visible:ring-2');
		expect(tab.className).toContain('focus-visible:ring-accent');
		expect(tab.className).toContain('focus-visible:ring-offset-2');
	});

	it('switching to Target Time mode shows a target time input and hides distance/pace/reference-distance/PB', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		expect(screen.getByLabelText(/target time/i)).toBeInTheDocument();
		expect(screen.queryByLabelText(/^distance/i)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/^pace/i)).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Reference distance')).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/^pb/i)).not.toBeInTheDocument();
	});

	it('arrow-key navigation cycles across all 3 tabs, wrapping both directions', async () => {
		render(Parkrun);
		const tablist = screen.getByRole('tablist');

		await fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
		expect(screen.getByRole('tab', { name: 'Target Time' })).toHaveAttribute('aria-selected', 'true');

		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'Recent Run' })).toHaveAttribute('aria-selected', 'true');

		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'Average Pace' })).toHaveAttribute('aria-selected', 'true');

		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'Target Time' })).toHaveAttribute('aria-selected', 'true');
	});

	it('shows target-time-specific empty state', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		expect(screen.getByText(/enter a target time above/i)).toBeInTheDocument();
	});

	it('Age and Gender fields remain visible in Target Time mode', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
	});

	it('switching away from and back to Target Time resets its input', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });
		await fireEvent.click(screen.getByRole('tab', { name: 'Recent Run' }));
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		expect(screen.getByLabelText(/target time/i)).toHaveValue('');
	});

	// ── Target Time calculation (Task 2) ──────────────────────────────────────

	it('entering 28:00 target time shows required pace of 5:36 /km', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });

		expect(screen.getByText('Required Pace')).toBeInTheDocument();
		expect(screen.getByText('5:36 /km')).toBeInTheDocument();
	});

	it('entering a non-whole-minute target time (24:37) shows correctly rounded pace of 4:55 /km', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '24:37' } });

		expect(screen.getByText('Required Pace')).toBeInTheDocument();
		expect(screen.getByText('4:55 /km')).toBeInTheDocument();
	});

	it('split table appears for Target Time mode with 5 rows', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });

		const table = screen.getByRole('table');
		const rows = table.querySelectorAll('tbody tr');
		expect(rows).toHaveLength(5);
	});

	it('shows age grade in Target Time mode when age and gender supplied', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });
		await fireEvent.input(screen.getByLabelText(/age/i), { target: { value: 35, valueAsNumber: 35 } });
		await fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: 'male' } });

		expect(screen.getByText(/age grade/i)).toBeInTheDocument();
		expect(screen.getByText(/%/)).toBeInTheDocument();
	});

	it('shows inline error for invalid target time input', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		const input = screen.getByLabelText(/target time/i);
		await fireEvent.input(input, { target: { value: 'abc' } });
		await fireEvent.blur(input);

		expect(screen.getAllByText(/enter mm:ss or h:mm:ss/i).length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText(/enter a target time above/i)).toBeInTheDocument();
	});

	it('empty target time input shows no result', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		expect(screen.queryByText('Required Pace')).not.toBeInTheDocument();
	});

	it('never shows PB comparison in Target Time mode', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^pb/i), { target: { value: '24:30' } });
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });

		expect(screen.queryByText(/than your pb/i)).not.toBeInTheDocument();
	});

	// ── Target Time result layout (Task 3) ────────────────────────────────────

	it('shows target time and pace/mile as secondary text', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });

		expect(screen.getByText(/target: 28:00/i)).toBeInTheDocument();
		expect(screen.getByText(/\/mile/)).toBeInTheDocument();
	});

	it('shows a nudge link to the Training Pace Calculator near the result', async () => {
		render(Parkrun);
		await fireEvent.click(screen.getByRole('tab', { name: 'Target Time' }));
		await fireEvent.input(screen.getByLabelText(/target time/i), { target: { value: '28:00' } });

		const links = screen.getAllByRole('link', { name: /training pace calculator/i });
		expect(links.length).toBeGreaterThanOrEqual(2);
		expect(links.some((l) => l.getAttribute('href') === '/training-paces')).toBe(true);
	});

	it('Recent Run result layout is unchanged (time headline)', async () => {
		render(Parkrun);
		await fireEvent.input(screen.getByLabelText(/^distance/i), { target: { value: '8' } });
		await fireEvent.input(screen.getByLabelText(/time/i), { target: { value: '48:00' } });

		expect(screen.getByText('Predicted Parkrun Time')).toBeInTheDocument();
		expect(screen.queryByText('Required Pace')).not.toBeInTheDocument();
	});
});
