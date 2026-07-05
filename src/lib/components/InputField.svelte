<script lang="ts">
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
	}

	let { label, id, value = $bindable(), unit, type = 'number', step, placeholder, inputmode }: Props =
		$props();
</script>

<div class="mb-4">
	<label for={id} class="mb-1.5 block text-sm font-medium text-ink">{label}</label>
	<div class="relative">
		<input
			{id}
			{type}
			{step}
			{placeholder}
			{inputmode}
			bind:value
			aria-describedby={unit ? `${id}-unit` : undefined}
			class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
			class:pr-14={unit}
		/>
		{#if unit}
			<span
				id="{id}-unit"
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted"
			>
				{unit}
			</span>
		{/if}
	</div>
</div>
