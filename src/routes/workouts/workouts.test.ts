import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';

const mockPage = { url: new URL('http://localhost/workouts') };

vi.mock('$app/state', () => ({
	page: mockPage
}));

const { default: Workouts } = await import('./+page.svelte');

afterEach(() => {
	cleanup();
	mockPage.url = new URL('http://localhost/workouts');
});

async function fillValidForm() {
	render(Workouts);
	const timeInput = screen.getByLabelText(/race time/i);
	await fireEvent.input(timeInput, { target: { value: '25:00' } });
	const mileageInput = screen.getByLabelText(/weekly training mileage/i);
	await fireEvent.input(mileageInput, { target: { value: '80' } });
	return { timeInput, mileageInput };
}

describe('Workouts page', () => {
	it('renders the heading', () => {
		render(Workouts);
		expect(
			screen.getByRole('heading', { level: 1, name: 'Workout Suggestions' })
		).toBeInTheDocument();
	});

	it('renders the distance select, time input, and weekly mileage input', () => {
		render(Workouts);
		expect(screen.getByRole('combobox', { name: /race distance/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/race time/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/weekly training mileage/i)).toBeInTheDocument();
	});

	it('shows empty state when nothing is entered', () => {
		render(Workouts);
		expect(screen.getByText(/enter a race result and your weekly mileage/i)).toBeInTheDocument();
	});

	it('does not show results with only a race time (missing weekly mileage)', async () => {
		render(Workouts);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.getByText(/enter a race result and your weekly mileage/i)).toBeInTheDocument();
	});

	it('shows results once both race result and weekly mileage are valid', async () => {
		await fillValidForm();
		expect(screen.getByText(/your vdot/i)).toBeInTheDocument();
	});

	it('shows an inline error for an implausible weekly mileage', async () => {
		render(Workouts);
		const mileageInput = screen.getByLabelText(/weekly training mileage/i);
		await fireEvent.input(mileageInput, { target: { value: '500' } });
		await fireEvent.blur(mileageInput);
		expect(screen.getByText(/must be between 1 and 300/i)).toBeInTheDocument();
	});

	it('renders 5 zones with 2 workout cards each by default', async () => {
		await fillValidForm();
		for (const zoneLabel of ['E', 'M', 'T', 'I', 'R']) {
			expect(screen.getByLabelText(`Zone ${zoneLabel}`)).toBeInTheDocument();
		}
		// 10 workout cards total (5 zones x 2), identified by "Estimated duration" text
		expect(screen.getAllByText(/estimated duration/i)).toHaveLength(10);
	});

	it('renders the time-band filter select', async () => {
		await fillValidForm();
		expect(screen.getByRole('combobox', { name: /time available/i })).toBeInTheDocument();
	});

	it('filtering by "Under 30 min" shows a "none fit" message for zones with no short workout', async () => {
		await fillValidForm();
		const filterSelect = screen.getByRole('combobox', { name: /time available/i });
		await fireEvent.change(filterSelect, { target: { value: 'Under 30 min' } });
		expect(screen.getAllByText(/no workout in this zone fits/i).length).toBeGreaterThan(0);
	});

	it('shows the training-paces cross-link once full valid results are visible', async () => {
		await fillValidForm();
		const link = screen.getByRole('link', { name: /view training paces/i });
		expect(link).toHaveAttribute('href', expect.stringContaining('/training-paces?'));
		expect(link).toHaveAttribute('href', expect.stringContaining('distance=5K'));
		expect(link).toHaveAttribute('href', expect.stringContaining('time=25%3A00'));
	});

	it('does not show the cross-link in the empty state', () => {
		render(Workouts);
		expect(screen.queryByRole('link', { name: /view training paces/i })).toBeNull();
	});

	it('does not show the cross-link with only a race result (missing weekly mileage)', async () => {
		render(Workouts);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		expect(screen.queryByRole('link', { name: /view training paces/i })).toBeNull();
	});

	it('does not show the cross-link for an out-of-range race result', async () => {
		render(Workouts);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '1:20:00' } });
		const mileageInput = screen.getByLabelText(/weekly training mileage/i);
		await fireEvent.input(mileageInput, { target: { value: '80' } });
		expect(screen.queryByRole('link', { name: /view training paces/i })).toBeNull();
	});

	it('prefills race fields from valid query params on load', () => {
		mockPage.url = new URL('http://localhost/workouts?distance=10K&time=45:00');
		render(Workouts);
		const select = screen.getByRole('combobox', { name: /race distance/i }) as HTMLSelectElement;
		expect(select.value).toBe('10K');
		expect(screen.getByLabelText(/race time/i)).toHaveValue('45:00');
	});

	it('falls back to the normal empty state for malformed query params', () => {
		mockPage.url = new URL('http://localhost/workouts?distance=Bogus&time=notatime');
		render(Workouts);
		expect(screen.getByText(/enter a race result and your weekly mileage/i)).toBeInTheDocument();
	});

	it('weekly mileage does not carry over from prefilled query params', () => {
		mockPage.url = new URL('http://localhost/workouts?distance=10K&time=45:00');
		render(Workouts);
		expect(screen.getByLabelText(/weekly training mileage/i)).toHaveValue('');
	});

	it('shows out-of-range message for an extremely slow time', async () => {
		render(Workouts);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '1:20:00' } });
		const mileageInput = screen.getByLabelText(/weekly training mileage/i);
		await fireEvent.input(mileageInput, { target: { value: '80' } });
		expect(screen.getByText(/outside the supported range/i)).toBeInTheDocument();
	});
});
