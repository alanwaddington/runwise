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

	it('renders a red asterisk when required prop is true', () => {
		const { container } = render(InputField, { props: { label: 'Distance', id: 'distance', value: 0, required: true } });
		const label = container.querySelector('label');
		expect(label?.textContent).toContain('*');
	});

	it('does not render an asterisk when required prop is false or undefined', () => {
		const { container } = render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, required: false }
		});
		const label = container.querySelector('label');
		expect(label?.textContent).not.toContain('*');
	});

	it('does not show error message when error prop is null', () => {
		render(InputField, { props: { label: 'Distance', id: 'distance', value: 0, error: null } });
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('does not show error message when touched is false even if error prop exists', () => {
		render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, error: 'Must be greater than 0', touched: false }
		});
		expect(screen.queryByText('Must be greater than 0')).not.toBeInTheDocument();
	});

	it('shows error message when error is set and touched is true', () => {
		render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, error: 'Must be greater than 0', touched: true }
		});
		expect(screen.getByText('Must be greater than 0')).toBeInTheDocument();
	});

	it('has aria-describedby pointing to error message id when error and touched are both true', () => {
		render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, error: 'Must be greater than 0', touched: true }
		});
		const input = screen.getByLabelText('Distance');
		expect(input).toHaveAttribute('aria-describedby', 'distance-error');
	});

	it('error message element has aria-live polite attribute', () => {
		const { container } = render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, error: 'Must be greater than 0', touched: true }
		});
		const errorElement = container.querySelector('[id="distance-error"]');
		expect(errorElement).toHaveAttribute('aria-live', 'polite');
	});

	it('applies red border styling when error and touched are both true', () => {
		const { container } = render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, error: 'Must be greater than 0', touched: true }
		});
		const input = container.querySelector('input');
		expect(input?.className).toContain('border-[color:var(--color-error)]');
	});

	it('does not apply red border when touched is false', () => {
		const { container } = render(InputField, {
			props: { label: 'Distance', id: 'distance', value: 0, error: 'Must be greater than 0', touched: false }
		});
		const input = container.querySelector('input');
		expect(input?.className).not.toMatch(/border-\[color:var\(--color-error\)\]/);
	});

	it('combines aria-describedby with unit id when both unit and error exist', () => {
		render(InputField, {
			props: {
				label: 'Distance',
				id: 'distance',
				value: 0,
				unit: 'km',
				error: 'Must be greater than 0',
				touched: true
			}
		});
		const input = screen.getByLabelText('Distance');
		expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('distance-error'));
		expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('distance-unit'));
	});

	it('accepts custom aria-describedby prop', () => {
		render(InputField, {
			props: { label: 'Time', id: 'time', value: '', 'aria-describedby': 'time-help' }
		});
		const input = screen.getByLabelText('Time');
		expect(input).toHaveAttribute('aria-describedby', 'time-help');
	});

	it('prepends custom aria-describedby when unit is provided', () => {
		render(InputField, {
			props: {
				label: 'Pace',
				id: 'pace',
				value: '',
				unit: '/km',
				'aria-describedby': 'pace-help'
			}
		});
		const input = screen.getByLabelText('Pace');
		const describedBy = input.getAttribute('aria-describedby');
		expect(describedBy).toContain('pace-help');
		expect(describedBy).toContain('pace-unit');
		expect(describedBy).toBe('pace-help pace-unit');
	});

	it('prepends custom aria-describedby when error exists', () => {
		render(InputField, {
			props: {
				label: 'Distance',
				id: 'distance',
				value: 0,
				error: 'Must be greater than 0',
				touched: true,
				'aria-describedby': 'distance-help'
			}
		});
		const input = screen.getByLabelText('Distance');
		const describedBy = input.getAttribute('aria-describedby');
		expect(describedBy).toContain('distance-help');
		expect(describedBy).toContain('distance-error');
		expect(describedBy).toBe('distance-help distance-error');
	});

	it('combines custom aria-describedby with error and unit', () => {
		render(InputField, {
			props: {
				label: 'Pace',
				id: 'pace',
				value: '',
				unit: '/km',
				error: 'Invalid format',
				touched: true,
				'aria-describedby': 'pace-help'
			}
		});
		const input = screen.getByLabelText('Pace');
		const describedBy = input.getAttribute('aria-describedby');
		expect(describedBy).toContain('pace-help');
		expect(describedBy).toContain('pace-error');
		expect(describedBy).toContain('pace-unit');
		expect(describedBy).toBe('pace-help pace-error pace-unit');
	});
});
