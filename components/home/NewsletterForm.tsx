"use client";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-3 py-6 px-8 rounded-2xl bg-white/10 border border-white/20">
        <span className="text-2xl">🎉</span>
        <p className="text-white font-semibold">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 sm:hidden"
      />
      <div className="flex flex-1 gap-3">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-all disabled:opacity-70 flex items-center gap-2 shrink-0"
        >
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Subscribe
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-300 text-sm text-center w-full">{message}</p>
      )}
    </form>
  );
}
