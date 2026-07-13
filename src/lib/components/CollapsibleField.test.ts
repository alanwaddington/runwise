import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import CollapsibleField from './CollapsibleField.svelte';

afterEach(() => {
	cleanup();
});

const childSnippet = createRawSnippet(() => ({
	render: () => '<p data-testid="field-content">Field content</p>'
}));

describe('CollapsibleField', () => {
	it('applies collapsed classes, aria-hidden, and inert when expanded is false', () => {
		render(CollapsibleField, { props: { expanded: false, children: childSnippet } });
		const wrapper = screen.getByTestId('field-content').parentElement as HTMLDivElement;
		expect(wrapper.className).toMatch(/max-h-0/);
		expect(wrapper.className).toMatch(/opacity-0/);
		expect(wrapper).toHaveAttribute('aria-hidden', 'true');
		// `inert` is a reflected IDL property; Svelte sets it via the property setter rather
		// than setAttribute, so jsdom's DOM doesn't surface it via toHaveAttribute.
		expect(wrapper.inert).toBe(true);
	});

	it('applies expanded classes and no aria-hidden/inert when expanded is true', () => {
		render(CollapsibleField, { props: { expanded: true, children: childSnippet } });
		const wrapper = screen.getByTestId('field-content').parentElement as HTMLDivElement;
		expect(wrapper.className).toMatch(/max-h-40/);
		expect(wrapper.className).toMatch(/opacity-100/);
		expect(wrapper.className).toMatch(/mb-4/);
		expect(wrapper).not.toHaveAttribute('aria-hidden');
		expect(wrapper.inert).toBe(false);
	});

	it('always has the overflow-hidden and transition classes regardless of expanded state', () => {
		render(CollapsibleField, { props: { expanded: false, children: childSnippet } });
		const wrapper = screen.getByTestId('field-content').parentElement;
		expect(wrapper?.className).toMatch(/overflow-hidden/);
		expect(wrapper?.className).toMatch(/transition-all/);
		expect(wrapper?.className).toMatch(/duration-200/);
	});

	it('keeps child content in the DOM when collapsed', () => {
		render(CollapsibleField, { props: { expanded: false, children: childSnippet } });
		expect(screen.getByTestId('field-content')).toBeInTheDocument();
	});

	it('keeps child content in the DOM when expanded', () => {
		render(CollapsibleField, { props: { expanded: true, children: childSnippet } });
		expect(screen.getByTestId('field-content')).toBeInTheDocument();
	});

	it('renders arbitrary snippet content, not just a specific field type', () => {
		const otherSnippet = createRawSnippet(() => ({
			render: () => '<span data-testid="other-content">Some other content</span>'
		}));
		render(CollapsibleField, { props: { expanded: true, children: otherSnippet } });
		expect(screen.getByTestId('other-content')).toBeInTheDocument();
	});
});
