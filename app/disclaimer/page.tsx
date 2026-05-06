import type { Metadata } from "next";
export const metadata: Metadata = { title: "Disclaimer", description: "AIScribe Disclaimer — important information about our AI-generated content." };
export default function DisclaimerPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Disclaimer</h1>
        <p className="text-zinc-500 mb-10 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="prose dark:prose-invert max-w-none">
          <h2>AI-Generated Content</h2>
          <p>AIScribe uses artificial intelligence to assist in content creation. While we strive to ensure accuracy, AI-generated content may contain errors or inaccuracies. We recommend verifying critical information from official sources before making decisions based on our content.</p>
          <h2>No Professional Advice</h2>
          <p>The information published on AIScribe is for general informational and educational purposes only. It does not constitute professional advice — legal, financial, medical, or otherwise. Always consult a qualified professional for specific advice.</p>
          <h2>Affiliate Disclosure</h2>
          <p>AIScribe may contain affiliate links. If you click on an affiliate link and make a purchase, we may receive a commission at no additional cost to you. We only recommend products and services we genuinely believe are valuable.</p>
          <h2>Advertising</h2>
          <p>AIScribe displays advertisements through Google AdSense. These ads are clearly marked and separate from editorial content. We do not control the content of third-party advertisements.</p>
          <h2>Accuracy of Information</h2>
          <p>Technology evolves rapidly. While we aim to keep our content up-to-date, some information may become outdated over time. Always check for the latest official documentation for technical subjects.</p>
          <h2>External Links</h2>
          <p>Links to external websites are provided for reference. We are not responsible for the content or privacy practices of external sites.</p>
          <h2>Contact</h2>
          <p>If you notice any inaccurate information, please contact us at <a href="mailto:hello@aiscribe.dev">hello@aiscribe.dev</a>.</p>
        </div>
      </div>
    </div>
  );
}
