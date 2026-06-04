import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Link, Preview, Section, Text,
} from "@react-email/components";

interface RecoverDownloadProps {
  customerEmail: string;
  templateTitle: string;
  downloadUrl: string;
  expiresAt: Date;
}

export function RecoverDownload({
  customerEmail,
  templateTitle,
  downloadUrl,
  expiresAt,
}: RecoverDownloadProps) {
  const expiryString = expiresAt.toLocaleString("en-KE", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Html>
      <Head />
      <Preview>New download link for {templateTitle}</Preview>
      <Body style={main}>
        <Container style={container}>

          <Section style={header}>
            <Heading style={logo}>DevCraft</Heading>
            <Text style={tagline}>Premium Web Templates</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>New download link 🔑</Heading>
            <Text style={text}>
              You requested a new download link for <strong>{templateTitle}</strong>.
              Your previous link expired or was already used.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={downloadUrl}>
                Download {templateTitle}
              </Button>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ <strong>Expires {expiryString}.</strong>{" "}
                This link is single-use — it deactivates after your first download.
              </Text>
            </Section>

            <Text style={text}>
              If you need another link in future, visit{" "}
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/recover`}
                style={link}
              >
                devcraft.shop/recover
              </Link>{" "}
              and enter <strong>{customerEmail}</strong>.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Didn't request this? You can safely ignore this email.
              Your original purchase is still valid.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles (same tokens as PurchaseConfirmation) ─────────────────────────────
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};
const container = {
  margin: "0 auto",
  maxWidth: "560px",
  backgroundColor: "#111111",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #222222",
};
const header = {
  backgroundColor: "#0f172a",
  padding: "32px 40px 24px",
  borderBottom: "1px solid #1e293b",
};
const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 4px",
};
const tagline = { color: "#64748b", fontSize: "13px", margin: "0" };
const content = { padding: "40px" };
const h1 = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
};
const text = {
  color: "#94a3b8",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};
const buttonContainer = { textAlign: "center" as const, margin: "0 0 28px" };
const button = {
  backgroundColor: "#10b981",
  color: "#ffffff",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};
const warningBox = {
  backgroundColor: "#1c1917",
  border: "1px solid #292524",
  borderLeft: "3px solid #f59e0b",
  borderRadius: "6px",
  padding: "14px 16px",
  margin: "0 0 24px",
};
const warningText = {
  color: "#fbbf24",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};
const link = { color: "#10b981" };
const hr = { borderColor: "#222222", margin: "24px 0 20px" };
const footer = {
  color: "#475569",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
};