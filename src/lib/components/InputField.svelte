<script lang="ts">
	import IconWarning from './IconWarning.svelte';

	interface Props {
		/** Visible label describing the field, associated to the input via `for`/`id`. */
		label: string;
		/** Unique id shared by the label and input. */
		id: string;
		/** The current field value, two-way bound by the parent. */
		value: number | string;
		/** Optional unit shown inline at the right edge of the input, e.g. "min/km" or "bpm". */
		unit?: string;
		/** Input type. Defaults to `'number'`. */
		type?: 'number' | 'text';
		/** Step increment for number inputs. */
		step?: number;
		placeholder?: string;
		/** Mobile keyboard hint, e.g. "decimal" for numeric input on text fields. */
		inputmode?: 'decimal' | 'numeric' | 'text' | 'none' | 'tel' | 'search' | 'email' | 'url';
		/** Whether this field is required. Shows a red asterisk if true. */
		required?: boolean;
		/** Error message to display. Only shown if touched is true. */
		error?: string | null;
		/** Whether the field has been interacted with. Controls error message visibility. */
		touched?: boolean;
		/** oninput event handler */
		oninput?: (e: Event) => void;
		/** onblur event handler */
		onblur?: (e: Event) => void;
		/** Custom aria-describedby value(s) to associate with help text or other descriptions. */
		'aria-describedby'?: string;
	}

	let { label, id, value = $bindable(), unit, type = 'number', step, placeholder, inputmode, required, error, touched, oninput, onblur, 'aria-describedby': ariaDescribedBy }: Props =
		$props();

	const descriptionIds = $derived.by(() => {
		const ids: string[] = [];
		if (ariaDescribedBy) {
			ids.push(ariaDescribedBy);
		}
		if (error && touched) {
			ids.push(`${id}-error`);
		}
		if (unit) {
			ids.push(`${id}-unit`);
		}
		return ids.length > 0 ? ids.join(' ') : undefined;
	});

	const computedAriaLabel = $derived(required ? `${label}, required` : label);

	const hasError = $derived(error && touched);
</script>

<div class="mb-4">
	<label for={id} class="mb-1.5 block text-sm font-medium text-ink">
		{label}
		{#if required}
			<span class="text-error">*</span>
		{/if}
	</label>
	<div class="relative">
		<input
			{id}
			{type}
			{step}
			{placeholder}
			{inputmode}
			bind:value
			{oninput}
			{onblur}
			aria-label={computedAriaLabel}
			aria-describedby={descriptionIds}
			aria-invalid={hasError ? 'true' : undefined}
			class="h-12 w-full rounded-lg border bg-bg px-3 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
			class:border-gray-300={!hasError}
			class:border-[color:var(--color-error)]={hasError}
			class:dark:border-gray-700={!hasError}
			class:pr-14={unit}
			class:pr-16={hasError && unit}
		/>
		{#if unit}
			<span
				id="{id}-unit"
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted"
				class:right-8={hasError}
			>
				{unit}
			</span>
		{/if}
		{#if hasError}
			<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
				<IconWarning size="sm" class="text-error" />
			</div>
		{/if}
	</div>
	{#if hasError}
		<div
			id="{id}-error"
			class="mt-2 flex items-center gap-2 text-sm font-medium text-error"
			aria-live="polite"
		>
			{error}
		</div>
	{/if}
</div>
