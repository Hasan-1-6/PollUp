import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import socket from '../socket/socket.js';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const PollVoteNew = () => {
  const { poll_id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);

  const fetchPollDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/poll/${poll_id}`, {
        method: "GET"
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error('Failed to fetch poll', data.message);
        return;
      }
      setPoll(data);

    } catch (err) {
      console.error('Error fetching poll:', err);
      setError(err.message);
      toast.error(`Error loading poll: ${err.message}`);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPollDetails();
  }, [poll_id, navigate]);

  useEffect(() => {
    socket.emit("join-poll", poll_id);
    socket.on("poll-update", (updatedPoll) => {
      setPoll(updatedPoll);
    });
    return () => {
      socket.off("poll-update");
    };
  }, [poll_id]);

  useEffect(() => {
    checkVoter()
  }, [])

  const checkVoter = async () => {
    if (!localStorage.getItem("deviceId")) return;
    setLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/checkVote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poll_id: poll_id, voter_id: localStorage.getItem("deviceId") })
      });

      const data = await resp.json()
      if (!resp.ok) {
        return;
      }
      console.log(data.voted)
      if (data.voted) setVoted(true)
    }
    catch (err) {
      toast.error(`Error submitting vote: ${err.message}`);
    }
    finally {
      setLoading(false);
    }
  }

  const getDeviceId = () => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("deviceId", id);
    }
    return id
  }

  const handleVote = async () => {
    if (selectedOption) {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ poll_id: poll_id, option_id: selectedOption, voter_id: getDeviceId() }),
        });

        const data = await response.json();

        if (response.status == 403) {
          toast.error("You have voted already !")
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit vote');
        }

        toast.success('Vote submitted successfully!');
        setVoted(true);

        setPoll(data);

      } catch (err) {
        toast.error(`Error submitting vote: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#06040f] text-violet-50 overflow-hidden font-sans flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/3 w-[420px] h-[420px] rounded-full bg-indigo-700/20 blur-[90px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-violet-300/60 text-sm">Loading poll...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-[#06040f] text-violet-50 overflow-hidden font-sans flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-400">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Poll</h2>
          <p className="text-violet-300/50 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="relative min-h-screen bg-[#06040f] text-violet-50 overflow-hidden font-sans flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <h2 className="text-2xl font-bold text-violet-300/40 mb-4">Poll not found</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-violet-900/40 hover:-translate-y-0.5 transition-all"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.voteCount, 0);

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

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5"
      >
        <Link to="/" className="flex items-center gap-2">
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
        </Link>

        <Link
          to='/'
          className="text-sm font-semibold px-4 py-2 rounded-xl border border-white/10 hover:border-violet-500/40 text-violet-300/60 hover:text-violet-200 transition-all"
        >
          ← Back to Home
        </Link>
      </motion.nav>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-16 min-h-[calc(100vh-80px)]">
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
              <h2 className="text-3xl font-extrabold tracking-tight text-violet-50 mb-2">
                {poll.title}
              </h2>
              <p className="text-sm text-violet-300/45">
                {voted ? 'Results are in!' : 'Cast your vote below'}
              </p>
            </motion.div>

            {voted ? (
              /* Results View */
              <motion.div variants={fadeUp} custom={1} className="relative">
                {/* Live indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[11px] font-mono tracking-widest text-green-400">LIVE RESULTS</span>
                </div>

                {/* Results bars */}
                <div className="flex flex-col gap-3 mb-8">
                  {poll.options.map((option, id) => {
                    const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: id * 0.1, duration: 0.5 }}
                        className="relative rounded-xl border border-white/10 overflow-hidden group hover:border-violet-500/30 transition-all duration-200"
                      >
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600/40 to-blue-600/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: id * 0.1, ease: "easeOut" }}
                        />
                        <div className="relative flex items-center justify-between px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-violet-400/40 w-5">{id + 1}</span>
                            <span className="text-sm font-medium text-violet-100">{option.optionTitle}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-violet-400">{percentage}%</span>
                            <span className="text-[11px] text-violet-300/30">{option.voteCount} votes</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Total votes */}
                <div className="text-center mb-6">
                  <p className="text-xs font-mono text-violet-300/30">
                    {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Back to Home button */}
                <motion.button
                  onClick={() => navigate('/')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-violet-900/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                  </svg>
                  Back to Home
                </motion.button>
              </motion.div>
            ) : (
              /* Voting View */
              <motion.div variants={fadeUp} custom={1} className="relative">
                <div className="flex flex-col gap-2.5 mb-8">
                  {poll.options.map((option, index) => (
                    <motion.label
                      key={option._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      htmlFor={`option-${option._id}`}
                      className={`relative flex items-center gap-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedOption === option._id
                          ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-900/20'
                          : 'border-white/10 bg-white/[0.03] hover:border-violet-500/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`option-${option._id}`}
                        name="poll-option"
                        value={option._id}
                        checked={selectedOption === option._id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="hidden peer"
                      />
                      <span className="text-[11px] font-mono text-violet-400/40 w-8 text-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        selectedOption === option._id
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-white/20 bg-white/[0.04]'
                      }`}>
                        {selectedOption === option._id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-white"
                          />
                        )}
                      </div>
                      <span className="text-sm text-violet-100 flex-1">{option.optionTitle}</span>
                    </motion.label>
                  ))}
                </div>

                {/* Vote button */}
                <motion.button
                  onClick={handleVote}
                  disabled={!selectedOption}
                  whileHover={selectedOption ? { scale: 1.02 } : {}}
                  whileTap={selectedOption ? { scale: 0.98 } : {}}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-violet-900/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.26 1.06l-8 12a.75.75 0 01-1.26-.06l-4-8a.75.75 0 111.34-.67L8.5 13.38l7.14-10.71a.75.75 0 011.064-.26z" clipRule="evenodd" />
                  </svg>
                  Submit Vote
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PollVoteNew;
