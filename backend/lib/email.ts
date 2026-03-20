import { Resend } from 'resend';
import * as dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail({
  email,
  workspaceName,
  role,
  inviteLink
}: {
  email: string;
  workspaceName: string;
  role: string;
  inviteLink: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("-----------------------------------------");
    console.log(`[EMAIL MOCK] To: ${email}`);
    console.log(`Subject: Invite to ${workspaceName}`);
    console.log(`Body: You've been invited to join ${workspaceName} as a ${role}.`);
    console.log(`Link: ${inviteLink}`);
    console.log("-----------------------------------------");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'SaaS Scheduler <onboarding@resend.dev>',
      to: [email],
      subject: `Invite to join ${workspaceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a202c;">You've been invited!</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
            You've been invited to join the <strong>${workspaceName}</strong> workspace as a <strong>${role}</strong>.
          </p>
          <div style="margin: 32px 0;">
            <a href="${inviteLink}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">
            If the button doesn't work, you can use this link: <br/>
            <a href="${inviteLink}" style="color: #4f46e5;">${inviteLink}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #a0aec0; font-size: 12px; text-align: center;">
            Sent by SaaS Scheduler. If you didn't expect this, please ignore.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}
