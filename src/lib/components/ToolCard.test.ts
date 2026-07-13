import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import ToolCard from './ToolCard.svelte';

const defaultProps = {
	href: '/pace',
	name: 'Pace Calculator',
	description: 'Convert between min/km, min/mile, and km/h',
	route: '/pace',
	icon: 'pace' as const
};

afterEach(() => {
	cleanup();
});

describe('ToolCard', () => {
	it('renders a link with the correct href', () => {
		render(ToolCard, { props: defaultProps });
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', '/pace');
	});

	it('sets aria-label to "Go to {name}"', () => {
		render(ToolCard, { props: defaultProps });
		expect(screen.getByRole('link', { name: 'Go to Pace Calculator' })).toBeInTheDocument();
	});

	it('renders the tool name', () => {
		render(ToolCard, { props: defaultProps });
		expect(screen.getByText('Pace Calculator')).toBeInTheDocument();
	});

	it('renders the description', () => {
		render(ToolCard, { props: defaultProps });
		expect(screen.getByText('Convert between min/km, min/mile, and km/h')).toBeInTheDocument();
	});

	it('renders the route label', () => {
		render(ToolCard, { props: defaultProps });
		expect(screen.getByText('/pace')).toBeInTheDocument();
	});

	it('renders the trailing arrow', () => {
		render(ToolCard, { props: defaultProps });
		expect(screen.getByText('→')).toBeInTheDocument();
	});

	it('uses border-ink/10 as the base border (dark mode adaptive)', () => {
		render(ToolCard, { props: defaultProps });
		const link = screen.getByRole('link');
		expect(link.className).toMatch(/border-ink\/10/);
	});

	it('includes hover:border-accent class on the link', () => {
		render(ToolCard, { props: defaultProps });
		const link = screen.getByRole('link');
		expect(link.className).toMatch(/hover:border-accent/);
	});

	it('includes focus-visible ring classes on the link', () => {
		render(ToolCard, { props: defaultProps });
		const link = screen.getByRole('link');
		expect(link.className).toMatch(/focus-visible:ring-2/);
		expect(link.className).toMatch(/focus-visible:ring-accent/);
	});
});
