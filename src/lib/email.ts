/**
 * Email Service
 * Handles sending transactional emails
 *
 * NOTE: This is a placeholder implementation.
 * For production, integrate with:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - AWS SES
 * - Postmark
 * - Mailgun
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('email');

// Email service configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';
const REPLY_TO = process.env.REPLY_TO;
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Email template types
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Verification email template
export function createVerificationEmail(email: string, token: string): EmailTemplate {
  const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  return {
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to our platform!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <p><a href="${verifyUrl}" class="button">Verify Email</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Verify your email address by visiting: ${verifyUrl}`,
  };
}

// Password reset email template
export function createPasswordResetEmail(email: string, token: string): EmailTemplate {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

  return {
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset your password</h2>
            <p>Click the button below to reset your password:</p>
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  };
}

/**
 * Send an email
 *
 * NOTE: This is a MOCK implementation that logs to console.
 * In production, replace with actual email service integration.
 *
 * Recommended: Resend (https://resend.com)
 * npm install resend
 *
 * Example implementation:
 * ```ts
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * await resend.emails.send({
 *   from: EMAIL_FROM,
 *   to: email,
 *   ...template
 * });
 * ```
 */
export async function sendEmail(
  email: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string }> {
  // DEV: Log email details to console
  logger.info({
    to: email,
    subject: template.subject,
    textLength: template.text?.length || 0,
    htmlLength: template.html.length,
  }, 'Sending email (MOCK - not actually sent)');

  // In production, integrate with email service here
  // For now, just log and return success

  // Example Resend integration (commented out):
  /*
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: REPLY_TO,
    });

    logger.info({ to: email, subject: template.subject }, 'Email sent successfully');
    return { success: true };
  } catch (error) {
    logger.error({ error, to: email }, 'Failed to send email');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
  */

  return { success: true };
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const template = createVerificationEmail(email, token);
  return sendEmail(email, template);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const template = createPasswordResetEmail(email, token);
  return sendEmail(email, template);
}
