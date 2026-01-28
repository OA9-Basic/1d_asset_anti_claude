/**
 * Email Service
 * Handles sending transactional emails using Resend
 *
 * Production-ready implementation with Resend.com
 */

import { createLogger } from '@/lib/logger';
import { Resend } from 'resend';

const logger = createLogger('email');

// Email service configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
const REPLY_TO = process.env.REPLY_TO;
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Initialize Resend client (only if API key is available)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Digital Assets Marketplace</div>
            <h2>Welcome to our platform!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <p><a href="${verifyUrl}" class="button">Verify Email</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Digital Assets Marketplace. All rights reserved.</p>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Digital Assets Marketplace</div>
            <h2>Reset your password</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Digital Assets Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  };
}

/**
 * Send an email using Resend
 *
 * In development, if RESEND_API_KEY is not set, emails are logged to console.
 * In production, emails are sent via Resend API.
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // In development without API key, log to console
  if (!resend || process.env.NODE_ENV !== 'production') {
    logger.info({
      to,
      subject: template.subject,
      textLength: template.text?.length || 0,
      htmlLength: template.html.length,
      environment: process.env.NODE_ENV || 'development',
    }, 'Email logged (MOCK mode - set RESEND_API_KEY to send real emails)');

    // In non-production, return success without sending
    if (process.env.NODE_ENV !== 'production') {
      return { success: true };
    }
  }

  // Send email using Resend
  try {
    if (!resend) {
      throw new Error('Resend client not initialized. Set RESEND_API_KEY environment variable.');
    }

    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: REPLY_TO,
    });

    logger.info({
      to,
      subject: template.subject,
      messageId: data?.data?.id,
    }, 'Email sent successfully via Resend');

    return {
      success: true,
      messageId: data?.data?.id,
    };
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      to,
      subject: template.subject,
    }, 'Failed to send email via Resend');

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const template = createVerificationEmail(email, token);
  return sendEmail(email, template);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const template = createPasswordResetEmail(email, token);
  return sendEmail(email, template);
}

/**
 * Withdrawal confirmation email
 */
export function createWithdrawalConfirmationEmail(
  email: string,
  amount: number,
  currency: string,
  status: string
): EmailTemplate {
  return {
    subject: `Withdrawal ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Confirmation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .details { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Digital Assets Marketplace</div>
            <h2>Withdrawal ${status}</h2>
            <div class="details">
              <p><strong>Amount:</strong> ${amount} ${currency}</p>
              <p><strong>Status:</strong> ${status}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Your withdrawal request has been ${status.toLowerCase()}.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Digital Assets Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your withdrawal of ${amount} ${currency} has been ${status.toLowerCase()}.`,
  };
}

/**
 * Contribution confirmation email
 */
export function createContributionConfirmationEmail(
  email: string,
  assetTitle: string,
  amount: number
): EmailTemplate {
  return {
    subject: 'Contribution Confirmation',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contribution Confirmation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .details { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Digital Assets Marketplace</div>
            <h2>Contribution Confirmed!</h2>
            <div class="details">
              <p><strong>Asset:</strong> ${assetTitle}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Thank you for your contribution! You will receive profit shares as the asset generates revenue.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Digital Assets Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `You've successfully contributed $${amount.toFixed(2)} to "${assetTitle}". Thank you!`,
  };
}

