import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import IconWarning from './IconWarning.svelte';

afterEach(() => {
	cleanup();
});

describe('IconWarning component', () => {
	it('renders_SVG element', () => {
		const { container } = render(IconWarning);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders_with default size sm', () => {
		const { container } = render(IconWarning);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '16');
		expect(svg).toHaveAttribute('height', '16');
	});

	it('renders_with size md when provided', () => {
		const { container } = render(IconWarning, { props: { size: 'md' } });
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '20');
		expect(svg).toHaveAttribute('height', '20');
	});

	it('has aria-hidden true by default', () => {
		const { container } = render(IconWarning);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('aria-hidden', 'true');
	});

	it('has aria-hidden false when ariaHidden prop is false', () => {
		const { container } = render(IconWarning, { props: { ariaHidden: false } });
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('aria-hidden', 'false');
	});

	it('includes viewBox attribute for scaling', () => {
		const { container } = render(IconWarning);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
	});

	it('renders circle and path elements', () => {
		const { container } = render(IconWarning);
		const circle = container.querySelector('circle');
		const paths = container.querySelectorAll('path');
		expect(circle).toBeInTheDocument();
		expect(paths.length).toBe(2);
	});
});
