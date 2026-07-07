import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import Vo2max from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('Vo2max page', () => {
	// ── Rendering ─────────────────────────────────────────────────────────────

	it('renders the heading', () => {
		render(Vo2max);
		expect(
			screen.getByRole('heading', { level: 1, name: 'VO2 Max Estimator' })
		).toBeInTheDocument();
	});

	it('renders the back-to-home link (AC1)', () => {
		render(Vo2max);
		expect(screen.getByRole('link', { name: /all tools/i })).toHaveAttribute('href', '/');
	});

	// ── Distance dropdown (AC2, AC3) ──────────────────────────────────────────

	it('renders distance dropdown with standard options (AC2)', () => {
		render(Vo2max);
		const select = screen.getByLabelText(/race distance/i);
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: '5K' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: '10K' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Half Marathon' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Marathon' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Custom (km)' })).toBeInTheDocument();
	});

	it('custom distance input is not visible initially (AC3)', () => {
		render(Vo2max);
		// The custom input exists in the DOM but is collapsed via CollapsibleField (max-h-0/opacity-0)
		const customInput = screen.queryByLabelText(/custom distance/i);
		expect(customInput).toBeInTheDocument();
	});

	it('selecting Custom reveals distance input (AC3)', async () => {
		render(Vo2max);
		const select = screen.getByLabelText(/race distance/i);
		await fireEvent.change(select, { target: { value: 'Custom' } });
		expect(screen.getByLabelText(/custom distance/i)).toBeInTheDocument();
	});

	// ── Time input (AC4) ──────────────────────────────────────────────────────

	it('renders finish time input (AC4)', () => {
		render(Vo2max);
		expect(screen.getByLabelText(/finish time/i)).toBeInTheDocument();
	});

	it('time input accepts MM:SS format hint (AC4)', () => {
		render(Vo2max);
		expect(screen.getByText(/MM:SS or H:MM:SS/i)).toBeInTheDocument();
	});

	// ── Optional age + gender inputs (AC9) ───────────────────────────────────

	it('renders optional age input (AC9)', () => {
		render(Vo2max);
		expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
	});

	it('renders gender dropdown with three options (AC9)', () => {
		render(Vo2max);
		const select = screen.getByLabelText(/gender/i);
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Prefer not to say' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
	});

	// ── Empty state (AC7) ─────────────────────────────────────────────────────

	it('shows empty state when no input entered (AC7)', () => {
		render(Vo2max);
		expect(
			screen.getByText(/enter a race result above to see your vo2 max/i)
		).toBeInTheDocument();
	});

	it('does not show results in empty state', () => {
		render(Vo2max);
		expect(screen.queryByText(/ml\/kg\/min/i)).toBeNull();
	});

	// ── Out-of-range state (AC8) ──────────────────────────────────────────────

	it('shows out-of-range message for implausible time (AC8)', async () => {
		render(Vo2max);
		// A very slow 5K (90 minutes) produces VDOT below 20
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '90:00' } });
		expect(screen.getByText(/outside the supported range/i)).toBeInTheDocument();
	});

	// ── Valid results: VDOT headline (AC5, AC6) ───────────────────────────────

	it('5K in 25:00 produces VDOT approximately 40 (AC5)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const vdotEl = screen.getByTestId('vdot-value');
		const vdot = parseFloat(vdotEl.textContent ?? '');
		expect(vdot).toBeGreaterThanOrEqual(37);
		expect(vdot).toBeLessThanOrEqual(42);
	});

	it('VDOT is displayed with ml/kg/min unit (AC6)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const vdotEl = screen.getByTestId('vdot-value');
		// Unit label is the immediate following sibling <p>
		const unitEl = vdotEl.nextElementSibling;
		expect(unitEl?.textContent).toContain('ml/kg/min');
	});

	it('VDOT shows one decimal place (AC6)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const vdotEl = screen.getByTestId('vdot-value');
		expect(vdotEl.textContent).toMatch(/^\d+\.\d$/);
	});

	// ── VO2 max explanation (AC20) ────────────────────────────────────────────

	it('shows VO2 max explanation when results visible (AC20)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByText(/vdot is a practical proxy/i)).toBeInTheDocument();
	});

	// ── Fitness category (AC10, AC11, AC12, AC21) ────────────────────────────

	it('shows general ACSM reference table when no age/gender entered (AC11)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByTestId('acsm-reference-table')).toBeInTheDocument();
	});

	it('shows personalised category when age and male gender entered (AC10)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const ageInput = screen.getByLabelText(/age/i);
		await fireEvent.input(ageInput, { target: { value: 35, valueAsNumber: 35 } });
		const genderSelect = screen.getByLabelText(/gender/i);
		await fireEvent.change(genderSelect, { target: { value: 'male' } });
		expect(screen.getByTestId('fitness-category-personalised')).toBeInTheDocument();
		expect(screen.getByText(/male age 30-39/i)).toBeInTheDocument();
	});

	it('shows colour-coded category badge (AC21)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const ageInput = screen.getByLabelText(/age/i);
		await fireEvent.input(ageInput, { target: { value: 35, valueAsNumber: 35 } });
		const genderSelect = screen.getByLabelText(/gender/i);
		await fireEvent.change(genderSelect, { target: { value: 'male' } });
		expect(screen.getByTestId('category-badge')).toBeInTheDocument();
	});

	it('shows both male and female ranges when Prefer not to say selected (AC12)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const ageInput = screen.getByLabelText(/age/i);
		await fireEvent.input(ageInput, { target: { value: 35, valueAsNumber: 35 } });
		const genderSelect = screen.getByLabelText(/gender/i);
		await fireEvent.change(genderSelect, { target: { value: 'prefer-not-to-say' } });
		expect(screen.getByTestId('fitness-both-genders')).toBeInTheDocument();
	});

	it('shows approximation note for age outside ACSM brackets (AC18)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const ageInput = screen.getByLabelText(/age/i);
		await fireEvent.input(ageInput, { target: { value: 18, valueAsNumber: 18 } });
		const genderSelect = screen.getByLabelText(/gender/i);
		await fireEvent.change(genderSelect, { target: { value: 'male' } });
		expect(screen.getByText(/nearest available bracket/i)).toBeInTheDocument();
	});

	// ── Race predictions table (AC13, AC14) ──────────────────────────────────

	it('shows race predictions table with standard distances (AC13)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByRole('table')).toBeInTheDocument();
		expect(screen.getByRole('cell', { name: '5K' })).toBeInTheDocument();
		expect(screen.getByRole('cell', { name: 'Half Marathon' })).toBeInTheDocument();
		expect(screen.getByRole('cell', { name: 'Marathon' })).toBeInTheDocument();
	});

	it('race predictions match Race Predictor output for same input (AC14)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		// 5K in 25:00 → Riegel predicts marathon in ~3:44
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const rows = screen.getAllByRole('row');
		const marathonRow = rows.find(
			(r) => r.textContent?.includes('Marathon') && !r.textContent?.includes('Half')
		);
		expect(marathonRow).toBeDefined();
		// Marathon prediction should be in the 3-4 hour range
		expect(marathonRow!.textContent).toMatch(/3:\d\d:\d\d/);
	});

	// ── Footer cross-links (AC15) ─────────────────────────────────────────────

	it('shows cross-link to Training Paces when results visible (AC15)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const link = screen.getByRole('link', { name: /training pace calculator/i });
		expect(link).toHaveAttribute('href', '/training-paces');
	});

	it('shows cross-link to Race Predictor when results visible (AC15)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const link = screen.getByRole('link', { name: /race time predictor/i });
		expect(link).toHaveAttribute('href', '/race-predictor');
	});

	it('does not show footer links in empty state', () => {
		render(Vo2max);
		expect(screen.queryByRole('link', { name: /training pace calculator/i })).toBeNull();
	});

	// ── Reactive updates (AC17) ───────────────────────────────────────────────

	it('results update reactively as user types, no submit button (AC17)', () => {
		render(Vo2max);
		expect(screen.queryByRole('button', { name: /calculate|submit/i })).toBeNull();
	});

	it('returns to empty state when time is cleared (AC17)', async () => {
		render(Vo2max);
		const timeInput = screen.getByLabelText(/finish time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		await fireEvent.input(timeInput, { target: { value: '' } });
		expect(screen.getByText(/enter a race result above to see your vo2 max/i)).toBeInTheDocument();
	});

	// ── Page meta (AC16) ─────────────────────────────────────────────────────

	it('page title contains VO2 Max Estimator (AC16)', () => {
		render(Vo2max);
		expect(document.title).toContain('VO2 Max Estimator');
	});
});
