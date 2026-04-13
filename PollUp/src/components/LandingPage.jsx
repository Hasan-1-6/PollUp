"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Fraud-proof Voting",
    desc: "Every vote is locked to a unique device fingerprint. One device, one voice — no stuffing, ever.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Real-Time Results",
    desc: "Powered by Socket.IO — tallies update live the instant someone votes. Zero refresh needed.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.031 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "Rate-Limited & Bot-Safe",
    desc: "Intelligent server-side rate limiting stops automated attacks before they corrupt your data.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    title: "Create in Seconds",
    desc: "Build a poll with multiple options and share it instantly. No account required to vote.",
  },
];

const STEPS = [
  { num: "01", title: "Create Your Poll",   desc: "Add a question, drop in your options, go live in under a minute." },
  { num: "02", title: "Share the Link",     desc: "Copy your unique URL and send it anywhere — chat, email, social." },
  { num: "03", title: "Watch Live Results", desc: "See every vote land in real time. Charts update as you watch." },
];

const POLL_OPTIONS = [
  { label: "TypeScript" },
  { label: "JavaScript" },
  { label: "Rust" },
  { label: "Go" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

function PollPreview() {
  const [voted, setVoted] = useState(null);
  const [counts, setCounts] = useState([62, 24, 9, 5]);

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((c) => {
        const i = Math.floor(Math.random() * 4);
        return c.map((v, j) => (j === i ? v + 1 : v));
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl border border-violet-500/25 bg-[#0a0718] p-7 shadow-2xl shadow-violet-950/50">
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="text-[11px] font-mono tracking-widest  text-green-400">LIVE</span>
      </div>

      <p className="text-violet-100 font-semibold text-sm mb-5">
        What's your favourite language in 2025?
      </p>

      <div className="flex flex-col gap-2.5">
        {POLL_OPTIONS.map((opt, i) => {
          const pct = Math.round((counts[i] / total) * 100);
          const isVoted = voted === i;
          return (
            <button
              key={opt.label}
              onClick={() => setVoted(i)}
              className={`relative w-full text-left rounded-lg overflow-hidden border transition-all duration-200 ${
                isVoted ? "border-violet-400/60" : "border-white/10 hover:border-white/20"
              }`}
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600/30 to-blue-600/20"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
              />
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span className="text-xs text-violet-200/80">{opt.label}</span>
                <motion.span
                  key={pct}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-mono text-violet-400"
                >
                  {pct}%
                </motion.span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] font-mono text-violet-300/30">{total} votes · updates live</p>
    </div>
  );
}

export default function LandingPage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  return (
    <div ref={ref} className="relative min-h-screen bg-[#06040f] text-violet-50 overflow-x-hidden font-sans">

      {/* ── Orbs + grid ─────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[420px] h-[420px] rounded-full bg-indigo-700/20 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.05) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
            <rect width="28" height="28" rx="8" fill="url(#navGrad)" />
            <path d="M8 14h4m0 0v-4m0 4v4m4-8h4v4h-4v4h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-base font-bold tracking-tight text-violet-50">PollUp</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-violet-300/50">
          <a href="#features" className="hover:text-violet-100 transition-colors">Features</a>
          <a href="#how"      className="hover:text-violet-100 transition-colors">How it works</a>
        </div>

        <Link
          to='/createPoll'
          className="text-sm font-semibold px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-900/40 hover:-translate-y-0.5 transition-all"
        >
          Create a Poll
        </Link>
        
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-wrap items-center justify-between gap-16 px-6 md:px-12 pt-28 pb-32 max-w-7xl mx-auto">
        <motion.div style={{ y: heroY }} className="flex-1 basis-80 max-w-xl">

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-violet-400 border border-violet-500/30 bg-violet-500/10 rounded-full px-3 py-1 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Socket.IO · Real-Time · Open Voting
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 text-violet-50"
          >
            Polls that{" "}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              can't be rigged.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-lg text-violet-300/50 leading-relaxed mb-10"
          >
            Create any poll in seconds. Share a link. Watch results update live — while
            device-level protection and rate limiting keep every vote honest.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-wrap gap-4"
          >
            <Link
              to='createPoll'
              id="create" href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-violet-900/40 hover:-translate-y-0.5 transition-all"
            >
              Create a Poll
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-violet-500/40 text-violet-300/60 hover:text-violet-200 font-medium text-sm transition-all"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="flex flex-wrap gap-6 mt-12 text-xs font-mono text-violet-300/25"
          >
            <span>✓ No account needed</span>
            <span>✓ Free forever</span>
            <span>✓ Real-time</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 basis-72 flex justify-center"
        >
          <PollPreview />
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-[11px] font-mono tracking-widest uppercase text-blue-400 mb-3">
            Why PollUp
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-violet-50">
            Built for integrity &amp; speed
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/[0.07] hover:border-violet-500/35 bg-white/[0.03] hover:bg-white/[0.05] p-6 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/30 to-blue-600/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform duration-200">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-violet-100 mb-2">{f.title}</h3>
              <p className="text-xs text-violet-300/45 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how" className="relative z-10 px-6 md:px-12 py-24 max-w-4xl mx-auto">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-[11px] font-mono tracking-widest uppercase text-indigo-400 mb-3">
            Simple by design
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-violet-50">
            Three steps to your first poll
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={stagger}
          className="grid md:grid-cols-3 gap-10 text-center"
        >
          {STEPS.map((s, i) => (
            <motion.div key={s.num} variants={fadeUp} custom={i}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-700 flex items-center justify-center text-base font-black font-mono text-white mx-auto mb-5 shadow-lg shadow-violet-900/40">
                {s.num}
              </div>
              <h3 className="font-semibold text-sm text-violet-100 mb-2">{s.title}</h3>
              <p className="text-xs text-violet-300/45 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-violet-500/20 bg-[#0d0820] p-16 text-center overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-violet-700/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-blue-700/20 blur-3xl" />

          <p className="relative text-[11px] font-mono tracking-widest uppercase text-violet-400 mb-4">Ready?</p>
          <h2 className="relative text-4xl md:text-5xl font-extrabold tracking-tight text-violet-50 mb-4">
            Your poll is{" "}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              30 seconds away.
            </span>
          </h2>
          <p className="relative text-violet-300/50 text-base max-w-md mx-auto mb-10 leading-relaxed">
            No sign-up, no setup, no nonsense. Honest, real-time voting — protected from the very first vote.
          </p>
          <Link
            to='createPoll'
            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-base shadow-2xl shadow-violet-900/50 hover:-translate-y-0.5 transition-all"
          >
            Create Your First Poll →
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-7 flex flex-wrap items-center justify-between gap-4 text-xs text-violet-300/25">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
            <rect width="28" height="28" rx="8" fill="url(#ftGrad)" />
            <path d="M8 14h4m0 0v-4m0 4v4m4-8h4v4h-4v4h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="ftGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <span>PollUp · Real-time. Honest. Instant.</span>
        </div>
        <span>© {new Date().getFullYear()} PollUp. All rights reserved.</span>
      </footer>

    </div>
  );
}
