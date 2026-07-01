import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import HeroSection from './HeroSection.svelte';

afterEach(() => {
	cleanup();
});

describe('HeroSection', () => {
	it('renders the Runwise heading', () => {
		render(HeroSection);
		expect(screen.getByRole('heading', { level: 1, name: 'Runwise' })).toBeInTheDocument();
	});

	it('uses the text-ink design token on the heading', () => {
		render(HeroSection);
		const heading = screen.getByRole('heading', { level: 1, name: 'Runwise' });
		expect(heading.className).toMatch(/text-ink/);
	});

	it('renders the runner icon with src="/favicon.svg"', () => {
		const { container } = render(HeroSection);
		const img = container.querySelector('img');
		expect(img).toHaveAttribute('src', '/favicon.svg');
	});

	it('renders the icon as decorative with aria-hidden and empty alt', () => {
		const { container } = render(HeroSection);
		const img = container.querySelector('img');
		expect(img).toHaveAttribute('aria-hidden', 'true');
		expect(img).toHaveAttribute('alt', '');
	});

	it('renders the icon at 48px', () => {
		const { container } = render(HeroSection);
		const img = container.querySelector('img');
		expect(img).toHaveAttribute('width', '48');
		expect(img).toHaveAttribute('height', '48');
	});

	it('renders the tagline text', () => {
		render(HeroSection);
		expect(screen.getByText(/Running calculators/)).toBeInTheDocument();
	});

	it('wraps "Fast." in a span with text-accent class', () => {
		const { container } = render(HeroSection);
		const accentSpan = container.querySelector('span.text-accent');
		expect(accentSpan).not.toBeNull();
		expect(accentSpan?.textContent).toBe('Fast.');
	});

	it('renders the sub-copy with "No login required"', () => {
		render(HeroSection);
		expect(screen.getByText(/No login required/)).toBeInTheDocument();
	});

	it('renders a horizontal rule separator', () => {
		const { container } = render(HeroSection);
		expect(container.querySelector('hr')).not.toBeNull();
	});
});
