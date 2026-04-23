import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'BLOGG <noreply@yourdomain.com>';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BLOGG</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a12;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a12;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#a78bfa,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#7c3aed;">
                BLOGG
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#0f0f17;border:1px solid #1e1e2a;border-radius:16px;padding:40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#334155;">
                © ${new Date().getFullYear()} BLOGG — You're receiving this because you signed up.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationEmailHtml(username: string, token: string): string {
  const url = `${BASE_URL}/verify-email?token=${token}`;
  return emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f1f5f9;">
      Verify your email
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
      Hi <strong style="color:#c4b5fd;">${username}</strong>, welcome to BLOGG!<br/>
      Click the button below to verify your email address. This link expires in <strong style="color:#f1f5f9;">24 hours</strong>.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="border-radius:12px;background:linear-gradient(135deg,#7c3aed,#6d28d9);">
          <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#475569;">
      Or copy this link into your browser:
    </p>
    <p style="margin:0;font-size:12px;color:#7c3aed;word-break:break-all;">
      ${url}
    </p>

    <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
    <p style="margin:0;font-size:13px;color:#475569;">
      If you didn't create a BLOGG account, you can safely ignore this email.
    </p>
  `);
}

export function welcomeEmailHtml(username: string): string {
  return emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f1f5f9;">
      You're all set! 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
      Hi <strong style="color:#c4b5fd;">${username}</strong>, your email is verified and your account is ready.<br/>
      Start writing and sharing your ideas with the world.
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:12px;background:linear-gradient(135deg,#7c3aed,#6d28d9);">
          <a href="${BASE_URL}/blogs/new" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
            Write your first post
          </a>
        </td>
      </tr>
    </table>
  `);
}

export async function sendVerificationEmail(email: string, username: string, token: string) {
  if (!resend) {
    console.log(`[Email skipped — no RESEND_API_KEY] Verification link: ${BASE_URL}/verify-email?token=${token}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your BLOGG email address',
    html: verificationEmailHtml(username, token),
  });
}

export async function sendWelcomeEmail(email: string, username: string) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to BLOGG!',
    html: welcomeEmailHtml(username),
  });
}
