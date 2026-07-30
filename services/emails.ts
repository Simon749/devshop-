// services/emails.ts
import { Resend } from "resend";
import { PurchaseConfirmation } from "@/emails/PurchaseConfirmation";
import { RecoverDownload } from "@/emails/RecoverDownload";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Purchase confirmation ────────────────────────────────────────────────────
export async function sendPurchaseConfirmation({
  customerEmail,
  templateTitle,
  downloadToken,
  expiresAt,
}: {
  customerEmail: string;
  templateTitle: string;
  downloadToken: string;
  expiresAt: Date;
}) {
const downloadUrl = `${APP_URL}/download/${downloadToken}`;   // was /api/download?token=...

  return resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Your download is ready — ${templateTitle}`,
    react: PurchaseConfirmation({
      customerEmail,
      templateTitle,
      downloadUrl,
      expiresAt,
    }),
  });
}

// ── Recovery email ───────────────────────────────────────────────────────────
export async function sendRecoverEmail({
  customerEmail,
  templateTitle,
  downloadToken,
  expiresAt,
}: {
  customerEmail: string;
  templateTitle: string;
  downloadToken: string;
  expiresAt: Date;
}) {
  const downloadUrl = `${APP_URL}/api/download?token=${downloadToken}`;

  return resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `New download link — ${templateTitle}`,
    react: RecoverDownload({
      customerEmail,
      templateTitle,
      downloadUrl,
      expiresAt,
    }),
  });
}

// ── Test helper (used by /api/test-email) ────────────────────────────────────
export async function sendTestEmail(to: string) {
  const fakeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return resend.emails.send({
    from: FROM,
    to,
    subject: "DevCraft — Email system test",
    react: PurchaseConfirmation({
      customerEmail: to,
      templateTitle: "Next.js SaaS Starter",
      downloadUrl: `${APP_URL}/api/download?token=test-token-preview`,
      expiresAt: fakeExpiry,
    }),
  });
}
