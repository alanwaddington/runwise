import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import TrainingPaces from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('TrainingPaces page', () => {
	it('renders the heading', () => {
		render(TrainingPaces);
		expect(
			screen.getByRole('heading', { level: 1, name: 'Training Pace Calculator' })
		).toBeInTheDocument();
	});

	it('renders the distance select with standard options', () => {
		render(TrainingPaces);
		const select = screen.getByRole('combobox', { name: /race distance/i });
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: '5K' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Marathon' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: /custom/i })).toBeInTheDocument();
	});

	it('renders the time input', () => {
		render(TrainingPaces);
		expect(screen.getByLabelText(/race time/i)).toBeInTheDocument();
	});

	it('shows empty state when no time is entered', () => {
		render(TrainingPaces);
		expect(
			screen.getByText(/enter a race result above to see your training paces/i)
		).toBeInTheDocument();
	});

	it('does not show the results table initially', () => {
		render(TrainingPaces);
		expect(screen.queryByRole('table')).toBeNull();
	});

	it('shows the results table when a valid time is entered', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByRole('table')).toBeInTheDocument();
	});

	it('hides the empty state when a valid time is entered', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(
			screen.queryByText(/enter a race result above to see your training paces/i)
		).toBeNull();
	});

	it('shows 5 zone pairs in the results table (5 main rows + 5 description rows + 1 header = 11)', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const rows = screen.getAllByRole('row');
		// 1 header + 5 main data rows + 5 description sub-rows = 11
		expect(rows).toHaveLength(11);
	});

	it('table has Zone, Pace/km column headers', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByRole('columnheader', { name: /zone/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /pace\/km/i })).toBeInTheDocument();
	});

	it('hides table and returns to empty state when time is cleared', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		await fireEvent.input(timeInput, { target: { value: '' } });
		expect(screen.queryByRole('table')).toBeNull();
		expect(
			screen.getByText(/enter a race result above to see your training paces/i)
		).toBeInTheDocument();
	});

	it('shows VDOT headline when results are visible', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByText(/your vdot/i)).toBeInTheDocument();
	});

	it('does not show VDOT headline in empty state', () => {
		render(TrainingPaces);
		expect(screen.queryByText(/your vdot/i)).toBeNull();
	});

	it('VDOT value is a number between 20 and 85 for a reasonable time', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		// The VDOT should be displayed numerically — look for a number near 38
		const vdotEl = screen.getByText(/your vdot/i).closest('div');
		expect(vdotEl).not.toBeNull();
		const vdotText = vdotEl!.textContent ?? '';
		const vdotMatch = vdotText.match(/(\d+\.?\d*)/);
		expect(vdotMatch).not.toBeNull();
		const vdot = parseFloat(vdotMatch![1]);
		expect(vdot).toBeGreaterThan(20);
		expect(vdot).toBeLessThan(85);
	});

	it('shows out-of-range message for an extremely slow time', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		// 5K in 80 minutes is VDOT < 20
		await fireEvent.input(timeInput, { target: { value: '1:20:00' } });
		expect(screen.getByText(/outside the supported range/i)).toBeInTheDocument();
	});

	it('does not show the table for an out-of-range time', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '1:20:00' } });
		expect(screen.queryByRole('table')).toBeNull();
	});

	it('custom km input is present in the DOM initially', () => {
		render(TrainingPaces);
		expect(screen.queryByLabelText(/custom distance/i)).toBeInTheDocument();
	});

	it('selecting Custom reveals the custom km label', async () => {
		render(TrainingPaces);
		const select = screen.getByRole('combobox', { name: /race distance/i });
		await fireEvent.change(select, { target: { value: 'Custom' } });
		expect(screen.getByLabelText(/custom distance/i)).toBeInTheDocument();
	});

	it('custom distance with valid time shows results', async () => {
		render(TrainingPaces);
		const select = screen.getByRole('combobox', { name: /race distance/i });
		await fireEvent.change(select, { target: { value: 'Custom' } });
		const customInput = screen.getByLabelText(/custom distance/i);
		await fireEvent.input(customInput, { target: { value: '12' } });
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '1:12:00' } });
		expect(screen.getByRole('table')).toBeInTheDocument();
	});

	it('shows zone descriptions in results', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		// Zone descriptions contain text about how to use the pace
		expect(screen.getByText(/conversational/i)).toBeInTheDocument();
	});

	it('shows VO2 max link when results are visible', async () => {
		render(TrainingPaces);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const link = screen.getByRole('link', { name: /vo2 max/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/vo2max');
	});

	it('does not show VO2 max link in empty state', () => {
		render(TrainingPaces);
		expect(screen.queryByRole('link', { name: /vo2 max/i })).toBeNull();
	});
});
