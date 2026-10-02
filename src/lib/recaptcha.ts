/**
 * Google reCAPTCHA Verification Service
 * Handles server-side validation of reCAPTCHA tokens using the secret key.
 */

export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  bypassed?: boolean;
}

export async function verifyRecaptcha(token?: string): Promise<RecaptchaVerificationResult> {
  const secretKey =
    process.env.RECAPTCHA_SECRET_KEY || '6LfVttotAAAAAEwX0VSvA0QzNx3W-tD7vqWTePz2';

  if (!token) {
    return {
      success: false,
      'error-codes': ['missing-input-response'],
    };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('reCAPTCHA verification request error:', error);
    return {
      success: false,
      'error-codes': ['connection-error'],
    };
  }
}
