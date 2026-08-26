import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import type { ContactSubmissionData } from './contactValidation';

export interface SendEmailResult {
	success: boolean;
	error?: string;
}

export async function sendContactEmail(submission: ContactSubmissionData): Promise<SendEmailResult> {
	try {
		const resend = new Resend(env.RESEND_API_KEY);

		const { error } = await resend.emails.send({
			from: `Runwise contact form <contact@${env.RESEND_EMAIL_DOMAIN}>`,
			to: [env.CONTACT_EMAIL],
			replyTo: submission.email,
			subject: `New contact form message from ${submission.name}`,
			text: `From: ${submission.name} <${submission.email}>\n\n${submission.message}`
		});

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (err) {
		return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
	}
}
