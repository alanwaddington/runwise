import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { getConsent } from './consent';

export const consentBannerVisible = writable(browser ? getConsent() === null : false);
