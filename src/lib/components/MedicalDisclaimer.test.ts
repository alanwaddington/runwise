import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import MedicalDisclaimer from './MedicalDisclaimer.svelte';

afterEach(() => {
	cleanup();
});

describe('MedicalDisclaimer component', () => {
	it('renders_the not-medical-advice heading text', () => {
		const { getByText } = render(MedicalDisclaimer);
		expect(getByText('Not medical advice.')).toBeInTheDocument();
	});

	it('renders_a link to the About page for sourcing', () => {
		const { getByRole } = render(MedicalDisclaimer);
		const link = getByRole('link', { name: 'our sourcing' });
		expect(link).toHaveAttribute('href', '/about');
	});

	it('renders_advice to check with a doctor before starting a new exercise programme', () => {
		const { container } = render(MedicalDisclaimer);
		const normalized = container.textContent!.replace(/\s+/g, ' ');
		expect(normalized).toMatch(/doctor/i);
		expect(normalized).toMatch(/check with one before starting a new exercise programme/i);
	});
});
