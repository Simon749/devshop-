import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "License Agreement | Zyntric Systems",
  description: "Standard single-user license agreement for digital products purchased from Zyntric Systems.",
};

export default function LicensePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>Extended License Agreement</h1>
      <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Grant of License</h2>
      <p>Upon purchase, Zyntric Systems grants you a non-exclusive, non-transferable, perpetual license to use the digital product for personal or commercial projects, subject to the restrictions below.</p>
      
      <h2>2. Restrictions</h2>
      <ul>
        <li>You may not redistribute, resell, lease, or sublicense the digital product in its original or modified form.</li>
        <li>You may not claim ownership or authorship of the original digital product.</li>
        <li>You may not use the product in any unlawful or malicious manner.</li>
      </ul>

      <h2>3. Refunds</h2>
      <p>Due to the nature of digital products, <strong>all sales are final</strong>. Refunds are only issued at the sole discretion of Zyntric Systems in the event that the product is fundamentally defective and cannot be made functional after reasonable support attempts.</p>

      <h2>4. Updates and Support</h2>
      <p>Minor updates and bug fixes are provided free of charge. Major version upgrades may require a separate purchase. Support is provided via email at <a href="mailto:hello@zyntric.dev">hello@zyntric.dev</a>.</p>
    </div>
  );
}