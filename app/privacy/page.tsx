import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Zyntric Systems",
  description: "How Zyntric Systems collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Information We Collect</h2>
      <p>When you make a purchase, we collect your name, email address, and transaction details. Payment processing is handled securely by third-party providers (Paystack / M-Pesa); we do not store your full credit card or mobile money PIN details on our servers.</p>
      
      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process and deliver your digital purchases.</li>
        <li>To send you transaction receipts and essential product updates.</li>
        <li>To provide customer support.</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell, trade, or rent your personal information to third parties. Data is only shared with payment processors and email delivery services strictly to fulfill your order.</p>

      <h2>4. Your Rights</h2>
      <p>You have the right to request access to, correction of, or deletion of your personal data. Contact us at <a href="mailto:hello@zyntric.dev">hello@zyntric.dev</a> to exercise these rights.</p>
    </div>
  );
}