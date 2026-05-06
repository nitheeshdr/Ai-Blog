"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3, FileText, Eye, Users, TrendingUp, Bot,
  Play, RefreshCw, AlertCircle, CheckCircle2, Clock,
  Zap, ExternalLink, ChevronRight, LogOut
} from "lucide-react";
import type { AdminStats, AutomationLog } from "@/types";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [automating, setAutomating] = useState(false);
  const [automateResult, setAutomateResult] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_email");
    router.replace("/admin/login");
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      console.error("Failed to fetch stats");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerAutomation = async (action: string, keyword?: string) => {
    setAutomating(true);
    setAutomateResult(null);
    try {
      const res = await fetch("/api/automation/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, keyword }),
      });
      const data = await res.json();
      setAutomateResult(
        data.success
          ? `✅ ${data.generation?.data?.title ?? "Article generated successfully!"}`
          : `❌ Error: ${data.error}`
      );
      await fetchStats();
    } catch {
      setAutomateResult("❌ Network error");
    }
    setAutomating(false);
  };

  const statCards = stats
    ? [
        { label: "Total Posts", value: stats.totalPosts, icon: FileText, color: "indigo" },
        { label: "Published", value: stats.publishedPosts, icon: CheckCircle2, color: "green" },
        { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "blue" },
        { label: "Subscribers", value: stats.totalSubscribers, icon: Users, color: "purple" },
        { label: "Pending Topics", value: stats.pendingTopics, icon: TrendingUp, color: "orange" },
        { label: "Avg SEO Score", value: `${stats.avgSeoScore}%`, icon: BarChart3, color: "emerald" },
      ]
    : [];

  const logStatusIcon = (status: string) => {
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status === "running") return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    return <Clock className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <AdminAuthGuard>
    <div className="min-h-screen pt-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-zinc-500 mt-1">Automation control center</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/nitheeshdr/Ai-Blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.82.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg> GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{card.label}</span>
                  <card.icon className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Automation Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-6">
                <Bot className="w-5 h-5 text-indigo-500" />
                <h2 className="font-bold text-zinc-900 dark:text-white">Automation Controls</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => triggerAutomation("full")}
                  disabled={automating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-60"
                >
                  {automating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {automating ? "Generating..." : "Generate Article Now"}
                </button>
                <button
                  onClick={() => triggerAutomation("fetch-topics")}
                  disabled={automating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:border-indigo-300 transition-all disabled:opacity-60"
                >
                  <TrendingUp className="w-4 h-4" /> Fetch Trending Topics
                </button>
                <button
                  onClick={async () => {
                    const keyword = prompt("Enter custom keyword:");
                    if (keyword) triggerAutomation("generate", keyword);
                  }}
                  disabled={automating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:border-indigo-300 transition-all disabled:opacity-60"
                >
                  <Play className="w-4 h-4" /> Custom Keyword
                </button>
              </div>
              {automateResult && (
                <div className={cn(
                  "mt-4 p-3 rounded-xl text-sm",
                  automateResult.startsWith("✅")
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                )}>
                  {automateResult}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { href: "/blog", label: "View Blog" },
                  { href: "/api/trending", label: "Trending Topics API" },
                  { href: "/sitemap.xml", label: "Sitemap XML" },
                  { href: "/api/analytics", label: "Analytics API" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm text-zinc-700 dark:text-zinc-300 group"
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Automation Logs */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full">
              <h2 className="font-bold text-zinc-900 dark:text-white mb-6">Automation Logs</h2>
              {!loading && stats?.recentLogs && stats.recentLogs.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentLogs.map((log: AutomationLog) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50"
                    >
                      <div className="mt-0.5">{logStatusIcon(log.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {log.message ?? log.type}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                          <span>{log.api_used ?? "—"}</span>
                          {log.duration_ms > 0 && <span>{(log.duration_ms / 1000).toFixed(1)}s</span>}
                          <span>{relativeTime(log.created_at)}</span>
                        </div>
                      </div>
                      <span className={cn(
                        "shrink-0 px-2 py-0.5 rounded-full text-xs font-medium",
                        log.status === "success" ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" :
                        log.status === "failed" ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" :
                        log.status === "running" ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400" :
                        "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      )}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
                  <Bot className="w-12 h-12 mb-3 opacity-30" />
                  <p>No automation logs yet</p>
                  <p className="text-sm">Click &quot;Generate Article Now&quot; to start</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminAuthGuard>
  );
}
