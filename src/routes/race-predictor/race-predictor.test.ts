import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import RacePredictor from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('RacePredictor page', () => {
	it('renders the heading', () => {
		render(RacePredictor);
		expect(screen.getByRole('heading', { level: 1, name: 'Race Time Predictor' })).toBeInTheDocument();
	});

	it('renders the distance select with standard options', () => {
		render(RacePredictor);
		const select = screen.getByRole('combobox', { name: /known distance/i });
		expect(select).toBeInTheDocument();
		expect(screen.getByRole('option', { name: '5K' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Marathon' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: /custom/i })).toBeInTheDocument();
	});

	it('renders the time input', () => {
		render(RacePredictor);
		expect(screen.getByLabelText(/known time/i)).toBeInTheDocument();
	});

	it('shows empty state when no time is entered', () => {
		render(RacePredictor);
		expect(
			screen.getByText(/enter a race result above to see your predictions/i)
		).toBeInTheDocument();
	});

	it('does not show the results table initially', () => {
		render(RacePredictor);
		expect(screen.queryByRole('table')).toBeNull();
	});

	it('shows the results table when a valid time is entered', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByRole('table')).toBeInTheDocument();
	});

	it('hides the empty state when a valid time is entered', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(
			screen.queryByText(/enter a race result above to see your predictions/i)
		).toBeNull();
	});

	it('shows 6 data rows for standard distances', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const rows = screen.getAllByRole('row');
		// 1 header row + 6 data rows
		expect(rows).toHaveLength(7);
	});

	it('table has Distance, Time column headers', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByRole('columnheader', { name: /distance/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /time/i })).toBeInTheDocument();
	});

	it('hides table and returns to empty state when time is cleared', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		await fireEvent.input(timeInput, { target: { value: '' } });
		expect(screen.queryByRole('table')).toBeNull();
		expect(
			screen.getByText(/enter a race result above to see your predictions/i)
		).toBeInTheDocument();
	});

	it('custom km input is not visible initially', () => {
		render(RacePredictor);
		// The custom input exists in the DOM but is hidden (max-h-0/opacity-0)
		// It should not have a visible label accessible by default
		const customInput = screen.queryByLabelText(/custom distance/i);
		// It exists but is visually hidden via max-h-0
		expect(customInput).toBeInTheDocument();
	});

	it('selecting Custom reveals the custom km label', async () => {
		render(RacePredictor);
		const select = screen.getByRole('combobox', { name: /known distance/i });
		await fireEvent.change(select, { target: { value: 'Custom' } });
		expect(screen.getByLabelText(/custom distance/i)).toBeInTheDocument();
	});

	it('shows 7 rows when custom distance is entered alongside valid time', async () => {
		render(RacePredictor);
		const select = screen.getByRole('combobox', { name: /known distance/i });
		await fireEvent.change(select, { target: { value: 'Custom' } });
		const customInput = screen.getByLabelText(/custom distance/i);
		await fireEvent.input(customInput, { target: { value: '12' } });
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const rows = screen.getAllByRole('row');
		// 1 header + 7 data rows (6 standard + 1 custom)
		expect(rows).toHaveLength(8);
	});

	it('shows the Riegel formula footer note when results are visible', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByText(/riegel formula/i)).toBeInTheDocument();
	});

	it('5K row shows 25:00 time when 25:00 5K is the known result', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByText('25:00')).toBeInTheDocument();
	});

	it('shows VO2 max link with href="/vo2max" when results are visible', async () => {
		render(RacePredictor);
		const timeInput = screen.getByLabelText(/known time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const link = screen.getByRole('link', { name: /vo2 max/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/vo2max');
	});

	it('does not show VO2 max link in empty state', () => {
		render(RacePredictor);
		expect(screen.queryByRole('link', { name: /vo2 max/i })).toBeNull();
	});
});
