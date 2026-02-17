import React, { useState } from 'react';
import toast from 'react-hot-toast';

function PollForm() {
  const [pollHeading, setPollHeading] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closingDays, setClosingDays] = useState(1);
  const [formLink, setFormLink] = useState(''); // State to store the generated poll link
  const [copied, setCopied] = useState(false); // State for copy button feedback
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
      setTimeout(() => setCopied(false), 2000); // Reset "Copied!" message after 2 seconds
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
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify(pollData)
      });
      const data = await resp.json();

      if (!resp.ok) {
        toast.error(`Error making Poll: ${data.message}`);
        setFormLink(''); // Clear link on error
        return;
      }

      // get current link and add slug to it
     
      const generatedPollLink = `${window.location.origin}/poll/${data.slug}`;
      setFormLink(generatedPollLink); // Store the link in state
      setCopied(false); 
      toast.success('Poll created successfully!');

    } catch(err) {
      console.error('Could not generate a Poll:', err);
      toast.error(`Could not generate a Poll: ${err.message}`);
      setFormLink(''); 
    }

 
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Create New Poll</h2>

        {/* Poll Heading */}
        <div className="mb-6">
          <label htmlFor="pollHeading" className="block text-gray-200 text-sm font-semibold mb-2">
            Poll Question/Heading
          </label>
          <input
            type="text"
            id="pollHeading"
            className="shadow-sm appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 placeholder-gray-400"
            placeholder="e.g., What's your favorite color?"
            value={pollHeading}
            onChange={(e) => setPollHeading(e.target.value)}
            required
          />
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-semibold mb-2">
            Poll Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                className="shadow-sm appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 text-sm"
                  title="Remove option"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          {options.length < 7 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-sm"
            >
              Add Option
            </button>
          )}
        </div>


        <div className="mb-8">
          <label htmlFor="closingDays" className="block text-gray-200 text-sm font-semibold mb-2">
            Poll Closes In (days)
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleDaysChange(-1)}
              disabled={closingDays <= 1}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="text"
              id="closingDays"
              className="shadow-sm appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-center custom-number-input"
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
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Minimum 1 day, maximum 7 days.</p>
        </div>

        <button
          type="submit"
          className="w-full bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg transform hover:scale-105 transition duration-300"
        >
          Create Poll
        </button>

        {formLink && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg flex flex-col sm:flex-row items-center justify-between">
            <p className="text-white text-sm break-all mb-2 sm:mb-0 sm:mr-4">{formLink}</p>
            <button
              type="button"
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-lg text-white font-semibold text-sm transition duration-200 ${
                copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default PollForm;
