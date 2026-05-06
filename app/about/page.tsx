import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about AIScribe — the AI-powered tech blog delivering humanized, SEO-optimized articles on technology, AI, and software development.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">
            About <span className="gradient-text">AIScribe</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Your trusted source for AI-powered tech insights
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>What is AIScribe?</h2>
          <p>
            AIScribe is a cutting-edge, AI-powered technology blog dedicated to delivering high-quality, humanized articles on the latest trends in artificial intelligence, web development, machine learning, and software engineering.
          </p>
          <p>
            Unlike traditional blogs, AIScribe uses a sophisticated automation system to continuously discover trending topics, generate in-depth articles, and publish them — all while maintaining the warm, conversational tone of a real human writer.
          </p>

          <h2>Our Mission</h2>
          <p>
            We believe that quality tech content should be accessible to everyone — from beginners just starting their coding journey to seasoned professionals looking for the latest AI breakthroughs.
          </p>
          <p>
            Every article on AIScribe is:
          </p>
          <ul>
            <li><strong>Humanized</strong> — Written to sound like a knowledgeable friend, not a robot</li>
            <li><strong>SEO-optimized</strong> — Structured to help you find exactly what you need</li>
            <li><strong>Beginner-friendly</strong> — Explained with real examples and step-by-step guides</li>
            <li><strong>Up-to-date</strong> — Continuously updated with the latest tech trends</li>
          </ul>

          <h2>Our Technology</h2>
          <p>
            AIScribe is built with a modern, scalable tech stack including Next.js, Supabase, Groq AI, NVIDIA NIM, and Vercel. Our AI pipeline automatically discovers trending topics from Hacker News, Dev.to, Reddit, and GitHub Trending, then generates comprehensive articles optimized for both readers and search engines.
          </p>

          <h2>Content Standards</h2>
          <p>
            Every piece of content on AIScribe follows strict quality guidelines:
          </p>
          <ul>
            <li>Minimum 1,500 words per article</li>
            <li>Fact-checked and technically accurate</li>
            <li>Original content — no plagiarism</li>
            <li>AdSense-safe, family-friendly content</li>
            <li>Regularly updated and refreshed</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            Have questions, suggestions, or partnership inquiries? We&apos;d love to hear from you. Visit our{" "}
            <a href="/contact">Contact page</a> to get in touch.
          </p>
        </div>
      </div>
    </div>
  );
}
