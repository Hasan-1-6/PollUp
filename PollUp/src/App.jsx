import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PollForm from './components/PollForm';

import PollVote from './components/PollVote';

import NotFound from './components/NotFound'; // Import the NotFound component
import LandingPage from "./components/LandingPage"
import { Toaster, toast, useToaster } from 'react-hot-toast'
function App() {
  const router = createBrowserRouter([
    {
      path : "/",
      element : <LandingPage />
    },
    {
      path : "/createPoll",
      element : <PollForm/>
    },
    {
      path : "/poll/:poll_id",
      element : <PollVote />
    },
    {
      path : '*', 
      element : <NotFound />
    }
  ])
  return (
    
    <div className="App">
      <Toaster   
      position = "top-right" 
      toastOptions={{
          style: {
            
            borderRadius: '15px',
            background: '#333',
            color: '#fff',
          },
      }} />
      <RouterProvider router = { router } />
    </div>
  );
}

export default App;



