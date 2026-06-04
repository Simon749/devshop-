import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Link, Preview, Section, Text,
} from "@react-email/components";

interface PurchaseConfirmationProps {
  customerEmail: string;
  templateTitle: string;
  downloadUrl: string;
  expiresAt: Date;
}

export function PurchaseConfirmation({
  customerEmail,
  templateTitle,
  downloadUrl,
  expiresAt,
}: PurchaseConfirmationProps) {
  const expiryString = expiresAt.toLocaleString("en-KE", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Html>
      <Head />
      <Preview>Your download for {templateTitle} is ready</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>DevCraft</Heading>
            <Text style={tagline}>Premium Web Templates</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Heading style={h1}>Your template is ready 🎉</Heading>
            <Text style={text}>
              Thanks for your purchase. Your download link for{" "}
              <strong>{templateTitle}</strong> is below.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={downloadUrl}>
                Download {templateTitle}
              </Button>
            </Section>

            {/* Expiry warning */}
            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ <strong>This link expires on {expiryString}.</strong>{" "}
                Download before then — links are single-use and expire after 24 hours.
              </Text>
            </Section>

            <Text style={text}>
              If your link has expired or you need a new one, visit{" "}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/recover`} style={link}>
                our recovery page
              </Link>{" "}
              and enter <strong>{customerEmail}</strong>.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This is an automated message from DevCraft Marketplace.
              You received this because you purchased a template using this email address.
              All sales are final — digital products are non-refundable upon delivery.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
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
  letterSpacing: "-0.5px",
};
const tagline = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0",
};
const content = { padding: "40px" };
const h1 = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
  letterSpacing: "-0.3px",
};
const text = {
  color: "#94a3b8",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};
const buttonContainer = { textAlign: "center" as const, margin: "0 0 28px" };
const button = {
  backgroundColor: "#6366f1",
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
const link = { color: "#6366f1" };
const hr = { borderColor: "#222222", margin: "24px 0 20px" };
const footer = {
  color: "#475569",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
};