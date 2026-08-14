import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';

const mockPage = { url: new URL('http://localhost/workouts') };

vi.mock('$app/state', () => ({
	page: mockPage
}));

const mockBuildFitWorkout = vi.fn();
vi.mock('$lib/utils/fit-export', () => ({
	buildFitWorkout: mockBuildFitWorkout
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

	it('renders 5 zones with 3-4 workout cards each by default, plus 3 mixed-zone cards', async () => {
		await fillValidForm();
		for (const zoneLabel of ['E', 'M', 'T', 'I', 'R']) {
			expect(screen.getByLabelText(`Zone ${zoneLabel}`)).toBeInTheDocument();
		}
		// 17 zone workout cards (E:3, M:3, T:3, I:4, R:4) + 3 mixed-zone cards (E+M, M+T, T+I),
		// identified by "Estimated duration" text
		expect(screen.getAllByText(/estimated duration/i)).toHaveLength(20);
	});

	it('renders all 17 workout cards without error at low weekly mileage (regression)', async () => {
		// Regression: 5K/30:22 + 10km/week previously crashed the whole results section with a
		// Svelte each_key_duplicate runtime error — the computed I/R-zone volume was too small
		// for 3 reps at either standard distance, and both workout variants fell back to the
		// same smaller distance, producing an identical label+description pair for the page's
		// keyed {#each}. Reproduces the exact manually-reported input.
		render(Workouts);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '30:22' } });
		const mileageInput = screen.getByLabelText(/weekly training mileage/i);
		await fireEvent.input(mileageInput, { target: { value: '10' } });
		expect(screen.getByText(/your vdot/i)).toBeInTheDocument();
		for (const zoneLabel of ['E', 'M', 'T', 'I', 'R']) {
			expect(screen.getByLabelText(`Zone ${zoneLabel}`)).toBeInTheDocument();
		}
		expect(screen.getAllByText(/estimated duration/i)).toHaveLength(20);
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

	it('shows a per-workout warm-up/cool-down value, not one shared fixed figure', async () => {
		await fillValidForm();
		const warmupLines = screen.getAllByText(/includes a \d+ min warm-up and \d+ min cool-down/i);
		expect(warmupLines).toHaveLength(20);
		const warmupMinutes = warmupLines.map((el) => {
			const match = el.textContent!.match(/includes a (\d+) min warm-up/i);
			return match![1];
		});
		// At least two different values across the 17 cards proves this is genuinely per-workout,
		// not a single shared figure repeated on every card.
		expect(new Set(warmupMinutes).size).toBeGreaterThan(1);
	});

	it('shows warm-up greater than or equal to cool-down on every card, with at least one card strictly greater', async () => {
		await fillValidForm();
		const warmupLines = screen.getAllByText(/includes a \d+ min warm-up and \d+ min cool-down/i);
		let hasStrictlyGreater = false;
		for (const el of warmupLines) {
			const match = el.textContent!.match(/includes a (\d+) min warm-up and (\d+) min cool-down/i);
			const warmup = Number(match![1]);
			const cooldown = Number(match![2]);
			expect(warmup).toBeGreaterThanOrEqual(cooldown);
			if (warmup > cooldown) hasStrictlyGreater = true;
		}
		// Proves the two are genuinely independent on-screen, not just theoretically able to differ.
		expect(hasStrictlyGreater).toBe(true);
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

describe('Download as .FIT workflow', () => {
	beforeEach(() => {
		mockBuildFitWorkout.mockReset();
		window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
		// jsdom attempts (and logs "Not implemented: navigation to another Document" for) a real
		// navigation when a detached <a href> is clicked -- stub click() so the download trigger
		// runs without that console noise; the real click/download behavior is exercised in the
		// browser during manual verification, not by this component test.
		HTMLAnchorElement.prototype.click = vi.fn();
		window.URL.revokeObjectURL = vi.fn();
	});

	async function openFirstWorkoutModal() {
		const { container, ...utils } = render(Workouts);
		const timeInput = screen.getByLabelText(/race time/i);
		await fireEvent.input(timeInput, { target: { value: '25:00' } });
		const mileageInput = screen.getByLabelText(/weekly training mileage/i);
		await fireEvent.input(mileageInput, { target: { value: '80' } });

		const card = container.querySelector('section button[type="button"]') as HTMLButtonElement;
		await fireEvent.click(card);
		return { container, ...utils };
	}

	async function openFirstPowerWorkoutModal() {
		const { container, ...utils } = render(Workouts);
		const powerTab = screen.getByRole('tab', { name: 'Power' });
		await fireEvent.click(powerTab);

		const powerInput = document.getElementById('power') as HTMLInputElement;
		await fireEvent.input(powerInput, { target: { value: '250' } });
		const mileageInput = screen.getByLabelText(/weekly training mileage/i);
		await fireEvent.input(mileageInput, { target: { value: '80' } });

		const card = container.querySelector('section button[type="button"]') as HTMLButtonElement;
		await fireEvent.click(card);
		return { container, ...utils };
	}

	it('Workouts_ClickDownloadWithSuccessfulEncode_ShowsSuccessToast', async () => {
		mockBuildFitWorkout.mockResolvedValueOnce({
			bytes: new Uint8Array([1, 2, 3]),
			filename: 'runwise-regular-easy-run-E-pace.fit'
		});
		await openFirstWorkoutModal();

		const downloadBtn = screen.getByRole('button', { name: /download as \.fit/i });
		await fireEvent.click(downloadBtn);

		const toast = await screen.findByRole('status');
		expect(toast).toHaveTextContent('Downloaded runwise-regular-easy-run-E-pace.fit');
	});

	it('Workouts_ClickDownloadPaceWorkout_CallsBuildFitWorkoutWithPaceKindAndZone', async () => {
		mockBuildFitWorkout.mockResolvedValueOnce({
			bytes: new Uint8Array([1, 2, 3]),
			filename: 'runwise-regular-easy-run-E-pace.fit'
		});
		await openFirstWorkoutModal();

		const downloadBtn = screen.getByRole('button', { name: /download as \.fit/i });
		await fireEvent.click(downloadBtn);
		await screen.findByRole('status');

		expect(mockBuildFitWorkout).toHaveBeenCalledWith(
			expect.objectContaining({ label: 'Regular easy run', kind: 'pace', zone: 'E' })
		);
	});

	it('Workouts_ClickDownloadWithFailedEncode_ShowsFailureToastAndReenablesButton', async () => {
		mockBuildFitWorkout.mockRejectedValueOnce(new Error('boom'));
		await openFirstWorkoutModal();

		const downloadBtn = screen.getByRole('button', { name: /download as \.fit/i });
		await fireEvent.click(downloadBtn);

		const toast = await screen.findByRole('alert');
		expect(toast).toHaveTextContent("Couldn't create the file. Try again.");
		expect(downloadBtn).not.toBeDisabled();
	});

	it('Workouts_ClickDownloadPowerWorkout_CallsBuildFitWorkoutWithPowerKind', async () => {
		mockBuildFitWorkout.mockResolvedValueOnce({
			bytes: new Uint8Array([1, 2, 3]),
			filename: 'runwise-continuous-power.fit'
		});
		await openFirstPowerWorkoutModal();

		const downloadBtn = screen.getByRole('button', { name: /download as \.fit/i });
		await fireEvent.click(downloadBtn);

		const toast = await screen.findByRole('status');
		expect(toast).toHaveTextContent('Downloaded runwise-continuous-power.fit');
		expect(mockBuildFitWorkout).toHaveBeenCalledWith(expect.objectContaining({ kind: 'power' }));
	});

	it('Workouts_ClickDownloadPowerWorkoutWithFailedEncode_ShowsFailureToast', async () => {
		mockBuildFitWorkout.mockRejectedValueOnce(new Error('boom'));
		await openFirstPowerWorkoutModal();

		const downloadBtn = screen.getByRole('button', { name: /download as \.fit/i });
		await fireEvent.click(downloadBtn);

		const toast = await screen.findByRole('alert');
		expect(toast).toHaveTextContent("Couldn't create the file. Try again.");
	});
});

describe('Mode tabs', () => {
	it('always shows Pace, Power, and HR tabs', () => {
		render(Workouts);
		expect(screen.getByRole('tab', { name: 'Pace' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Power' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'HR' })).toBeInTheDocument();
	});

	it('does not show the Race-Prep tab when no race date is entered', () => {
		render(Workouts);
		expect(screen.queryByRole('tab', { name: 'Race-Prep' })).toBeNull();
	});
});

describe('HR mode', () => {
	async function switchToHrMode() {
		render(Workouts);
		await fireEvent.click(screen.getByRole('tab', { name: 'HR' }));
	}

	it('shows the LTHR input when HR tab is selected', async () => {
		await switchToHrMode();
		expect(screen.getByLabelText(/lactate threshold heart rate/i)).toBeInTheDocument();
	});

	it('shows empty state when nothing is entered', async () => {
		await switchToHrMode();
		expect(screen.getByText(/enter your lthr and weekly mileage/i)).toBeInTheDocument();
	});

	it('shows an inline error for an implausible LTHR', async () => {
		await switchToHrMode();
		const lthrInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(lthrInput, { target: { value: '250' } });
		await fireEvent.blur(lthrInput);
		expect(screen.getByText(/must be between 100 and 200/i)).toBeInTheDocument();
	});

	it('shows the LTHR headline and 5 HR zones for valid inputs', async () => {
		await switchToHrMode();
		await fireEvent.input(screen.getByLabelText(/lactate threshold heart rate/i), {
			target: { value: '172' }
		});
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		expect(screen.getByText(/your lthr/i)).toBeInTheDocument();
		expect(screen.getByText('172 bpm')).toBeInTheDocument();
		for (const zoneLabel of ['E', 'M', 'T', 'I', 'R']) {
			expect(screen.getAllByLabelText(`Zone ${zoneLabel}`).length).toBeGreaterThan(0);
		}
	});

	it('shows the fallback-pace notice when no race result has been entered', async () => {
		await switchToHrMode();
		await fireEvent.input(screen.getByLabelText(/lactate threshold heart rate/i), {
			target: { value: '172' }
		});
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		expect(screen.getByText(/durations are estimated using a general easy pace/i)).toBeInTheDocument();
	});

	it('does not show the fallback-pace notice once a race result is entered on the Pace tab', async () => {
		render(Workouts);
		await fireEvent.input(screen.getByLabelText(/race time/i), { target: { value: '25:00' } });
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		await fireEvent.click(screen.getByRole('tab', { name: 'HR' }));
		await fireEvent.input(screen.getByLabelText(/lactate threshold heart rate/i), {
			target: { value: '172' }
		});
		expect(screen.queryByText(/durations are estimated using a general easy pace/i)).toBeNull();
	});
});

describe('Race-Prep mode', () => {
	it('shows the race-date input on the Pace tab', () => {
		render(Workouts);
		expect(screen.getByLabelText(/race date/i)).toBeInTheDocument();
	});

	it('does not show the Race-Prep tab for a race less than 4 weeks away', async () => {
		render(Workouts);
		const soon = new Date();
		soon.setDate(soon.getDate() + 7);
		await fireEvent.input(screen.getByLabelText(/race date/i), {
			target: { value: soon.toISOString().slice(0, 10) }
		});
		expect(screen.queryByRole('tab', { name: 'Race-Prep' })).toBeNull();
		expect(screen.getByText(/unlocks between 4 and 8 weeks out/i)).toBeInTheDocument();
	});

	it('shows the Race-Prep tab for a race 5 weeks away with a valid race result', async () => {
		render(Workouts);
		await fireEvent.input(screen.getByLabelText(/race time/i), { target: { value: '25:00' } });
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		const fiveWeeksOut = new Date();
		fiveWeeksOut.setDate(fiveWeeksOut.getDate() + 35);
		await fireEvent.input(screen.getByLabelText(/race date/i), {
			target: { value: fiveWeeksOut.toISOString().slice(0, 10) }
		});
		expect(screen.getByRole('tab', { name: 'Race-Prep' })).toBeInTheDocument();
	});

	it('shows 4 week sections with the expected phases for a race exactly 4 weeks out', async () => {
		render(Workouts);
		await fireEvent.input(screen.getByLabelText(/race time/i), { target: { value: '25:00' } });
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		const fourWeeksOut = new Date();
		fourWeeksOut.setDate(fourWeeksOut.getDate() + 28);
		await fireEvent.input(screen.getByLabelText(/race date/i), {
			target: { value: fourWeeksOut.toISOString().slice(0, 10) }
		});
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-Prep' }));

		expect(screen.getByText(/week 1: build aerobic base/i)).toBeInTheDocument();
		expect(screen.getByText(/week 2: strength/i)).toBeInTheDocument();
		expect(screen.getByText(/week 3: peak vo2 max/i)).toBeInTheDocument();
		expect(screen.getByText(/week 4: taper/i)).toBeInTheDocument();
	});

	it('scales the plan to 6 weeks (with a repeated Build phase) for a race 6 weeks out', async () => {
		render(Workouts);
		await fireEvent.input(screen.getByLabelText(/race time/i), { target: { value: '25:00' } });
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		const sixWeeksOut = new Date();
		sixWeeksOut.setDate(sixWeeksOut.getDate() + 42);
		await fireEvent.input(screen.getByLabelText(/race date/i), {
			target: { value: sixWeeksOut.toISOString().slice(0, 10) }
		});
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-Prep' }));

		expect(screen.getByText(/week 1: build aerobic base/i)).toBeInTheDocument();
		expect(screen.getByText(/week 2: build aerobic base/i)).toBeInTheDocument();
		expect(screen.getByText(/week 3: strength/i)).toBeInTheDocument();
		expect(screen.getByText(/week 4: strength/i)).toBeInTheDocument();
		expect(screen.getByText(/week 5: peak vo2 max/i)).toBeInTheDocument();
		expect(screen.getByText(/week 6: taper/i)).toBeInTheDocument();
	});

	it('input values persist when toggling away from Race-Prep and back (AC-1.7)', async () => {
		render(Workouts);
		await fireEvent.input(screen.getByLabelText(/race time/i), { target: { value: '25:00' } });
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		const fiveWeeksOut = new Date();
		fiveWeeksOut.setDate(fiveWeeksOut.getDate() + 35);
		await fireEvent.input(screen.getByLabelText(/race date/i), {
			target: { value: fiveWeeksOut.toISOString().slice(0, 10) }
		});
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-Prep' }));
		await fireEvent.click(screen.getByRole('tab', { name: 'Pace' }));

		expect(screen.getByLabelText(/race time/i)).toHaveValue('25:00');
		expect(screen.getByRole('tab', { name: 'Race-Prep' })).toBeInTheDocument();
	});
});

describe('Race-Prep modality (AC-1.6/AC-2.10)', () => {
	async function enterRacePrepEligibleForm() {
		render(Workouts);
		await fireEvent.input(screen.getByLabelText(/race time/i), { target: { value: '25:00' } });
		await fireEvent.input(screen.getByLabelText(/weekly training mileage/i), {
			target: { value: '60' }
		});
		const fourWeeksOut = new Date();
		fourWeeksOut.setDate(fourWeeksOut.getDate() + 28);
		await fireEvent.input(screen.getByLabelText(/race date/i), {
			target: { value: fourWeeksOut.toISOString().slice(0, 10) }
		});
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-Prep' }));
	}

	it('defaults to Pace modality with no extra input required', async () => {
		await enterRacePrepEligibleForm();
		expect(screen.getByRole('tab', { name: 'Race-prep pace modality' })).toHaveAttribute(
			'aria-selected',
			'true'
		);
		expect(screen.getByText(/week 1: build aerobic base/i)).toBeInTheDocument();
	});

	it('shows an empty state until power is entered when Power modality is selected', async () => {
		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep power modality' }));

		expect(screen.getByText(/plus your power/i)).toBeInTheDocument();
		expect(screen.queryByText(/week 1: build aerobic base/i)).toBeNull();
	});

	it('generates a plan once power is entered in Power modality', async () => {
		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep power modality' }));
		const powerInput = document.getElementById('power') as HTMLInputElement;
		await fireEvent.input(powerInput, { target: { value: '250' } });

		expect(screen.getByText(/week 1: build aerobic base/i)).toBeInTheDocument();
	});

	it('shows an empty state until LTHR is entered when HR modality is selected', async () => {
		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep HR modality' }));

		expect(screen.getByText(/plus your lthr/i)).toBeInTheDocument();
		expect(screen.queryByText(/week 1: build aerobic base/i)).toBeNull();
	});

	it('generates a plan once LTHR is entered in HR modality', async () => {
		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep HR modality' }));
		const lthrInput = screen.getByLabelText(/lactate threshold heart rate/i);
		await fireEvent.input(lthrInput, { target: { value: '172' } });

		expect(screen.getByText(/week 1: build aerobic base/i)).toBeInTheDocument();
	});

	it('enables FIT download for a Power-modality race-prep workout card', async () => {
		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep power modality' }));
		await fireEvent.input(document.getElementById('power') as HTMLInputElement, {
			target: { value: '250' }
		});

		const card = document.querySelector('section button[type="button"]') as HTMLButtonElement;
		await fireEvent.click(card);

		expect(screen.getByRole('button', { name: /download as \.fit/i })).toBeInTheDocument();
	});

	it('enables FIT download for an HR-modality race-prep workout card', async () => {
		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep HR modality' }));
		await fireEvent.input(screen.getByLabelText(/lactate threshold heart rate/i), {
			target: { value: '172' }
		});

		const card = document.querySelector('section button[type="button"]') as HTMLButtonElement;
		await fireEvent.click(card);

		expect(screen.getByRole('button', { name: /download as \.fit/i })).toBeInTheDocument();
	});

	it('actually downloads an HR-modality race-prep workout when the FIT button is clicked (regression: was throwing for the plan\'s E-zone build weeks)', async () => {
		mockBuildFitWorkout.mockReset();
		mockBuildFitWorkout.mockResolvedValueOnce({
			bytes: new Uint8Array([1, 2, 3]),
			filename: 'runwise-regular-easy-run-E-hr.fit'
		});
		window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
		HTMLAnchorElement.prototype.click = vi.fn();
		window.URL.revokeObjectURL = vi.fn();

		await enterRacePrepEligibleForm();
		await fireEvent.click(screen.getByRole('tab', { name: 'Race-prep HR modality' }));
		await fireEvent.input(screen.getByLabelText(/lactate threshold heart rate/i), {
			target: { value: '172' }
		});

		// Week 1's first card is a Build-phase E-zone workout (race-prep.ts's phase composition) --
		// the exact case that used to throw, since E is one of Daniels' two open-ended HR zones.
		const card = document.querySelector('section button[type="button"]') as HTMLButtonElement;
		await fireEvent.click(card);

		const downloadBtn = screen.getByRole('button', { name: /download as \.fit/i });
		await fireEvent.click(downloadBtn);

		const toast = await screen.findByRole('status');
		expect(toast).toHaveTextContent('Downloaded runwise-regular-easy-run-E-hr.fit');
		expect(mockBuildFitWorkout).toHaveBeenCalledWith(expect.objectContaining({ kind: 'hr' }));
	});
});

describe('Mixed-zone workouts', () => {
	it('shows the Mixed-Zone Sessions section with 3 cards once results are valid', async () => {
		await fillValidForm();
		expect(screen.getByRole('heading', { name: /mixed-zone sessions/i })).toBeInTheDocument();
		expect(screen.getByText('E+M: Easy Run with Marathon Surges')).toBeInTheDocument();
		expect(screen.getByText('M+T: Marathon Base with Threshold Surges')).toBeInTheDocument();
		expect(screen.getByText('T+I: Threshold Blocks with Fast Pickups')).toBeInTheDocument();
	});

	it('does not show the Mixed-Zone Sessions section in the empty state', () => {
		render(Workouts);
		expect(screen.queryByText(/mixed-zone sessions/i)).toBeNull();
	});
});
