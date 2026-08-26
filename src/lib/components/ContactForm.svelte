<script lang="ts">
	import IconWarning from './IconWarning.svelte';

	const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	type Status = 'idle' | 'sending' | 'success' | 'error';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let honeypot = $state('');

	let nameTouched = $state(false);
	let emailTouched = $state(false);
	let messageTouched = $state(false);

	let status = $state<Status>('idle');
	let errorMessage = $state('');

	const nameError = $derived(name.trim() === '' ? 'Name is required.' : null);
	const emailError = $derived(
		email.trim() === ''
			? 'Email is required.'
			: !EMAIL_PATTERN.test(email.trim())
				? 'Enter a valid email address.'
				: null
	);
	const messageError = $derived(message.trim() === '' ? 'Message is required.' : null);

	const hasErrors = $derived(Boolean(nameError || emailError || messageError));

	async function handleSubmit(e: Event) {
		e.preventDefault();

		nameTouched = true;
		emailTouched = true;
		messageTouched = true;

		if (hasErrors) {
			return;
		}

		status = 'sending';
		errorMessage = '';

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, honeypot })
			});

			const body = await response.json().catch(() => null);

			if (!response.ok) {
				errorMessage = body?.error || 'Something went wrong — please try again.';
				status = 'error';
				return;
			}

			status = 'success';
		} catch {
			errorMessage = 'Something went wrong — please try again.';
			status = 'error';
		}
	}
</script>

{#if status === 'success'}
	<div
		class="flex items-start gap-3 rounded-lg border border-gray-300 bg-bg p-4 dark:border-gray-700"
		role="status"
	>
		<svg
			class="mt-0.5 h-5 w-5 shrink-0 text-accent-text"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.796a1 1 0 011.414 0z"
				clip-rule="evenodd"
			/>
		</svg>
		<p class="text-sm text-ink">Message sent — thanks, we'll get back to you soon.</p>
	</div>
{:else}
	<form onsubmit={handleSubmit} novalidate>
		{#if status === 'error'}
			<div
				class="mb-4 flex items-start gap-2 rounded-lg border border-[color:var(--color-error)] bg-bg p-3 text-sm font-medium text-error"
				role="alert"
			>
				<IconWarning size="sm" class="mt-0.5 shrink-0" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		<!-- Honeypot: hidden from sighted users and removed from the a11y tree/tab order, but
		     present in the DOM/tab order for a naive bot that fills every field. Not display:none,
		     since some spam bots specifically skip display:none fields. -->
		<div class="absolute h-px w-px overflow-hidden" style="clip:rect(0,0,0,0); clip-path:inset(50%);">
			<label for="contact-website">Leave this field blank</label>
			<input
				type="text"
				id="contact-website"
				name="website"
				bind:value={honeypot}
				tabindex="-1"
				autocomplete="off"
				aria-hidden="true"
			/>
		</div>

		<div class="mb-4">
			<label for="contact-name" class="mb-1.5 block text-sm font-medium text-ink">
				Name <span class="text-error">*</span>
			</label>
			<input
				id="contact-name"
				type="text"
				bind:value={name}
				onblur={() => (nameTouched = true)}
				aria-describedby={nameError && nameTouched ? 'contact-name-error' : undefined}
				aria-invalid={nameError && nameTouched ? 'true' : undefined}
				class="h-12 w-full rounded-lg border bg-bg px-3 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
				class:border-gray-300={!(nameError && nameTouched)}
				class:border-[color:var(--color-error)]={nameError && nameTouched}
			/>
			{#if nameError && nameTouched}
				<div id="contact-name-error" class="mt-2 flex items-center gap-2 text-sm font-medium text-error" aria-live="polite">
					{nameError}
				</div>
			{/if}
		</div>

		<div class="mb-4">
			<label for="contact-email" class="mb-1.5 block text-sm font-medium text-ink">
				Email <span class="text-error">*</span>
			</label>
			<input
				id="contact-email"
				type="email"
				bind:value={email}
				onblur={() => (emailTouched = true)}
				aria-describedby={emailError && emailTouched ? 'contact-email-error' : undefined}
				aria-invalid={emailError && emailTouched ? 'true' : undefined}
				class="h-12 w-full rounded-lg border bg-bg px-3 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
				class:border-gray-300={!(emailError && emailTouched)}
				class:border-[color:var(--color-error)]={emailError && emailTouched}
			/>
			{#if emailError && emailTouched}
				<div id="contact-email-error" class="mt-2 flex items-center gap-2 text-sm font-medium text-error" aria-live="polite">
					{emailError}
				</div>
			{/if}
		</div>

		<div class="mb-4">
			<label for="contact-message" class="mb-1.5 block text-sm font-medium text-ink">
				Message <span class="text-error">*</span>
			</label>
			<textarea
				id="contact-message"
				rows="5"
				bind:value={message}
				onblur={() => (messageTouched = true)}
				aria-describedby={messageError && messageTouched ? 'contact-message-error' : undefined}
				aria-invalid={messageError && messageTouched ? 'true' : undefined}
				class="w-full rounded-lg border bg-bg px-3 py-2 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
				class:border-gray-300={!(messageError && messageTouched)}
				class:border-[color:var(--color-error)]={messageError && messageTouched}
			></textarea>
			{#if messageError && messageTouched}
				<div id="contact-message-error" class="mt-2 flex items-center gap-2 text-sm font-medium text-error" aria-live="polite">
					{messageError}
				</div>
			{/if}
		</div>

		<button
			type="submit"
			disabled={status === 'sending'}
			class="h-11 rounded-lg bg-accent-dark px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{status === 'sending' ? 'Sending…' : 'Send message'}
		</button>
	</form>
{/if}
