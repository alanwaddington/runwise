import { writable } from 'svelte/store';

export type ToastVariant = 'success' | 'error';

export interface ToastState {
	message: string;
	variant: ToastVariant;
}

const AUTO_DISMISS_MS: Record<ToastVariant, number> = {
	success: 5000,
	error: 7000
};

export const toast = writable<ToastState | null>(null);

let dismissTimer: ReturnType<typeof setTimeout> | undefined;

/** Shows a toast, replacing any currently visible one. Auto-dismisses after a variant-specific delay. */
export function showToast(message: string, variant: ToastVariant): void {
	if (dismissTimer) clearTimeout(dismissTimer);
	toast.set({ message, variant });
	dismissTimer = setTimeout(() => toast.set(null), AUTO_DISMISS_MS[variant]);
}

export function dismissToast(): void {
	if (dismissTimer) clearTimeout(dismissTimer);
	toast.set(null);
}
