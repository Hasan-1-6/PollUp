import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import toast
import socket from '../socket/socket.js'

const PollVote = () => {
  const { poll_id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);

  const fetchPollDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/poll/${poll_id}`, {
        method : "GET"
      }); // Assuming singular 'poll' for fetch
      const data = await response.json();


      if (!response.ok) {
        toast.error('Failed to fetch poll', data.message);
        return;
      }
      setPoll(data); // Assuming backend returns { poll: ... }

    } catch (err) {
      console.error('Error fetching poll:', err);
      setError(err.message);
      toast.error(`Error loading poll: ${err.message}`);
      navigate('/404'); // Redirect to 404 if poll not found or error
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
  return () => { //cleanup function to remove listeners when changing component
    socket.off("poll-update");
  };
}, [poll_id]);

  useEffect(() => {
    checkVoter()
  }, [])

  const checkVoter = async () => {
    if(!localStorage.getItem("deviceId")) return;
    setLoading(true);
    try{
       const resp = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/checkVote`, { // Assuming singular 'poll' for vote
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ poll_id : poll_id , voter_id : localStorage.getItem("deviceId")})
        });
        
        const data = await resp.json()
        if(!resp.ok){
          return;
        }
        console.log(data.voted)
        if(data.voted) setVoted(true)
    }
    catch (err) {
      toast.error(`Error submitting vote: ${err.message}`);
    }
    finally { 
      setLoading(false);
    }
  }

  const getDeviceId = () =>{
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("deviceId", id);
    }
    return id
  }
  
  const handleVote = async () => { // Make handleVote async to handle backend call
    if (selectedOption) {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/vote`, { // Assuming singular 'poll' for vote
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ poll_id : poll_id , option_id: selectedOption, voter_id : getDeviceId()}),
        });

        const data = await response.json();

        if(response.status == 403){
          toast.error("You have voted already !")
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit vote');
        }


        toast.success('Vote submitted successfully!');
        setVoted(true);

        setPoll(data);
        // setPoll(prevPoll => ({
        //   ...prevPoll,
        //   options: prevPoll.options.map(opt =>
        //     opt._id === selectedOption ? { ...opt, voteCount: opt.voteCount + 1 } : opt
        //   ),
        // }));

      } catch (err) {
        toast.error(`Error submitting vote: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center p-4 text-white">Loading poll details...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!poll) {
    return <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center p-4 text-gray-400">Poll not found.</div>;
  }

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.voteCount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">{poll.title}</h2>
        {voted ? (
          <div className="poll-results mt-6">
            {poll.options.map((option, id) => (
              <div key={id} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-200 text-lg">{option.optionTitle}</span>
                  <span className="text-gray-400 text-sm">{option.voteCount} votes</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(option.voteCount / (totalVotes || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate('/')}
              className="mt-8 w-full bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg transform hover:scale-105 transition duration-300"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="poll-options">
            {poll.options.map(option => (
              <label
                key={option._id}
                htmlFor={`option-${option._id}`}
                className="flex items-center p-3 mb-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-all duration-200 ease-in-out"
              >
                <input
                  type="radio"
                  id={`option-${option._id}`} // Corrected to option._id
                  name="poll-option"
                  value={option._id}
                  checked={selectedOption === option._id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="hidden peer"
                />
                <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-gray-700 flex items-center justify-center transition-all duration-200 ease-in-out peer-checked:bg-purple-600 peer-checked:border-purple-600 mr-3">
                  <div className="w-3 h-3 rounded-full bg-white opacity-0 transition-all duration-200 ease-in-out peer-checked:opacity-100"></div>
                </div>
                <span className="text-gray-200 text-lg">{option.optionTitle}</span>
              </label>
            ))}
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className="mt-6 w-full bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollVote;