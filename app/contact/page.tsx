"use client";
import { useState } from "react";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate form submission — in production, connect to Resend/Supabase
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Questions, feedback, or partnership opportunities? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@aiscribe.dev", href: "mailto:hello@aiscribe.dev" },
                  { icon: MapPin, label: "Location", value: "Tamil Nadu, India", href: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="font-medium text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors">{item.value}</a>
                      ) : (
                        <p className="font-medium text-zinc-900 dark:text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Response Time</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">We typically respond within 24-48 hours on business days.</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-100/50 dark:shadow-none">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✉️</div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-zinc-500">Thanks for reaching out. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {(["name", "email"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 capitalize">{field}</label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        required
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70"
                >
                  {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
