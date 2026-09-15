<script lang="ts">
	import IconWarning from './IconWarning.svelte';
</script>

<div
	class="mb-6 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-100 p-3 text-sm text-muted dark:border-gray-700 dark:bg-gray-800"
>
	<IconWarning size="sm" class="mt-0.5 text-subtle" />
	<p>
		<strong class="font-medium text-ink">Not medical advice.</strong> This tool estimates training
		figures from published sports-science methodologies (see
		<a
			href="/about"
			class="rounded-sm text-accent-text underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			>our sourcing</a
		>) for general fitness guidance only. It doesn't replace advice from a doctor or coach — check with
		one before starting a new exercise programme, especially if you have a heart condition or other
		health concerns.
	</p>
</div>
