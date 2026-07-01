import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import PacePage from './+page.svelte';

afterEach(() => {
	cleanup();
});

function getMinkmInput() {
	return screen.getByLabelText('Pace', { selector: '#pace-minkm' });
}

function getMinmileInput() {
	return screen.getByLabelText('Pace', { selector: '#pace-minmile' });
}

function getKmhInput() {
	return screen.getByLabelText('Speed');
}

async function typeInto(input: Element, value: string) {
	await fireEvent.input(input, { target: { value } });
}

describe('Pace Calculator page', () => {
	describe('rendering', () => {
		it('renders the page heading via ToolLayout', () => {
			render(PacePage);
			expect(screen.getByRole('heading', { level: 1, name: 'Pace Calculator' })).toBeInTheDocument();
		});

		it('renders the description via ToolLayout', () => {
			render(PacePage);
			expect(
				screen.getByText('Convert between min/km, min/mile, km/h and mph instantly.')
			).toBeInTheDocument();
		});

		it('renders the back-to-home link', () => {
			render(PacePage);
			expect(screen.getByRole('link', { name: /all tools/i })).toHaveAttribute('href', '/');
		});

		it('renders the min/km input with unit label', () => {
			render(PacePage);
			expect(getMinkmInput()).toBeInTheDocument();
			expect(screen.getByText('min/km')).toBeInTheDocument();
		});

		it('renders the min/mile input with unit label', () => {
			render(PacePage);
			expect(getMinmileInput()).toBeInTheDocument();
			expect(screen.getByText('min/mile')).toBeInTheDocument();
		});

		it('renders the km/h input with unit label', () => {
			render(PacePage);
			expect(getKmhInput()).toBeInTheDocument();
			expect(screen.getByText('km/h')).toBeInTheDocument();
		});

		it('renders mph, per 400 m, per 800 m output labels', () => {
			render(PacePage);
			expect(screen.getByText('mph')).toBeInTheDocument();
			expect(screen.getByText('per 400 m')).toBeInTheDocument();
			expect(screen.getByText('per 800 m')).toBeInTheDocument();
		});

		it('shows em-dash for all outputs when no input entered', () => {
			render(PacePage);
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBe(3);
		});
	});

	describe('min/km → cross-update', () => {
		it('typing 5:30 in min/km updates min/mile to 8:51', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			expect(getMinmileInput()).toHaveValue('8:51');
		});

		it('typing 5:30 in min/km updates km/h to 10.9', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			expect(getKmhInput()).toHaveValue(10.9);
		});

		it('typing 5:30 in min/km shows 6.8 for mph', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			expect(screen.getByText('6.8')).toBeInTheDocument();
		});

		it('typing 5:30 in min/km shows 2:12 for per 400 m', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			expect(screen.getByText('2:12')).toBeInTheDocument();
		});

		it('typing 5:30 in min/km shows 4:24 for per 800 m', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			expect(screen.getByText('4:24')).toBeInTheDocument();
		});
	});

	describe('min/mile → cross-update', () => {
		it('typing 8:51 in min/mile updates min/km to 5:30', async () => {
			render(PacePage);
			await typeInto(getMinmileInput(), '8:51');
			expect(getMinkmInput()).toHaveValue('5:30');
		});

		it('typing 8:51 in min/mile updates km/h to 10.9', async () => {
			render(PacePage);
			await typeInto(getMinmileInput(), '8:51');
			expect(getKmhInput()).toHaveValue(10.9);
		});

		it('typing 8:51 in min/mile shows 6.8 for mph', async () => {
			render(PacePage);
			await typeInto(getMinmileInput(), '8:51');
			expect(screen.getByText('6.8')).toBeInTheDocument();
		});
	});

	describe('km/h → cross-update', () => {
		it('typing 10.9 in km/h updates min/km to 5:30', async () => {
			render(PacePage);
			await typeInto(getKmhInput(), '10.9');
			expect(getMinkmInput()).toHaveValue('5:30');
		});

		it('typing 10.9 in km/h updates min/mile to 8:52', async () => {
			render(PacePage);
			await typeInto(getKmhInput(), '10.9');
			// 10.9 km/h → 5.504587 min/km → 8.858 min/mile → rounds to 8:52
			expect(getMinmileInput()).toHaveValue('8:52');
		});

		it('typing 10.9 in km/h shows 6.8 for mph', async () => {
			render(PacePage);
			await typeInto(getKmhInput(), '10.9');
			expect(screen.getByText('6.8')).toBeInTheDocument();
		});
	});

	describe('clearing', () => {
		it('clearing min/km clears min/mile and km/h', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			await typeInto(getMinkmInput(), '');
			expect(getMinmileInput()).toHaveValue('');
			expect(getKmhInput()).toHaveValue(null);
		});

		it('clearing min/km resets outputs to em-dash', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:30');
			await typeInto(getMinkmInput(), '');
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBe(3);
		});
	});

	describe('edge cases', () => {
		it('invalid text input does not crash — outputs show em-dash', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), 'abc');
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBe(3);
		});

		it('seconds >= 60 is treated as invalid', async () => {
			render(PacePage);
			await typeInto(getMinkmInput(), '5:60');
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBe(3);
		});

		it('zero km/h does not crash', async () => {
			render(PacePage);
			await typeInto(getKmhInput(), '0');
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBe(3);
		});
	});

	describe('accessibility', () => {
		it('pace-minkm input has aria-describedby linking to unit span', () => {
			render(PacePage);
			const input = getMinkmInput();
			expect(input).toHaveAttribute('aria-describedby', 'pace-minkm-unit');
			expect(document.getElementById('pace-minkm-unit')).toHaveTextContent('min/km');
		});

		it('pace-minmile input has aria-describedby linking to unit span', () => {
			render(PacePage);
			const input = getMinmileInput();
			expect(input).toHaveAttribute('aria-describedby', 'pace-minmile-unit');
			expect(document.getElementById('pace-minmile-unit')).toHaveTextContent('min/mile');
		});

		it('pace-kmh input has aria-describedby linking to unit span', () => {
			render(PacePage);
			const input = getKmhInput();
			expect(input).toHaveAttribute('aria-describedby', 'pace-kmh-unit');
			expect(document.getElementById('pace-kmh-unit')).toHaveTextContent('km/h');
		});

		it('min/km and min/mile inputs have inputmode="decimal"', () => {
			render(PacePage);
			expect(getMinkmInput()).toHaveAttribute('inputmode', 'decimal');
			expect(getMinmileInput()).toHaveAttribute('inputmode', 'decimal');
		});
	});
});
