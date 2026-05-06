import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms & Conditions", description: "AIScribe Terms and Conditions of Use." };
export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-zinc-500 mb-10 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="prose dark:prose-invert max-w-none">
          <p>By accessing and using AIScribe (&ldquo;the website&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.</p>
          <h2>Use of Content</h2>
          <p>All content published on AIScribe is for informational and educational purposes only. You may not reproduce, distribute, or republish our content without explicit written permission.</p>
          <h2>Intellectual Property</h2>
          <p>All content, including articles, images, and code examples, is the intellectual property of AIScribe unless otherwise stated. AI-generated content is reviewed and curated by our team.</p>
          <h2>Disclaimer of Warranties</h2>
          <p>AIScribe provides content &ldquo;as is&rdquo; without any warranties. We do not guarantee the accuracy, completeness, or timeliness of any information on this website.</p>
          <h2>Limitation of Liability</h2>
          <p>AIScribe shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or its content.</p>
          <h2>Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. These links are provided for convenience only. We do not endorse or take responsibility for the content of any third-party websites.</p>
          <h2>User Conduct</h2>
          <p>You agree not to use our website for any unlawful purpose or to engage in any conduct that may harm AIScribe or its users.</p>
          <h2>Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>
          <h2>Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Tamil Nadu, India.</p>
          <h2>Contact</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:hello@aiscribe.dev">hello@aiscribe.dev</a>.</p>
        </div>
      </div>
    </div>
  );
}
