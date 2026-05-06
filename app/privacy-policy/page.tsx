import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", description: "AIScribe Privacy Policy — how we collect, use, and protect your data." };
export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 mb-10 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="prose dark:prose-invert max-w-none">
          <p>At <strong>AIScribe</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.</p>
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, IP address (anonymized)</li>
            <li><strong>Email Address:</strong> If you voluntarily subscribe to our newsletter</li>
            <li><strong>Cookies:</strong> For analytics and personalization (Google Analytics)</li>
          </ul>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our content</li>
            <li>To send newsletters (only with your consent)</li>
            <li>To analyze website traffic and performance</li>
            <li>To display relevant advertisements via Google AdSense</li>
          </ul>
          <h2>Google AdSense</h2>
          <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
          <h2>Google Analytics</h2>
          <p>We use Google Analytics to understand how visitors interact with our site. This service may collect anonymized data about your usage. For more information, see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</p>
          <h2>Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites and encourage you to review their privacy policies.</p>
          <h2>Data Retention</h2>
          <p>Newsletter subscribers can unsubscribe at any time. We retain analytics data in anonymized form for up to 26 months.</p>
          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:hello@aiscribe.dev">hello@aiscribe.dev</a> to exercise these rights.</p>
          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:hello@aiscribe.dev">hello@aiscribe.dev</a>.</p>
        </div>
      </div>
    </div>
  );
}
