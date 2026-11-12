"use client";
import { useState } from "react";
import Link from "next/link";
import FluidCanvas from "@/components/motion/FluidCanvas";
import CardSpotlight from "@/components/motion/CardSpotlight";

export default function RegistrationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nsuId: "",
    department: "School of Business & Economics (SBE)",
    program: "Recruitment 15 — General Membership",
    preferredCommittee: "UN Security Council (UNSC)",
    motivation: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const programs = [
    {
      id: "recruitment15",
      title: "Recruitment 15 — General Membership",
      tag: "Recruitment Cycle",
      deadline: "December 30, 2026",
      fee: "Free (Exclusive for NSU Students)",
      eligibility: "Undergraduate Students of NSU (All Semesters)",
      description: "Join the premier Model UN club of Bangladesh. Undergo 4-phase Member Development Programs (MDPs), committee simulations, and team assignments.",
      badge: "Open Now",
    },
    {
      id: "nsuimun2027",
      title: "NSUIMUN 2027 — Delegate Registration",
      tag: "Flagship International MUN",
      deadline: "January 15, 2027",
      fee: "Delegate: 2,500 BDT · International: $45 USD",
      eligibility: "High School, College & University Students Worldwide",
      description: "The 6th Edition of Bangladesh's premier MUN conference. 8 specialized committees, world-renowned guest chairs, and 5-star diplomatic gala socials.",
      badge: "Early Bird",
    },
    {
      id: "workshop-crisis",
      title: "MDP Crisis Simulation Bootcamp",
      tag: "Training Workshop",
      deadline: "December 15, 2026",
      fee: "Free for Registered Members",
      eligibility: "NSUMUNC Active Members & Trainees",
      description: "Intensive 1-day crisis maneuvering simulation with live press briefings, emergency directives, and backchannel negotiations.",
      badge: "Members Only",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-4 mesh-bg agency-grid-bg overflow-hidden">
        <FluidCanvas />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-3 animate-fade-in-down">
            <span className="striver-tag">portal · delegate &amp; member onboarding</span>
          </div>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5 animate-fade-in-up tracking-tight leading-[1.08]">
            Event &amp; Delegate <span className="gradient-text">Registration</span>
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto animate-fade-in-up stagger-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Apply for upcoming recruitment cycles, flagship NSUIMUN delegate allocations, and member training bootcamps.
          </p>
        </div>
      </section>

      {/* Available Programs Grid */}
      <section className="py-20 px-4" style={{ background: "var(--navy-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="striver-tag mb-2">active enrollment</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Select Your Program</h2>
            <p className="text-sm sm:text-base mt-2" style={{ color: "var(--text-muted)" }}>
              Choose an active recruitment cycle or conference registration below to begin your application.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {programs.map((p) => (
              <CardSpotlight key={p.id} glowColor="rgba(14, 165, 233, 0.2)" className="rounded-2xl border border-white/15 h-full">
                <div className="glass rounded-[inherit] p-7 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge glass-blue text-[10px]" style={{ color: "var(--un-blue-bright)" }}>
                        {p.badge}
                      </span>
                      <span className="text-xs font-mono text-white/50">{p.tag}</span>
                    </div>

                    <h3 className="text-white font-extrabold text-xl mb-3">{p.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                      {p.description}
                    </p>

                    <div className="space-y-2 text-xs border-t border-white/10 pt-4 mb-6" style={{ color: "var(--text-muted)" }}>
                      <div className="flex justify-between">
                        <span className="text-white/50">Deadline:</span>
                        <span className="text-white font-medium">{p.deadline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Fee:</span>
                        <span className="font-semibold" style={{ color: "var(--gold-bright)" }}>
                          {p.fee}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Eligibility:</span>
                        <span className="text-white text-right font-medium max-w-[60%]">{p.eligibility}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, program: p.title }));
                      document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3 rounded-xl glass font-bold text-xs sm:text-sm hover:border-gold/40 transition-colors text-center"
                    style={{ color: "var(--gold-bright)" }}
                  >
                    Select &amp; Register Below ↓
                  </button>
                </div>
              </CardSpotlight>
            ))}
          </div>

          {/* Registration Form */}
          <div id="registration-form" className="max-w-3xl mx-auto glass rounded-3xl p-8 sm:p-12 border border-white/15 scroll-mt-28">
            <div className="text-center mb-8">
              <span className="striver-tag mb-2">application form</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Delegate &amp; Membership Intake</h3>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Selected: <span className="font-bold text-white">{form.program}</span>
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl glass-gold border border-gold/40 text-center animate-fade-in">
                <div className="text-4xl mb-3">✓</div>
                <h4 className="text-2xl font-extrabold text-white mb-2">Application Received!</h4>
                <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                  Thank you, <span className="text-white font-bold">{form.name}</span>. Your registration for{" "}
                  <span className="text-white font-bold">{form.program}</span> has been logged. Our delegate affairs team will review your application and email interview details to{" "}
                  <span className="font-mono text-gold">{form.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl glass font-semibold text-xs hover:border-gold/40"
                  style={{ color: "var(--gold-bright)" }}
                >
                  Register for another program
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-un-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane.doe@northsouth.edu"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-un-blue text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+880 1700-000000"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-un-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                      NSU Student ID (or Institution) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nsuId}
                      onChange={(e) => setForm({ ...form, nsuId: e.target.value })}
                      placeholder="231 0000 042"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-un-blue text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                      School / Department
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white bg-navy focus:outline-none focus:border-un-blue text-sm"
                    >
                      <option value="School of Business & Economics (SBE)">School of Business &amp; Economics (SBE)</option>
                      <option value="School of Humanities & Social Sciences (SHSS)">School of Humanities &amp; Social Sciences (SHSS)</option>
                      <option value="School of Engineering & Physical Sciences (SEPS)">School of Engineering &amp; Physical Sciences (SEPS)</option>
                      <option value="School of Health & Life Sciences (SHLS)">School of Health &amp; Life Sciences (SHLS)</option>
                      <option value="External School / University">External School / University</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                      Preferred Committee
                    </label>
                    <select
                      value={form.preferredCommittee}
                      onChange={(e) => setForm({ ...form, preferredCommittee: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white bg-navy focus:outline-none focus:border-un-blue text-sm"
                    >
                      <option value="UN Security Council (UNSC)">UN Security Council (UNSC)</option>
                      <option value="UN General Assembly (DISEC / SOCHUM)">UN General Assembly (DISEC / SOCHUM)</option>
                      <option value="UN Human Rights Council (UNHRC)">UN Human Rights Council (UNHRC)</option>
                      <option value="Crisis Cabinet Simulation">Crisis Cabinet Simulation</option>
                      <option value="International Press Corps (IPC)">International Press Corps (IPC)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                    Why do you wish to join or delegate? (Brief Motivation)
                  </label>
                  <textarea
                    rows={3}
                    value={form.motivation}
                    onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    placeholder="Tell us about your public speaking or diplomacy interests..."
                    className="w-full px-4 py-3 rounded-xl glass border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-un-blue text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-un-blue hover:brightness-110 transition-all text-white shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{loading ? "Submitting Application…" : "Complete Registration"}</span>
                    <span>↗</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Support Strip */}
      <section className="py-12 px-4 border-t border-white/10" style={{ background: "var(--navy-surface)" }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-white font-bold text-base">Have questions regarding delegate fees or allocations?</div>
            <div className="text-xs text-white/60 mt-0.5">Our Delegate Affairs team is available 24/7 for assistance.</div>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl glass border border-white/15 text-xs font-bold hover:border-gold/40"
            style={{ color: "var(--gold-bright)" }}
          >
            Contact Secretariat Support →
          </Link>
        </div>
      </section>
    </div>
  );
}
