"use client";
import { useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type FormState = { name: string; email: string; subject: string; message: string };
const INIT: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactFormClient({
  email,
  facebook,
  instagram,
  followers,
  location,
  channelsTag = "direct channels",
  channelsTitle = "Reach Out",
  formTitle = "Send Us a Message",
  formBtnLabel = "Send Message",
  newsletterTitle,
  newsletterSubtitle,
  subjects,
}: {
  email: string;
  facebook: string;
  instagram: string;
  followers: string;
  location: string;
  channelsTag?: string;
  channelsTitle?: string;
  formTitle?: string;
  formBtnLabel?: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  subjects: string[];
}) {
  const [form, setForm] = useState<FormState>(INIT);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [nlMsg, setNlMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg("Message sent! We'll get back to you soon.");
        setForm(INIT);
      } else {
        setStatus("error");
        setMsg(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNlStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail }),
      });
      const data = await res.json();
      setNlStatus("success");
      setNlMsg(data.message || "Subscribed!");
      setNlEmail("");
    } catch {
      setNlStatus("error");
      setNlMsg("Network error.");
    }
  };

  const contactItems = [
    {
      href: `mailto:${email}`,
      label: "Email",
      value: email,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: facebook,
      label: "Facebook",
      value: "NSUMUNC",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      href: instagram,
      label: "Instagram",
      value: `@nsumunc · ${followers} followers`,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      href: undefined,
      label: "Location",
      value: location,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Left column */}
      <ScrollReveal className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-5">
        <div className="glass rounded-3xl p-6 sm:p-7 border border-white/15">
          <span className="striver-tag mb-2">{channelsTag}</span>
          <h2 className="text-white font-extrabold text-xl mb-5">{channelsTitle}</h2>
          <div className="space-y-4">
            {contactItems.map((item, i) => {
              const inner = (
                <div className="flex items-start gap-3.5 group">
                  <div
                    className="w-10 h-10 glass rounded-xl flex items-center justify-center flex-shrink-0 border border-white/15 mt-0.5 group-hover:border-un-blue-bright transition-colors"
                    style={{ color: "var(--un-blue-bright)" }}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--gold-bright)" }}>
                      {item.label}
                    </div>
                    <div className="text-sm sm:text-base font-medium break-words" style={{ color: "var(--text-base)" }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              );
              return item.href ? (
                <a
                  key={i}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block hover:opacity-95 transition-opacity"
                >
                  {inner}
                </a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>
        </div>

        {/* Newsletter */}
        <div className="glass-gold rounded-3xl p-6 sm:p-7 border" style={{ borderColor: "rgba(251,191,36,0.28)" }}>
          <span className="striver-tag mb-2">newsletter</span>
          <h3 className="text-white font-extrabold text-lg mb-1">{newsletterTitle}</h3>
          <p className="text-sm sm:text-base mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {newsletterSubtitle}
          </p>
          {nlStatus === "success" ? (
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#4ade80" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {nlMsg}
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                required
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-glass flex-1 min-w-0"
              />
              <button
                type="submit"
                disabled={nlStatus === "loading"}
                className="px-4 py-2.5 rounded-xl font-extrabold text-navy flex-shrink-0 transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "var(--gold-bright)" }}
              >
                →
              </button>
            </form>
          )}
          {nlStatus === "error" && (
            <p className="text-xs font-semibold mt-2" style={{ color: "#f87171" }}>
              {nlMsg}
            </p>
          )}
        </div>
      </ScrollReveal>

      {/* Right column — contact form */}
      <ScrollReveal delay={120} className="flex-1 min-w-0">
        <div className="glass rounded-3xl p-6 sm:p-9 border border-white/15 h-full">
          <span className="striver-tag mb-2">write to us</span>
          <h2 className="text-white font-extrabold text-2xl mb-6">{formTitle}</h2>

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-full glass-blue flex items-center justify-center mb-4 animate-pulse-ring border"
                style={{ borderColor: "rgba(56,189,248,0.4)" }}
              >
                <svg className="w-8 h-8" fill="none" stroke="var(--un-blue-bright)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-extrabold text-2xl mb-2">Message Sent!</h3>
              <p className="text-base" style={{ color: "var(--text-muted)" }}>
                {msg}
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 glass rounded-xl px-6 py-2.5 text-sm font-bold border border-white/15 transition-all hover:border-white/30"
                style={{ color: "var(--text-base)" }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Subject
                </label>
                <select
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="input-glass"
                  style={{ background: "rgba(3,6,15,0.88)" }}
                >
                  <option value="">Select a subject…</option>
                  {subjects.map((subj, idx) => (
                    <option key={idx} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Your message…"
                  className="input-glass resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm font-semibold" style={{ color: "#f87171" }}>
                  {msg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="group w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all hover:brightness-110 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                style={{ background: "var(--un-blue)", boxShadow: "0 6px 24px rgba(14,165,233,0.3)" }}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  <>
                    <span>{formBtnLabel}</span>
                    <span className="striver-arrow">↗</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
