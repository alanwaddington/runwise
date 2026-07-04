import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import ToolLayout from './ToolLayout.svelte';

afterEach(() => {
	cleanup();
});

const childSnippet = createRawSnippet(() => ({
	render: () => '<p data-testid="tool-content">Tool content</p>'
}));

describe('ToolLayout', () => {
	it('renders the title as a heading', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', children: childSnippet }
		});
		expect(screen.getByRole('heading', { level: 1, name: 'Pace Calculator' })).toBeInTheDocument();
	});

	it('renders the description', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', children: childSnippet }
		});
		expect(screen.getByText('Work out your pace.')).toBeInTheDocument();
	});

	it('renders a back-to-home link', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', children: childSnippet }
		});
		const back = screen.getByRole('link', { name: /all tools/i });
		expect(back).toHaveAttribute('href', '/');
	});

	it('renders the default slot content inside a bordered card', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', children: childSnippet }
		});
		const content = screen.getByTestId('tool-content');
		expect(content).toBeInTheDocument();
		const card = content.closest('div');
		expect(card?.className).toMatch(/rounded-2xl/);
		expect(card?.className).toMatch(/border/);
	});

	it('renders without crashing when no child content is provided', () => {
		render(ToolLayout, { props: { title: 'Pace Calculator', description: 'Work out your pace.' } });
		expect(screen.getByRole('heading', { level: 1, name: 'Pace Calculator' })).toBeInTheDocument();
	});

	it('renders afterCard snippet content below the bordered card', () => {
		const afterCardSnippet = createRawSnippet(() => ({
			render: () => '<div data-testid="after-card-content">After card</div>'
		}));
		render(ToolLayout, {
			props: {
				title: 'Pace Calculator',
				description: 'Work out your pace.',
				children: childSnippet,
				afterCard: afterCardSnippet
			}
		});
		const afterCardContent = screen.getByTestId('after-card-content');
		expect(afterCardContent).toBeInTheDocument();
		const toolContent = screen.getByTestId('tool-content');
		expect(afterCardContent.compareDocumentPosition(toolContent)).toBe(
			Node.DOCUMENT_POSITION_PRECEDING
		);
	});

	it('renders without afterCard when prop is not provided', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', children: childSnippet }
		});
		expect(screen.queryByTestId('after-card-content')).toBeNull();
	});
});
