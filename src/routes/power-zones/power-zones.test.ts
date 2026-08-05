import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import PowerZones from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('PowerZones page', () => {
	// ── Rendering ────────────────────────────────────────────────────────────

	it('renders the heading', () => {
		render(PowerZones);
		expect(
			screen.getByRole('heading', { level: 1, name: 'Power Zones Calculator' })
		).toBeInTheDocument();
	});

	it('renders the back-to-home link', () => {
		render(PowerZones);
		expect(screen.getByRole('link', { name: /all tools/i })).toHaveAttribute('href', '/');
	});

	// ── Device selector ──────────────────────────────────────────────────────

	it('renders all four device tabs', () => {
		render(PowerZones);
		expect(screen.getByRole('tab', { name: 'Stryd' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'COROS' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Garmin' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Polar' })).toBeInTheDocument();
	});

	it('Stryd tab is selected by default', () => {
		render(PowerZones);
		expect(screen.getByRole('tab', { name: 'Stryd' })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('tab', { name: 'COROS' })).toHaveAttribute('aria-selected', 'false');
		expect(screen.getByRole('tab', { name: 'Garmin' })).toHaveAttribute('aria-selected', 'false');
		expect(screen.getByRole('tab', { name: 'Polar' })).toHaveAttribute('aria-selected', 'false');
	});

	it('clicking Garmin tab selects it', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		expect(screen.getByRole('tab', { name: 'Garmin' })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('tab', { name: 'Stryd' })).toHaveAttribute('aria-selected', 'false');
	});

	it('pressing ArrowRight cycles through all four devices and wraps around', async () => {
		render(PowerZones);
		const tablist = screen.getByRole('tablist');
		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'COROS' })).toHaveAttribute('aria-selected', 'true');
		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'Garmin' })).toHaveAttribute('aria-selected', 'true');
		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'Polar' })).toHaveAttribute('aria-selected', 'true');
		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(screen.getByRole('tab', { name: 'Stryd' })).toHaveAttribute('aria-selected', 'true');
	});

	it('pressing ArrowLeft from Stryd wraps to Polar', async () => {
		render(PowerZones);
		const tablist = screen.getByRole('tablist');
		await fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
		expect(screen.getByRole('tab', { name: 'Polar' })).toHaveAttribute('aria-selected', 'true');
	});

	// ── Input label swaps per device ────────────────────────────────────────

	it('shows Critical Power (CP) label for Stryd', () => {
		render(PowerZones);
		expect(screen.getByLabelText(/critical power \(cp\)/i)).toBeInTheDocument();
	});

	it('shows Critical Power (CP) label for COROS', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'COROS' }));
		expect(screen.getByLabelText(/critical power \(cp\)/i)).toBeInTheDocument();
	});

	it('shows Threshold Power label for Garmin', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		expect(screen.getByLabelText(/threshold power/i)).toBeInTheDocument();
	});

	it('shows Maximal Aerobic Power (MAP) label for Polar', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Polar' }));
		expect(screen.getByLabelText(/maximal aerobic power \(map\)/i)).toBeInTheDocument();
	});

	it('switching device clears the input value', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		expect(screen.getByLabelText(/threshold power/i)).toHaveValue(null);
	});

	// ── Garmin disclaimer ────────────────────────────────────────────────────

	it('does not show Garmin disclaimer for Stryd', () => {
		render(PowerZones);
		expect(screen.queryByText(/sourced from a third party/i)).toBeNull();
	});

	it('shows Garmin disclaimer when Garmin is selected', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		expect(screen.getByText(/sourced from a third party/i)).toBeInTheDocument();
	});

	it('hides Garmin disclaimer when switching away from Garmin', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		await fireEvent.click(screen.getByRole('tab', { name: 'Polar' }));
		expect(screen.queryByText(/sourced from a third party/i)).toBeNull();
	});

	// ── Validation ───────────────────────────────────────────────────────────

	it('shows range error for a value below 50', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 40, valueAsNumber: 40 } });
		await fireEvent.blur(input);
		expect(screen.getByText(/must be between 50 and 700/i)).toBeInTheDocument();
	});

	it('shows range error for a value above 700', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 701, valueAsNumber: 701 } });
		await fireEvent.blur(input);
		expect(screen.getByText(/must be between 50 and 700/i)).toBeInTheDocument();
	});

	it('does not show a table when the value is out of range', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 40, valueAsNumber: 40 } });
		expect(screen.queryByRole('table')).toBeNull();
	});

	// ── Empty state ───────────────────────────────────────────────────────────

	it('shows empty state when no power entered', () => {
		render(PowerZones);
		expect(
			screen.getByText(/enter your power above to see your training zones/i)
		).toBeInTheDocument();
	});

	it('does not show zone table in empty state', () => {
		render(PowerZones);
		expect(screen.queryByRole('table')).toBeNull();
	});

	// ── Zone table per device ────────────────────────────────────────────────

	it('shows 5 zone rows for Stryd CP 252', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		// 1 header row + 5 main rows + 5 description rows = 11
		expect(screen.getAllByRole('row')).toHaveLength(11);
	});

	it('Stryd CP 252 produces correct Zone 1 range 164-202', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		expect(screen.getByText('164-202')).toBeInTheDocument();
	});

	it('Stryd CP 252 produces correct closed Zone 5 range 290-328', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		expect(screen.getByText('290-328')).toBeInTheDocument();
	});

	it('shows 7 zone rows for Garmin power 300', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		const input = screen.getByLabelText(/threshold power/i);
		await fireEvent.input(input, { target: { value: 300, valueAsNumber: 300 } });
		// 1 header row + 7 main rows + 7 description rows = 15
		expect(screen.getAllByRole('row')).toHaveLength(15);
	});

	it('Garmin power 300 Zone 1 is open-ended low (< 240)', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		const input = screen.getByLabelText(/threshold power/i);
		await fireEvent.input(input, { target: { value: 300, valueAsNumber: 300 } });
		expect(screen.getByText('< 240')).toBeInTheDocument();
	});

	it('Garmin power 300 Zone 7 is open-ended high (> 420)', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		const input = screen.getByLabelText(/threshold power/i);
		await fireEvent.input(input, { target: { value: 300, valueAsNumber: 300 } });
		expect(screen.getByText('> 420')).toBeInTheDocument();
	});

	it('shows 5 zone rows for Polar MAP 300', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Polar' }));
		const input = screen.getByLabelText(/maximal aerobic power \(map\)/i);
		await fireEvent.input(input, { target: { value: 300, valueAsNumber: 300 } });
		expect(screen.getAllByRole('row')).toHaveLength(11);
	});

	it('Polar MAP 300 Zone 5 is open-ended high (> 345)', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Polar' }));
		const input = screen.getByLabelText(/maximal aerobic power \(map\)/i);
		await fireEvent.input(input, { target: { value: 300, valueAsNumber: 300 } });
		expect(screen.getByText('> 345')).toBeInTheDocument();
	});

	it('shows 5 zone rows for COROS CP 252, matching Stryd', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'COROS' }));
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		expect(screen.getByText('164-202')).toBeInTheDocument();
	});

	// ── Reset ────────────────────────────────────────────────────────────────

	it('reset clears the input and returns to empty state', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		await fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
		expect(screen.queryByRole('table')).toBeNull();
		expect(
			screen.getByText(/enter your power above to see your training zones/i)
		).toBeInTheDocument();
	});

	it('reset does not change the selected device', async () => {
		render(PowerZones);
		await fireEvent.click(screen.getByRole('tab', { name: 'Garmin' }));
		const input = screen.getByLabelText(/threshold power/i);
		await fireEvent.input(input, { target: { value: 300, valueAsNumber: 300 } });
		await fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
		expect(screen.getByRole('tab', { name: 'Garmin' })).toHaveAttribute('aria-selected', 'true');
	});

	// ── Footer cross-link ─────────────────────────────────────────────────────

	it('shows Heart Rate Zone Calculator link when results are visible', async () => {
		render(PowerZones);
		const input = screen.getByLabelText(/critical power \(cp\)/i);
		await fireEvent.input(input, { target: { value: 252, valueAsNumber: 252 } });
		const link = screen.getByRole('link', { name: /heart rate zone calculator/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/hr-zones');
	});

	it('does not show Heart Rate Zone Calculator link in empty state', () => {
		render(PowerZones);
		expect(screen.queryByRole('link', { name: /heart rate zone calculator/i })).toBeNull();
	});
});
