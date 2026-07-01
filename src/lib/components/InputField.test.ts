import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import InputField from './InputField.svelte';

afterEach(() => {
	cleanup();
});

describe('InputField', () => {
	it('associates the label with the input via for/id', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0 } });
		const input = screen.getByLabelText('Distance');
		expect(input).toHaveAttribute('id', 'distance');
	});

	it('is touch-friendly with a minimum height of 48px', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0 } });
		const input = screen.getByLabelText('Distance');
		expect(input.className).toMatch(/h-12/);
	});

	it('defaults to a number input', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0 } });
		const input = screen.getByLabelText('Distance');
		expect(input).toHaveAttribute('type', 'number');
	});

	it('renders as a text input when type is text', () => {
		render(InputField, { props: { label: 'Name', id: 'name', value: '', type: 'text' } });
		const input = screen.getByLabelText('Name');
		expect(input).toHaveAttribute('type', 'text');
	});

	it('renders the unit suffix when provided', () => {
		render(InputField, { props: { label: 'Pace', id: 'pace', value: 0, unit: 'min/km' } });
		expect(screen.getByText('min/km')).toBeInTheDocument();
	});

	it('renders without a unit suffix when not provided', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0 } });
		expect(screen.queryByText('min/km')).not.toBeInTheDocument();
	});

	it('associates the unit suffix with the input via aria-describedby', () => {
		render(InputField, { props: { label: 'Pace', id: 'pace', value: 0, unit: 'min/km' } });
		const input = screen.getByLabelText('Pace');
		const unit = screen.getByText('min/km');
		expect(unit).toHaveAttribute('id', 'pace-unit');
		expect(input).toHaveAttribute('aria-describedby', 'pace-unit');
	});

	it('has no aria-describedby when no unit is provided', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0 } });
		const input = screen.getByLabelText('Distance');
		expect(input).not.toHaveAttribute('aria-describedby');
	});

	it('renders inputmode attribute when provided', () => {
		render(InputField, {
			props: { label: 'Pace', id: 'pace', value: '', type: 'text', inputmode: 'decimal' }
		});
		const input = screen.getByLabelText('Pace');
		expect(input).toHaveAttribute('inputmode', 'decimal');
	});

	it('does not render inputmode attribute when not provided', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0 } });
		const input = screen.getByLabelText('Distance');
		expect(input).not.toHaveAttribute('inputmode');
	});

	it('updates the bound value when the user types', async () => {
		let value = 0;
		render(InputField, {
			props: {
				label: 'Distance',
				id: 'distance',
				get value() {
					return value;
				},
				set value(v) {
					value = v;
				}
			}
		});
		const input = screen.getByLabelText('Distance');
		await fireEvent.input(input, { target: { value: '5' } });
		expect(value).toBe(5);
	});
});
