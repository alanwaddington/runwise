import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import HrZones from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('HrZones page', () => {
	// ── Rendering ────────────────────────────────────────────────────────────

	it('renders the heading', () => {
		render(HrZones);
		expect(
			screen.getByRole('heading', { level: 1, name: 'Heart Rate Zone Calculator' })
		).toBeInTheDocument();
	});

	it('renders the back-to-home link', () => {
		render(HrZones);
		expect(screen.getByRole('link', { name: /all tools/i })).toHaveAttribute('href', '/');
	});

	// ── Method selector ──────────────────────────────────────────────────────

	it('renders Max HR and LTHR tabs', () => {
		render(HrZones);
		expect(screen.getByRole('tab', { name: 'Max HR' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'LTHR' })).toBeInTheDocument();
	});

	it('Max HR tab is selected by default', () => {
		render(HrZones);
		expect(screen.getByRole('tab', { name: 'Max HR' })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('tab', { name: 'LTHR' })).toHaveAttribute('aria-selected', 'false');
	});

	it('clicking LTHR tab selects it', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		expect(screen.getByRole('tab', { name: 'LTHR' })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('tab', { name: 'Max HR' })).toHaveAttribute('aria-selected', 'false');
	});

	it('info button is present', () => {
		render(HrZones);
		expect(screen.getByRole('button', { name: /about these methods/i })).toBeInTheDocument();
	});

	// ── Inputs ───────────────────────────────────────────────────────────────

	it('shows Max heart rate input in Max HR mode', () => {
		render(HrZones);
		expect(screen.getByLabelText(/max heart rate/i)).toBeInTheDocument();
	});

	it('shows age input in Max HR mode', () => {
		render(HrZones);
		expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
	});

	it('switches input label to LTHR when LTHR tab is selected', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		expect(screen.getByLabelText(/lactate threshold heart rate/i)).toBeInTheDocument();
	});

	it('hides age input when LTHR mode is selected (AC6)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		expect(screen.queryByLabelText(/age/i)).toBeNull();
	});

	// ── Age estimate helper ───────────────────────────────────────────────────

	it('does not show estimated max HR when age is not entered', () => {
		render(HrZones);
		expect(screen.queryByText(/estimated max hr/i)).toBeNull();
	});

	it('shows estimated max HR when age 40 is entered (AC5)', async () => {
		render(HrZones);
		const ageInput = screen.getByLabelText(/age/i);
		await fireEvent.input(ageInput, { target: { value: 40, valueAsNumber: 40 } });
		expect(screen.getByText(/estimated max hr: 180 bpm/i)).toBeInTheDocument();
	});

	it('shows formula limitation caveat when age is entered', async () => {
		render(HrZones);
		const ageInput = screen.getByLabelText(/age/i);
		await fireEvent.input(ageInput, { target: { value: 40, valueAsNumber: 40 } });
		expect(screen.getByText(/age-based formulas vary significantly/i)).toBeInTheDocument();
	});

	// ── Empty state ───────────────────────────────────────────────────────────

	it('shows empty state when no BPM entered (AC8)', () => {
		render(HrZones);
		expect(
			screen.getByText(/enter your heart rate above to see your training zones/i)
		).toBeInTheDocument();
	});

	it('does not show zone table in empty state', () => {
		render(HrZones);
		expect(screen.queryByRole('table')).toBeNull();
	});

	// ── Max HR results ────────────────────────────────────────────────────────

	it('shows zone table when valid Max HR is entered (AC7)', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		expect(screen.getByRole('table')).toBeInTheDocument();
	});

	it('hides empty state when Max HR produces results', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		expect(
			screen.queryByText(/enter your heart rate above to see your training zones/i)
		).toBeNull();
	});

	it('table has Zone, BPM range column headers (AC11)', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		expect(screen.getByRole('columnheader', { name: /zone/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /bpm range/i })).toBeInTheDocument();
	});

	it('Max HR 185 produces correct Z1 range 93-111 (AC2)', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		expect(screen.getByText('93-111')).toBeInTheDocument();
	});

	it('Max HR 185 produces correct Z5 range 167-185 (AC2)', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		expect(screen.getByText('167-185')).toBeInTheDocument();
	});

	it('shows 5 zone rows in Max HR results', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		// 1 header row + 5 main rows + 5 description rows = 11
		expect(screen.getAllByRole('row')).toHaveLength(11);
	});

	it('returns to empty state when Max HR is cleared', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		await fireEvent.input(bpmInput, { target: { value: '', valueAsNumber: NaN } });
		expect(screen.queryByRole('table')).toBeNull();
		expect(
			screen.getByText(/enter your heart rate above to see your training zones/i)
		).toBeInTheDocument();
	});

	// ── LTHR results ──────────────────────────────────────────────────────────

	it('shows zone table when valid LTHR is entered', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		expect(screen.getByRole('table')).toBeInTheDocument();
	});

	it('LTHR 170 produces Z1 as < 145 (AC3)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		expect(screen.getByText('< 145')).toBeInTheDocument();
	});

	it('LTHR 170 produces Z5 as 170-180 (AC3)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		expect(screen.getByText('170-180')).toBeInTheDocument();
	});

	// ── Zone 5 expand (LTHR) ─────────────────────────────────────────────────

	it('Zone 5 in LTHR mode has Show sub-zones button (AC4)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		expect(screen.getByRole('button', { name: /show sub-zones/i })).toBeInTheDocument();
	});

	it('sub-zones are hidden before expansion (AC4)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		expect(screen.queryByText('5a')).toBeNull();
		expect(screen.queryByText('5b')).toBeNull();
		expect(screen.queryByText('5c')).toBeNull();
	});

	it('expanding Zone 5 shows 5a, 5b, 5c sub-zones (AC4)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		await fireEvent.click(screen.getByRole('button', { name: /show sub-zones/i }));
		expect(screen.getByText('5a')).toBeInTheDocument();
		expect(screen.getByText('5b')).toBeInTheDocument();
		expect(screen.getByText('5c')).toBeInTheDocument();
	});

	it('Zone 5 LTHR 170 sub-zones: 5a is 170-173, 5b is 175-180, 5c is > 180 (AC4)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		await fireEvent.click(screen.getByRole('button', { name: /show sub-zones/i }));
		expect(screen.getByText('170-173')).toBeInTheDocument();
		expect(screen.getByText('175-180')).toBeInTheDocument();
		expect(screen.getByText('> 180')).toBeInTheDocument();
	});

	it('collapsing Zone 5 hides sub-zones', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'LTHR' }));
		const bpmInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 170, valueAsNumber: 170 } });
		await fireEvent.click(screen.getByRole('button', { name: /show sub-zones/i }));
		await fireEvent.click(screen.getByRole('button', { name: /hide sub-zones/i }));
		expect(screen.queryByText('5a')).toBeNull();
	});

	it('Zone 5 expand button does not appear in Max HR mode', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		expect(screen.queryByRole('button', { name: /show sub-zones/i })).toBeNull();
	});

	// ── Footer cross-link ─────────────────────────────────────────────────────

	it('shows Training Pace Calculator link when results are visible (AC13)', async () => {
		render(HrZones);
		const bpmInput = screen.getByLabelText(/max heart rate/i);
		await fireEvent.input(bpmInput, { target: { value: 185, valueAsNumber: 185 } });
		const link = screen.getByRole('link', { name: /training pace calculator/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/training-paces');
	});

	it('does not show Training Pace Calculator link in empty state (AC13)', () => {
		render(HrZones);
		expect(screen.queryByRole('link', { name: /training pace calculator/i })).toBeNull();
	});

	// ── Method info tooltip ───────────────────────────────────────────────────

	it('info button is present (AC14)', () => {
		render(HrZones);
		expect(screen.getByRole('button', { name: /about these methods/i })).toBeInTheDocument();
	});

	it('tooltip is hidden before info button is clicked (AC14)', () => {
		render(HrZones);
		expect(screen.queryByRole('tooltip')).toBeNull();
	});

	it('clicking info button shows tooltip (AC14)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('button', { name: /about these methods/i }));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
	});

	it('tooltip contains Max HR and LTHR explanations (AC14)', async () => {
		render(HrZones);
		await fireEvent.click(screen.getByRole('button', { name: /about these methods/i }));
		expect(screen.getByText(/simple percentage-based zones/i)).toBeInTheDocument();
		expect(screen.getByText(/joe friel/i)).toBeInTheDocument();
	});
});
