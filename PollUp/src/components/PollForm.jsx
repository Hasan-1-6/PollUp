import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

function PollFormNew() {
  const [pollHeading, setPollHeading] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closingDays, setClosingDays] = useState(1);
  const [formLink, setFormLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 7) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast.error('Failed to copy link.');
    });
  };

  const handleDaysChange = (change) => {
    setClosingDays(prevDays => Math.max(1, Math.min(7, prevDays + change)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pollData = {
      title: pollHeading,
      options: options.filter(option => option.trim() !== ''),
      expiry: closingDays,
    };

    try {
      const resp = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/makePoll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pollData)
      });
      const data = await resp.json();

      if (!resp.ok) {
        toast.error(`Error making Poll: ${data.message}`);
        setFormLink('');
        return;
      }

      const generatedPollLink = `${window.location.origin}/poll/${data.slug}`;
      setFormLink(generatedPollLink);
      setCopied(false);
      toast.success('Poll created successfully!');

    } catch (err) {
      console.error('Could not generate a Poll:', err);
      toast.error(`Could not generate a Poll: ${err.message}`);
      setFormLink('');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06040f] text-violet-50 overflow-hidden font-sans">

      {/* Background orbs + grid */}
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

      {/* Form container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="rounded-3xl border border-violet-500/20 bg-[#0d0820]/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-violet-950/50 overflow-hidden relative">

            {/* Subtle inner glow */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[320px] h-[120px] rounded-full bg-violet-700/15 blur-3xl" />

            {/* Header */}
            <motion.div variants={fadeUp} custom={0} className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 mb-4 shadow-lg shadow-violet-900/40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-violet-50">
                Create New Poll
              </h2>
              <p className="text-sm text-violet-300/45 mt-2">
                Fill in the details and share your poll in seconds.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit}>

              {/* Poll Heading */}
              <motion.div variants={fadeUp} custom={1} className="mb-6">
                <label htmlFor="pollHeading" className="block text-violet-200/70 text-xs font-semibold mb-2 uppercase tracking-wider">
                  Poll Question
                </label>
                <input
                  type="text"
                  id="pollHeading"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] text-violet-100 placeholder-violet-300/25 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60 transition-all duration-200"
                  placeholder="e.g., What's your favorite color?"
                  value={pollHeading}
                  onChange={(e) => setPollHeading(e.target.value)}
                  required
                />
              </motion.div>

              {/* Options */}
              <motion.div variants={fadeUp} custom={2} className="mb-6">
                <label className="block text-violet-200/70 text-xs font-semibold mb-3 uppercase tracking-wider">
                  Poll Options
                </label>
                <div className="flex flex-col gap-2.5">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-violet-400/40 w-5 text-right">{index + 1}</span>
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] text-violet-100 placeholder-violet-300/25 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60 transition-all duration-200"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition-all duration-200"
                          title="Remove option"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 7 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300/60 hover:text-violet-200 border border-dashed border-violet-500/30 hover:border-violet-500/50 rounded-lg px-3 py-2 transition-all duration-200"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
                    </svg>
                    Add Option
                  </button>
                )}
              </motion.div>

              {/* Closing Days */}
              <motion.div variants={fadeUp} custom={3} className="mb-8">
                <label htmlFor="closingDays" className="block text-violet-200/70 text-xs font-semibold mb-3 uppercase tracking-wider">
                  Poll Closes In (days)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDaysChange(-1)}
                    disabled={closingDays <= 1}
                    className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-violet-200 font-bold flex items-center justify-center hover:bg-white/[0.08] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    id="closingDays"
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-violet-100 px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60 transition-all duration-200 custom-number-input"
                    value={closingDays}
                    onChange={(e) => setClosingDays(Math.max(1, Math.min(7, Number(e.target.value))))}
                    min="1"
                    max="7"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleDaysChange(1)}
                    disabled={closingDays >= 7}
                    className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-violet-200 font-bold flex items-center justify-center hover:bg-white/[0.08] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-violet-300/25 mt-2">Minimum 1 day, maximum 7 days.</p>
              </motion.div>

              {/* Submit */}
              <motion.div variants={fadeUp} custom={4}>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-violet-900/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.75 10.818v4.561a.75.75 0 01-1.5 0V10.818L7.785 12.28a.75.75 0 01-1.07-1.06l3.75-3.75a.75.75 0 011.07 0l3.75 3.75a.75.75 0 01-1.07 1.06l-1.465-1.462z" />
                  </svg>
                  Create Poll
                </button>
              </motion.div>

              {/* Generated Link */}
              {formLink && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 rounded-xl border border-violet-500/20 bg-white/[0.03] p-4 flex flex-col sm:flex-row items-center gap-3"
                >
                  <p className="flex-1 text-sm text-violet-200/70 break-all font-mono text-xs">{formLink}</p>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      copied
                        ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                        : 'bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.236.016L3.18 7.53a.75.75 0 011.06-1.06l2.5 2.5 4.5-6.75a.75.75 0 011.176-.844z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" />
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PollFormNew;
