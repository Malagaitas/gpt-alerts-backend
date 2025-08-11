import { Resend } from "resend";

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Alerts <alerts@example.com>";
  if (!key) throw new Error("RESEND_API_KEY not set");

  const resend = new Resend(key);
  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text
  });
  if ((result as any).error) throw new Error(`Resend error: ${(result as any).error?.message || "unknown"}`);
  return result;
}
