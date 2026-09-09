import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Zyntric Systems",
  description: "Terms and conditions for using the Zyntric Systems digital storefront.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or purchasing from the Zyntric Systems storefront, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
      
      <h2>2. Digital Products and Delivery</h2>
      <p>All products are delivered digitally via secure download links. It is your responsibility to ensure the email address provided at checkout is accurate. We are not responsible for failed deliveries due to incorrect email addresses or aggressive spam filters.</p>

      <h2>3. Limitation of Liability</h2>
      <p>Zyntric Systems provides digital products "as is". We are not liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products.</p>

      <h2>4. Governing Law</h2>
      <p>These terms shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.</p>
      
      <p>For questions, contact us at <a href="mailto:hello@zyntric.dev">hello@zyntric.dev</a>.</p>
    </div>
  );
}