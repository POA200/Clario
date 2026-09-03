import "server-only";

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: {
  to: string;
  resetUrl: string;
  userName?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Clario <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      "[Email Service] RESEND_API_KEY is not configured. Reset URL:",
      resetUrl,
    );
    return { success: true };
  }

  const nameGreeting = userName ? `Hi ${userName},` : "Hello,";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset your Clario password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .logo { text-align: center; margin-bottom: 28px; }
          .logo-text { font-size: 28px; font-weight: 800; color: #2511BF; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 24px; color: #475569; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background-color: #2511BF; color: #ffffff !important; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 50px; }
          .footer { font-size: 13px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          .break-link { word-break: break-all; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="logo-text">Clario</span>
          </div>
          <div class="title">Reset your password</div>
          <p class="text">${nameGreeting}</p>
          <p class="text">We received a request to reset the password for your Clario account. Click the button below to choose a new password:</p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p class="text">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          <div class="footer">
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p class="break-link">${resetUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your Clario password",
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Email Service] Resend API error:", data);
      // Still log reset link for dev fallback
      console.log(`[Email Service] Direct Reset URL: ${resetUrl}`);
      return {
        success: false,
        error: data?.message || "Failed to send reset email",
      };
    }

    console.log(`[Email Service] Password reset email sent to ${to} (ID: ${data.id})`);
    return { success: true };
  } catch (error) {
    console.error("[Email Service] Network error calling Resend API:", error);
    console.log(`[Email Service] Direct Reset URL: ${resetUrl}`);
    return { success: false, error: "Network error sending email" };
  }
}

